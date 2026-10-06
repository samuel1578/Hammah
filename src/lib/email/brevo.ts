/**
 * HAMMAH — Brevo transactional transport (server-only)
 *
 * Thin wrapper around the Brevo Transactional API:
 *   POST https://api.brevo.com/v3/smtp/email
 *   header: api-key: <BREVO_API_KEY>
 *
 * Uses native `fetch` (no SDK), matching the existing project style.
 * Every failure is normalised into a `SendEmailResult` and never thrown,
 * so a send can never reject an unrelated request handler. Secrets are
 * never logged.
 */
import { assertServerRuntime } from "./guard";
import { getBrevoApiKey, getBrevoSender } from "./config";
import { getTemplateId, type EmailTemplateKey } from "./templates";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const MAX_ERROR_LENGTH = 500;

export interface SendTemplateEmailParams {
  /** Template registry key, e.g. "order_new_admin". */
  templateKey: EmailTemplateKey;
  /** Recipient email address. */
  to: string;
  /** Optional recipient display name. */
  toName?: string | null;
  /** Brevo template parameters. */
  params?: Record<string, unknown>;
  /** Optional Brevo tags for reporting. */
  tags?: string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId: string | null;
  error: string | null;
}

function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

function truncate(value: string): string {
  return value.length > MAX_ERROR_LENGTH
    ? `${value.slice(0, MAX_ERROR_LENGTH)}…`
    : value;
}

function extractBrevoError(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.length > 0) {
      return record.message;
    }
    if (typeof record.error === "string" && record.error.length > 0) {
      return record.error;
    }
  }
  return null;
}

/**
 * Send one transactional email through a Brevo template.
 *
 * Never throws. Returns a normalised result the caller can log:
 *   { success, messageId, error }
 */
export async function sendTemplateEmail(
  params: SendTemplateEmailParams,
): Promise<SendEmailResult> {
  assertServerRuntime();

  const recipient = params.to?.trim().toLowerCase();
  if (!recipient) {
    return { success: false, messageId: null, error: "Missing recipient email." };
  }

  let apiKey: string;
  let sender: { email: string; name: string };
  let templateId: number;
  try {
    apiKey = getBrevoApiKey();
    sender = getBrevoSender();
    templateId = getTemplateId(params.templateKey);
  } catch (err) {
    // Configuration problem — fail clearly but without throwing.
    return { success: false, messageId: null, error: truncate(toMessage(err)) };
  }

  const body: Record<string, unknown> = {
    sender,
    to: [
      params.toName
        ? { email: recipient, name: params.toName }
        : { email: recipient },
    ],
    templateId,
  };
  if (params.params) body.params = params.params;
  if (params.tags && params.tags.length > 0) body.tags = params.tags;

  let response: Response;
  try {
    response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      success: false,
      messageId: null,
      error: truncate(`Network error contacting Brevo: ${toMessage(err)}`),
    };
  }

  const rawText = await response.text().catch(() => "");
  let parsed: unknown = null;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const apiMessage = extractBrevoError(parsed);
    return {
      success: false,
      messageId: null,
      error: truncate(
        `Brevo rejected the email (HTTP ${response.status})${apiMessage ? `: ${apiMessage}` : ""}`,
      ),
    };
  }

  const messageId =
    parsed && typeof parsed === "object" && typeof (parsed as { messageId?: unknown }).messageId === "string"
      ? ((parsed as { messageId: string }).messageId)
      : null;

  return { success: true, messageId, error: null };
}

export { isBrevoConfigured } from "./config";
