import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { data, error } = await admin
    .from("cta_placements")
    .select("*")
    .order("slot")
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const body = await request.json();
  const { slot, label, href, enabled, variant, sort_order, starts_at, ends_at } = body;

  if (!slot) {
    return NextResponse.json({ error: "Slot is required." }, { status: 400 });
  }
  if (!label?.trim()) {
    return NextResponse.json({ error: "Label is required." }, { status: 400 });
  }
  if (!href?.trim()) {
    return NextResponse.json({ error: "Href is required." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("cta_placements")
    .insert({
      slot,
      label: label.trim(),
      href: href.trim(),
      enabled: enabled ?? true,
      variant: variant ?? "primary",
      sort_order: sort_order ?? 0,
      starts_at: starts_at ?? null,
      ends_at: ends_at ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
