import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  isValidRecipientEmail,
  normalizeRecipientEmail,
  normalizeRecipientLabel,
} from "@/lib/admin/notification-recipients";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("notification_recipients")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};

  if ("email" in body) {
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = normalizeRecipientEmail(rawEmail);
    if (!rawEmail.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!isValidRecipientEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    update.email = email;
  }

  if ("label" in body) {
    update.label = normalizeRecipientLabel(body.label);
  }

  if ("enabled" in body) {
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { error: "Enabled must be true or false." },
        { status: 400 },
      );
    }
    update.enabled = body.enabled;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update." },
      { status: 400 },
    );
  }

  const { data, error } = await admin
    .from("notification_recipients")
    .update(update)
    .eq("id", id)
    .select("id, email, label, enabled, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A recipient with this email already exists." },
        { status: 409 },
      );
    }
    console.error("[admin/notification-recipients] update failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Failed to update recipient." },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { data: existing } = await admin
    .from("notification_recipients")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
  }

  // Deleting a recipient touches only this table. It must never affect
  // email_delivery_log, orders or users (no cascading unrelated behaviour).
  const { error } = await admin
    .from("notification_recipients")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[admin/notification-recipients] delete failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Failed to delete recipient." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Recipient deleted." });
}
