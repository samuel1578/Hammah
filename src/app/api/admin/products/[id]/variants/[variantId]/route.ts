import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

interface RouteContext {
  params: Promise<{ id: string; variantId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id, variantId } = await params;
  const body = await request.json();

  const { data: existing } = await admin
    .from("product_variants")
    .select("id")
    .eq("id", variantId)
    .eq("product_id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Variant not found." }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if ("size_label" in body) updateData.size_label = body.size_label;
  if ("size_value" in body) updateData.size_value = body.size_value;
  if ("available" in body) updateData.available = body.available;
  if ("sort_order" in body) updateData.sort_order = body.sort_order;

  if (body.size_value) {
    const { data: conflict } = await admin
      .from("product_variants")
      .select("id")
      .eq("product_id", id)
      .eq("size_value", body.size_value)
      .neq("id", variantId)
      .single();

    if (conflict) {
      return NextResponse.json(
        { error: "A variant with this size value already exists." },
        { status: 409 }
      );
    }
  }

  const { data, error } = await admin
    .from("product_variants")
    .update(updateData)
    .eq("id", variantId)
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

  const { id, variantId } = await params;

  const { data: existing } = await admin
    .from("product_variants")
    .select("id")
    .eq("id", variantId)
    .eq("product_id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Variant not found." }, { status: 404 });
  }

  const { error } = await admin
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Variant deleted." });
}
