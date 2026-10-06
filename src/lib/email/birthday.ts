/**
 * HAMMAH — Birthday email processor (Template #4, server-only)
 *
 * Recipient scope (initial production implementation):
 *   ONLY real authenticated Hamatee profiles in `public.profiles` that are
 *   backed by a genuine, email-confirmed Supabase Auth user.
 *
 * Explicitly EXCLUDED:
 *   - `hamatee_enrolments` rows (pending guest birthday enrolments)
 *   - raw guest order birthday data
 *   - any enrolment without a completed Hamatee account
 *
 * Time zone: birthday matching is deterministic in `Africa/Accra`
 * (Ghana = UTC+0), never the server/browser/Vercel geography.
 *
 * Leap day: 29 February profiles are matched exactly (month = 2, day = 29)
 * and therefore only receive a birthday email on 29 February in leap years.
 *
 * Idempotency: at most once per user per calendar year, via the Sprint 1
 * delivery-log claim with key `birthday:user:<user_id>:year:<YYYY>`.
 *
 * This module never throws into the cron route; it returns a safe summary.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/seo/site";
import { assertServerRuntime } from "./guard";
import { buildUserYearDedupeKey } from "./log";
import { sendTrackedTemplateEmail } from "./send";
import type { BirthdayEmailParams } from "./templates";

const GHANA_TIME_ZONE = "Africa/Accra";

export interface BirthdayRunSummary {
  ok: boolean;
  /** Ghana calendar date, `YYYY-MM-DD`. */
  date: string;
  eligible: number;
  sent: number;
  duplicate: number;
  failed: number;
  skipped: number;
}

interface ProfileCandidate {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
}

/* ─────────────────────────────────────────────
   GHANA CALENDAR DATE
   ───────────────────────────────────────────── */

export function ghanaDateParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  iso: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GHANA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  return { year, month, day, iso: `${get("year")}-${get("month")}-${get("day")}` };
}

/**
 * Extract month/day from a persisted `date` value. Birth year is irrelevant
 * to matching. Returns null for malformed values.
 */
export function dobMonthDay(
  dob: string | null | undefined,
): { month: number; day: number } | null {
  if (!dob) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!month || !day) return null;
  return { month, day };
}

function safeFirstName(profile: ProfileCandidate): string {
  const first = profile.first_name?.trim() ?? "";
  if (first) return first;
  const last = profile.last_name?.trim() ?? "";
  if (last) return last;
  return "Hamatee";
}

/* ─────────────────────────────────────────────
   PROCESSING
   ───────────────────────────────────────────── */

/**
 * Send the Hamatee birthday email to every eligible profile.
 *
 * NEVER throws. Per-user failures are isolated and counted; one invalid
 * recipient can never abort the whole batch.
 */
export async function processBirthdayEmails(
  now: Date = new Date(),
): Promise<BirthdayRunSummary> {
  assertServerRuntime();

  const { year, month, day, iso } = ghanaDateParts(now);
  const summary: BirthdayRunSummary = {
    ok: false,
    date: iso,
    eligible: 0,
    sent: 0,
    duplicate: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    const supabase = createAdminClient();

    // Candidate query: only the columns required to match and personalise.
    // Month/day matching is performed server-side (acceptable at HAMMAH's
    // current scale; paginate if the profile base grows substantially).
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, date_of_birth")
      .not("date_of_birth", "is", null);

    if (error) {
      console.error("[email/birthday] failed to read profiles", {
        code: error.code,
        message: error.message,
      });
      return summary;
    }

    const candidates = ((data ?? []) as unknown as ProfileCandidate[]).filter(
      (profile) => {
        const md = dobMonthDay(profile.date_of_birth);
        return md !== null && md.month === month && md.day === day;
      },
    );

    summary.eligible = candidates.length;

    // Sequential, bounded processing: one failure never aborts the batch.
    for (const profile of candidates) {
      try {
        // Verify the underlying auth user server-side (never trust profile
        // data alone; a deleted/unconfirmed account must be skipped).
        const { data: authData, error: authError } =
          await supabase.auth.admin.getUserById(profile.id);
        const user = authData?.user ?? null;
        const email = user?.email?.trim() ?? "";

        if (authError || !user || !email || !user.email_confirmed_at) {
          summary.skipped += 1;
          console.warn(
            `[email/birthday] skipped ineligible user ${profile.id} (unverified/missing account or email).`,
          );
          continue;
        }

        const params: BirthdayEmailParams = {
          first_name: safeFirstName(profile),
          account_url: absoluteUrl("/account"),
          shop_url: absoluteUrl("/shop"),
        };

        const result = await sendTrackedTemplateEmail({
          templateKey: "birthday",
          to: email,
          params: { ...params },
          userId: profile.id,
          dedupeKey: buildUserYearDedupeKey("birthday", profile.id, year),
          tags: ["birthday"],
          metadata: { year },
        });

        if (result.status === "sent") summary.sent += 1;
        else if (result.status === "duplicate") summary.duplicate += 1;
        else if (result.status === "failed") summary.failed += 1;
        else summary.skipped += 1;
      } catch (err) {
        summary.failed += 1;
        console.error("[email/birthday] unexpected per-user error", {
          userId: profile.id,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    summary.ok = true;
    return summary;
  } catch (err) {
    console.error("[email/birthday] unexpected processor error", {
      message: err instanceof Error ? err.message : String(err),
    });
    return summary;
  }
}
