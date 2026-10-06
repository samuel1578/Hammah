/**
 * HAMMAH — Notification recipient data access (server-only)
 *
 * Reads the admin-managed `public.notification_recipients` table through
 * the service-role client (RLS bypass). The storefront has no access to
 * this table at all — the RLS policies are admin-only.
 *
 * The admin CRUD API/UI belongs to Sprint 2. This sprint only provides a
 * safe read of enabled order-notification recipients.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { assertServerRuntime } from "./guard";
import { normalizeEmail } from "./log";

export interface NotificationRecipient {
  id: string;
  email: string;
  label: string | null;
  enabled: boolean;
}

/**
 * Return every enabled order-notification recipient as a clean,
 * normalised object. Deduplicated by lower-cased email.
 *
 * Never throws: on failure it logs a safe message and returns an empty
 * array so a future order flow can continue.
 */
export async function getEnabledOrderNotificationRecipients(): Promise<
  NotificationRecipient[]
> {
  assertServerRuntime();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notification_recipients")
      .select("id, email, label, enabled")
      .eq("enabled", true)
      .order("email", { ascending: true });

    if (error) {
      console.error("[email/recipients] failed to read recipients", {
        code: error.code,
        message: error.message,
      });
      return [];
    }

    const seen = new Set<string>();
    const recipients: NotificationRecipient[] = [];
    for (const row of data ?? []) {
      const email = normalizeEmail(String(row.email ?? ""));
      if (!email || seen.has(email)) continue;
      seen.add(email);
      recipients.push({
        id: String(row.id),
        email,
        label: (row.label as string | null) ?? null,
        enabled: Boolean(row.enabled),
      });
    }
    return recipients;
  } catch (err) {
    console.error("[email/recipients] unexpected error", err);
    return [];
  }
}
