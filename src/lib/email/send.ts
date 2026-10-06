/**
 * HAMMAH — Tracked transactional send helper (server-only)
 *
 * High-level convenience used by future sprints: claim → send → mark.
 * It guarantees every attempted send is recorded in `email_delivery_log`
 * and that duplicate sends (idempotent order retries, once-per-user or
 * once-per-year rules) are prevented before a Brevo call is made.
 *
 * This helper never throws. It is the recommended entry point for
 * Sprints 2–5; `sendTemplateEmail` in `./brevo.ts` remains available for
 * callers that manage their own logging.
 */
import { assertServerRuntime } from "./guard";
import { sendTemplateEmail } from "./brevo";
import {
  buildOrderDedupeKey,
  buildRecipientDedupeKey,
  buildUserDedupeKey,
  claimDelivery,
  markFailed,
  markSent,
  normalizeEmail,
} from "./log";
import type { EmailTemplateKey } from "./templates";

export type TrackedSendStatus = "sent" | "failed" | "duplicate" | "skipped";

export interface SendTrackedTemplateEmailParams {
  templateKey: EmailTemplateKey;
  to: string | null | undefined;
  toName?: string | null;
  params?: Record<string, unknown>;
  tags?: string[];
  userId?: string | null;
  orderId?: string | null;
  /**
   * Explicit idempotency key. Required for yearly-scoped templates such as
   * `birthday` (use `buildYearlyDedupeKey`). When omitted it is derived
   * from order → user → recipient in that order.
   */
  dedupeKey?: string;
  metadata?: Record<string, unknown> | null;
  /** When true, no message is sent or logged (e.g. guest without email). */
  skip?: boolean;
  skipReason?: string;
}

export interface TrackedSendResult {
  status: TrackedSendStatus;
  messageId: string | null;
  error: string | null;
  logId: string | null;
  dedupeKey: string | null;
}

function deriveDedupeKey(
  templateKey: EmailTemplateKey,
  recipient: string,
  userId: string | null,
  orderId: string | null,
): string {
  if (orderId) return buildOrderDedupeKey(templateKey, orderId, recipient);
  if (userId) return buildUserDedupeKey(templateKey, userId, recipient);
  return buildRecipientDedupeKey(templateKey, recipient);
}

export async function sendTrackedTemplateEmail(
  params: SendTrackedTemplateEmailParams,
): Promise<TrackedSendResult> {
  assertServerRuntime();

  const recipient = params.to ? normalizeEmail(params.to) : "";

  // No recipient (e.g. guest order without email) → nothing to send or log,
  // because `email_delivery_log.recipient` is NOT NULL.
  if (params.skip || !recipient) {
    return {
      status: "skipped",
      messageId: null,
      error: params.skipReason ?? (!recipient ? "No recipient email." : null),
      logId: null,
      dedupeKey: null,
    };
  }

  const dedupeKey =
    params.dedupeKey ??
    deriveDedupeKey(
      params.templateKey,
      recipient,
      params.userId ?? null,
      params.orderId ?? null,
    );

  const claim = await claimDelivery({
    templateKey: params.templateKey,
    recipient,
    dedupeKey,
    userId: params.userId ?? null,
    orderId: params.orderId ?? null,
    metadata: params.metadata ?? null,
  });

  if (!claim.claimed) {
    if (claim.reason === "error") {
      return {
        status: "failed",
        messageId: null,
        error: claim.error ?? "Failed to claim delivery.",
        logId: claim.logId,
        dedupeKey,
      };
    }
    if (claim.reason === "already_skipped") {
      return {
        status: "skipped",
        messageId: null,
        error: null,
        logId: claim.logId,
        dedupeKey,
      };
    }
    return {
      status: "duplicate",
      messageId: null,
      error: null,
      logId: claim.logId,
      dedupeKey,
    };
  }

  const logId = claim.logId;
  if (!logId) {
    return {
      status: "failed",
      messageId: null,
      error: "Claimed delivery has no log id.",
      logId: null,
      dedupeKey,
    };
  }

  const send = await sendTemplateEmail({
    templateKey: params.templateKey,
    to: recipient,
    toName: params.toName ?? null,
    params: params.params,
    tags: params.tags,
  });

  if (send.success) {
    await markSent(logId, send.messageId);
    return {
      status: "sent",
      messageId: send.messageId,
      error: null,
      logId,
      dedupeKey,
    };
  }

  await markFailed(logId, send.error);
  return {
    status: "failed",
    messageId: null,
    error: send.error,
    logId,
    dedupeKey,
  };
}
