/**
 * HAMMAH — Email delivery log helpers (server-only)
 *
 * Safe, reusable operations over `public.email_delivery_log`. Designed so
 * future sprints can do:
 *
 *   claim → send → mark sent
 *
 * instead of the race-prone:
 *
 *   check → send → insert
 *
 * `claimDelivery` inserts a `pending` row guarded by a unique `dedupe_key`
 * before any Brevo call. A unique violation means the email is already
 * claimed/sent and must be skipped. A previously `failed` row may be
 * re-claimed so a later run can retry.
 *
 * All functions use the service-role Supabase client (RLS bypass) and are
 * never exposed to the browser. Operations never throw into request
 * handlers; failures are reported through the return value or logged.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { assertServerRuntime } from "./guard";

const MAX_ERROR_LENGTH = 1000;

export type DeliveryStatus = "pending" | "sent" | "failed" | "skipped";

export interface ClaimDeliveryParams {
  templateKey: string;
  recipient: string;
  /** Explicit idempotency key. Required by `claimDelivery`. */
  dedupeKey: string;
  userId?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export type ClaimReason =
  | "claimed"
  | "retry"
  | "already_sent"
  | "in_progress"
  | "already_skipped"
  | "error";

export interface DeliveryClaim {
  claimed: boolean;
  logId: string | null;
  status: DeliveryStatus | null;
  reason: ClaimReason;
  error?: string;
}

export interface DeliveryLogResult {
  ok: boolean;
  error?: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Dedupe key for order-scoped emails: one send per template+order+recipient. */
export function buildOrderDedupeKey(
  templateKey: string,
  orderId: string,
  recipient: string,
): string {
  return `${templateKey}:order:${orderId}:${normalizeEmail(recipient)}`;
}

/** Dedupe key for once-per-user emails (e.g. Hamatee welcome). */
export function buildUserDedupeKey(
  templateKey: string,
  userId: string,
  recipient: string,
): string {
  return `${templateKey}:user:${userId}:${normalizeEmail(recipient)}`;
}

/**
 * Dedupe key for once-per-calendar-year emails keyed by recipient.
 * The year is supplied by the caller and must come from the production
 * timezone policy (Ghana = UTC+0 ⇒ Ghana/UTC year).
 *
 * Retained for compatibility; birthday emails use the stronger
 * user-keyed `buildUserYearDedupeKey` below.
 */
export function buildYearlyDedupeKey(
  templateKey: string,
  recipient: string,
  year: number | string,
): string {
  return `${templateKey}:year:${year}:${normalizeEmail(recipient)}`;
}

/**
 * Dedupe key for once-per-user-per-calendar-year emails (birthday).
 *
 * Format: `<templateKey>:user:<userId>:year:<YYYY>`
 * e.g. `birthday:user:550e8400-e29b-41d4-a716-446655440000:year:2026`
 *
 * Keyed on the stable user id rather than the email address, because a
 * Hamatee may change their email. The year must come from the production
 * timezone policy (`Africa/Accra`).
 */
export function buildUserYearDedupeKey(
  templateKey: string,
  userId: string,
  year: number | string,
): string {
  return `${templateKey}:user:${userId}:year:${year}`;
}

/** Fallback dedupe key when no order/user context exists. */
export function buildRecipientDedupeKey(
  templateKey: string,
  recipient: string,
): string {
  return `${templateKey}:recipient:${normalizeEmail(recipient)}`;
}

function truncate(value: string): string {
  return value.length > MAX_ERROR_LENGTH
    ? `${value.slice(0, MAX_ERROR_LENGTH)}…`
    : value;
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

/**
 * Atomically claim a delivery slot.
 *
 * - inserts a `pending` row (unique on `dedupe_key`)
 * - if the row already exists:
 *   - `sent`        → not claimed (`already_sent`)
 *   - `pending`     → not claimed (`in_progress`)
 *   - `skipped`     → not claimed (`already_skipped`)
 *   - `failed`      → re-claimed and reset to `pending` (`retry`)
 */
export async function claimDelivery(
  params: ClaimDeliveryParams,
): Promise<DeliveryClaim> {
  assertServerRuntime();

  const recipient = normalizeEmail(params.recipient);
  if (!recipient) {
    return {
      claimed: false,
      logId: null,
      status: null,
      reason: "error",
      error: "Missing recipient email.",
    };
  }
  if (!params.dedupeKey) {
    return {
      claimed: false,
      logId: null,
      status: null,
      reason: "error",
      error: "Missing dedupe key.",
    };
  }

  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from("email_delivery_log")
      .insert({
        template_key: params.templateKey,
        recipient,
        user_id: params.userId ?? null,
        order_id: params.orderId ?? null,
        status: "pending",
        dedupe_key: params.dedupeKey,
        metadata: params.metadata ?? null,
      })
      .select("id, status")
      .single();

    if (!error && data) {
      return {
        claimed: true,
        logId: data.id as string,
        status: "pending",
        reason: "claimed",
      };
    }

    // 23505 = unique_violation → the dedupe row already exists.
    if (error && error.code !== "23505") {
      return {
        claimed: false,
        logId: null,
        status: null,
        reason: "error",
        error: truncate(error.message),
      };
    }

    const { data: existing, error: readError } = await supabase
      .from("email_delivery_log")
      .select("id, status")
      .eq("dedupe_key", params.dedupeKey)
      .maybeSingle();

    if (readError || !existing) {
      return {
        claimed: false,
        logId: null,
        status: null,
        reason: "error",
        error: truncate(readError?.message ?? "Dedupe conflict but no record found."),
      };
    }

    const status = existing.status as DeliveryStatus;
    const logId = existing.id as string;

    if (status === "sent") {
      return { claimed: false, logId, status, reason: "already_sent" };
    }
    if (status === "pending") {
      return { claimed: false, logId, status, reason: "in_progress" };
    }
    if (status === "skipped") {
      return { claimed: false, logId, status, reason: "already_skipped" };
    }

    // status === "failed" → allow a retry by resetting to pending.
    const { error: resetError } = await supabase
      .from("email_delivery_log")
      .update({ status: "pending", error: null })
      .eq("id", logId);

    if (resetError) {
      return {
        claimed: false,
        logId,
        status,
        reason: "error",
        error: truncate(resetError.message),
      };
    }

    return { claimed: true, logId, status: "pending", reason: "retry" };
  } catch (err) {
    return {
      claimed: false,
      logId: null,
      status: null,
      reason: "error",
      error: truncate(messageOf(err)),
    };
  }
}

/** Mark a claimed delivery as successfully sent. */
export async function markSent(
  logId: string,
  brevoMessageId: string | null,
): Promise<DeliveryLogResult> {
  assertServerRuntime();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("email_delivery_log")
      .update({
        status: "sent",
        brevo_message_id: brevoMessageId,
        error: null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", logId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: messageOf(err) };
  }
}

/** Record the Brevo message ID for an already-sent delivery. */
export async function recordBrevoMessageId(
  logId: string,
  brevoMessageId: string | null,
): Promise<DeliveryLogResult> {
  assertServerRuntime();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("email_delivery_log")
      .update({ brevo_message_id: brevoMessageId })
      .eq("id", logId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: messageOf(err) };
  }
}

/** Mark a claimed delivery as failed (eligible for retry on a later run). */
export async function markFailed(
  logId: string,
  errorMessage: string | null,
): Promise<DeliveryLogResult> {
  assertServerRuntime();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("email_delivery_log")
      .update({
        status: "failed",
        error: errorMessage ? truncate(errorMessage) : null,
      })
      .eq("id", logId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: messageOf(err) };
  }
}

/** Mark a claimed delivery as intentionally skipped. */
export async function markSkipped(
  logId: string,
  reason?: string | null,
): Promise<DeliveryLogResult> {
  assertServerRuntime();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("email_delivery_log")
      .update({
        status: "skipped",
        error: reason ? truncate(reason) : null,
      })
      .eq("id", logId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: messageOf(err) };
  }
}
