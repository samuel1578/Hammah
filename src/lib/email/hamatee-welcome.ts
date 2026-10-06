/**
 * HAMMAH — Hamatee Welcome email (Template #3, server-only)
 *
 * Sends Brevo Template #3 (`hamatee_welcome`) for a **new direct Hamatee
 * signup** whose email has been confirmed. It is scheduled non-blockingly
 * from `/auth/callback` (see `src/app/auth/callback/route.ts`).
 *
 * Eligibility rule:
 *  - ONLY the explicit direct-signup confirmation callback may call this.
 *  - Guest birthday enrolments (`hamatee_enrolments`, `status = 'pending'`),
 *    existing accounts, logins and password resets must never trigger it.
 *
 * Guarantees:
 *  - Never throws into the auth flow.
 *  - Re-verifies the user server-side (admin client): user exists, verified
 *    email exists, email is confirmed, profile exists.
 *  - Deduped once-per-user via the Sprint 1 delivery log
 *    (`hamatee_welcome:user:<user_id>:<recipient>`).
 *  - Reuses the existing transport / logging / claim / template registry;
 *    it does not duplicate any Brevo or logging logic.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/seo/site";
import { assertServerRuntime } from "./guard";
import { buildUserDedupeKey } from "./log";
import { sendTrackedTemplateEmail, type TrackedSendResult } from "./send";
import type { HamateeWelcomeEmailParams } from "./templates";

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
}

function skipped(reason: string): TrackedSendResult {
  return {
    status: "skipped",
    messageId: null,
    error: reason,
    logId: null,
    dedupeKey: null,
  };
}

/** Stable formatted account creation date, e.g. "5 October 2026". */
export function formatJoinedAt(value: string | null | undefined): string {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function deriveNames(profile: ProfileRow): { firstName: string; fullName: string } {
  const first = profile.first_name?.trim() ?? "";
  const last = profile.last_name?.trim() ?? "";
  const fullName = [first, last].filter(Boolean).join(" ").trim();
  const firstName = first || fullName.split(" ")[0] || "Hamatee";
  return { firstName, fullName: fullName || firstName };
}

/**
 * Send the Hamatee Welcome for a confirmed direct signup.
 *
 * `userId` must come from the server-verified Supabase session established
 * by the confirmation callback — never from client input or query params.
 *
 * NEVER throws. Returns a `TrackedSendResult` for diagnostics/logging.
 */
export async function sendHamateeWelcome(
  userId: string,
): Promise<TrackedSendResult> {
  assertServerRuntime();

  if (!userId) return skipped("Missing user id.");

  try {
    const supabase = createAdminClient();

    // 1. Re-verify the authenticated user server-side (fresh, not from the
    //    callback query string).
    const { data: authData, error: authError } =
      await supabase.auth.admin.getUserById(userId);
    const user = authData?.user ?? null;

    if (authError || !user) {
      console.warn(
        `[email/hamatee-welcome] user could not be verified for ${userId}; skipping.`,
      );
      return skipped("User could not be verified.");
    }

    const email = user.email?.trim() ?? "";
    if (!email) {
      console.warn(
        `[email/hamatee-welcome] verified user ${userId} has no email; skipping.`,
      );
      return skipped("No verified email.");
    }

    if (!user.email_confirmed_at) {
      console.warn(
        `[email/hamatee-welcome] user ${userId} email is not confirmed; skipping.`,
      );
      return skipped("Email not confirmed.");
    }

    // 2. The profile must exist (created by `handle_new_user` on signup).
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profileData) {
      console.warn(
        `[email/hamatee-welcome] profile missing for ${userId}; skipping.`,
      );
      return skipped("Profile not found.");
    }

    const profile = profileData as unknown as ProfileRow;
    const { firstName, fullName } = deriveNames(profile);

    const params: HamateeWelcomeEmailParams = {
      first_name: firstName,
      full_name: fullName,
      email,
      joined_at: formatJoinedAt(profile.created_at ?? user.created_at),
      account_url: absoluteUrl("/account"),
      shop_url: absoluteUrl("/shop"),
    };

    // 3. Once-per-user dedupe (order → user → recipient derivation uses the
    //    explicit user key documented for Template #3).
    const dedupeKey = buildUserDedupeKey("hamatee_welcome", userId, email);

    return await sendTrackedTemplateEmail({
      templateKey: "hamatee_welcome",
      to: email,
      params: { ...params },
      userId,
      dedupeKey,
      tags: ["hamatee_welcome"],
      metadata: { source: "direct_signup" },
    });
  } catch (err) {
    console.error("[email/hamatee-welcome] unexpected error", {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
    return {
      status: "failed",
      messageId: null,
      error: "Unexpected welcome-email error.",
      logId: null,
      dedupeKey: null,
    };
  }
}
