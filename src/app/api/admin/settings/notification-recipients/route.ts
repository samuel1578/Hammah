import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  isValidRecipientEmail,
  normalizeRecipientEmail,
  normalizeRecipientLabel,
} from "@/lib/admin/notification-recipients";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { data, error } = await admin
    .from("notification_recipients")
    .select("id, email, label, enabled, created_at, updated_at")
    .order("email", { ascending: true });

  if (error) {
    console.error("[admin/notification-recipients] list failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Failed to load notification recipients." },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email : "";
  const email = normalizeRecipientEmail(rawEmail);
  const label = normalizeRecipientLabel(body.label);
  const enabled = typeof body.enabled === "boolean" ? body.enabled : true;

  if (!rawEmail.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (!isValidRecipientEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const { data, error } = await admin
    .from("notification_recipients")
    .insert({ email, label, enabled })
    .select("id, email, label, enabled, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A recipient with this email already exists." },
        { status: 409 },
      );
    }
    console.error("[admin/notification-recipients] create failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Failed to add recipient." },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
