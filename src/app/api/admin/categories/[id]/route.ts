import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (catError || !category) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 },
    );
  }

  const { count: product_count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .neq("status", "archived");

  return NextResponse.json({ ...category, product_count: product_count ?? 0 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.slug !== undefined) {
    const slug = body.slug.trim();
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single();
    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 },
      );
    }
    updates.slug = slug;
  }
  if (body.short_description !== undefined)
    updates.short_description = body.short_description || null;
  if (body.description !== undefined)
    updates.description = body.description || null;
  if (body.cover_image_url !== undefined)
    updates.cover_image_url = body.cover_image_url || null;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.status !== undefined) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .neq("status", "archived");

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot archive category with active products" },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("categories")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
