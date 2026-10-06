import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processBirthdayEmails } from "@/lib/email/birthday";

export const dynamic = "force-dynamic";

/** Constant-time string comparison for the cron secret. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * GET /api/cron/birthdays
 *
 * Invoked by Vercel Cron (`0 8 * * *` UTC = 08:00 Africa/Accra).
 * Requires `Authorization: Bearer <CRON_SECRET>`. The secret is only ever
 * read from the server-only `CRON_SECRET` env var — never a query string,
 * URL path, body, or `NEXT_PUBLIC_` variable.
 *
 * Returns a safe aggregate summary only: no customer email addresses,
 * names, DOBs, Brevo responses, secrets or auth data.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  // Production must fail closed when the secret is not configured.
  if (!secret) {
    console.error("[cron/birthdays] CRON_SECRET is not configured.");
    return NextResponse.json(
      { ok: false, error: "Cron is not configured." },
      { status: 500 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  if (!safeEqual(header, `Bearer ${secret}`)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const summary = await processBirthdayEmails();

  if (!summary.ok) {
    return NextResponse.json(
      { ok: false, error: "Birthday run failed." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      date: summary.date,
      eligible: summary.eligible,
      sent: summary.sent,
      duplicate: summary.duplicate,
      failed: summary.failed,
      skipped: summary.skipped,
    },
    { status: 200 },
  );
}
