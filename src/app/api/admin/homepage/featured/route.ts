import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { data, error } = await admin
    .from("homepage_featured_products")
    .select("id, product_id, sort_order, is_active, created_at, products(id, name, slug, price_amount, availability)")
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
  const { product_id, sort_order } = body;

  if (!product_id) {
    return NextResponse.json({ error: "product_id is required." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("homepage_featured_products")
    .select("id")
    .eq("product_id", product_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Product is already featured." }, { status: 409 });
  }

  const { data, error } = await admin
    .from("homepage_featured_products")
    .insert({
      product_id,
      sort_order: sort_order ?? 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const body = await request.json();
  const items = body as Array<{ id: string; sort_order: number }>;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Array of {id, sort_order} items is required." }, { status: 400 });
  }

  const updates = items.map((item) =>
    admin
      .from("homepage_featured_products")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Failed to reorder some items." }, { status: 500 });
  }

  return NextResponse.json({ message: "Reordered successfully." });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("homepage_featured_products")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Featured product not found." }, { status: 404 });
  }

  const { error } = await admin
    .from("homepage_featured_products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Removed from featured." });
}
