import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { data, error } = await admin
    .from("cta_placements")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "CTA not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;
  const body = await request.json();

  const { data: existing } = await admin
    .from("cta_placements")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "CTA not found." }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  const allowedFields = [
    "slot", "label", "href", "enabled", "variant",
    "sort_order", "starts_at", "ends_at",
  ];

  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  if (updateData.label && typeof updateData.label === "string") {
    updateData.label = updateData.label.trim();
  }
  if (updateData.href && typeof updateData.href === "string") {
    updateData.href = updateData.href.trim();
  }

  const { data, error } = await admin
    .from("cta_placements")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { data: existing } = await admin
    .from("cta_placements")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "CTA not found." }, { status: 404 });
  }

  const { error } = await admin
    .from("cta_placements")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "CTA deleted." });
}
