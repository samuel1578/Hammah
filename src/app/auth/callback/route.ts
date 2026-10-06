import { after, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendHamateeWelcome } from "@/lib/email/hamatee-welcome";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Explicit marker set only by the direct Hamatee signup flow
  // (`/signup` → emailRedirectTo). Password reset and every other auth
  // callback omit it, so they can never trigger the Welcome email.
  const isNewSignup = searchParams.get("welcome") === "1";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

      // Non-blocking Hamatee Welcome (Brevo Template #3) for a NEW direct
      // signup confirmation only. Identity is taken from the server-verified
      // session user returned by the code exchange — never from query params.
      // `after()` runs once the redirect response is sent, so a Brevo problem
      // can never delay or fail the confirmation or the redirect.
      if (isNewSignup && data.user?.id) {
        const userId = data.user.id;
        after(async () => {
          await sendHamateeWelcome(userId);
        });
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
