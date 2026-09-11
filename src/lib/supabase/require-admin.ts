import { NextResponse } from "next/server";
import { createClient } from "./server";
import { createAdminClient } from "./admin";

interface AdminAuth {
  admin: ReturnType<typeof createAdminClient>;
}

interface AdminAuthWithUserId extends AdminAuth {
  userId: string;
}

export async function requireAdmin(): Promise<{ error: NextResponse } | AdminAuth>;
export async function requireAdmin(opts: { includeUserId: true }): Promise<{ error: NextResponse } | AdminAuthWithUserId>;
export async function requireAdmin(opts?: { includeUserId?: boolean }): Promise<{ error: NextResponse } | AdminAuth | AdminAuthWithUserId> {
  const supabase = await createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Stale/invalid refresh token — treat as signed-out.
    user = null;
  }

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const admin = createAdminClient();
  if (opts?.includeUserId) {
    return { admin, userId: user.id };
  }
  return { admin };
}
