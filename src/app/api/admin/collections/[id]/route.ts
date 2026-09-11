import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: collection, error: colError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (colError || !collection) {
    return NextResponse.json(
      { error: "Collection not found" },
      { status: 404 },
    );
  }

  const { data: products } = await supabase
    .from("collection_products")
    .select("product_id, sort_order")
    .eq("collection_id", id)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ ...collection, products: products ?? [] });
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
      .from("collections")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single();
    if (existing) {
      return NextResponse.json(
        { error: "A collection with this slug already exists" },
        { status: 409 },
      );
    }
    updates.slug = slug;
  }
  if (body.description !== undefined)
    updates.description = body.description || null;
  if (body.editorial_heading !== undefined)
    updates.editorial_heading = body.editorial_heading || null;
  if (body.editorial_statement !== undefined)
    updates.editorial_statement = body.editorial_statement || null;
  if (body.editorial_body !== undefined)
    updates.editorial_body = body.editorial_body || null;
  if (body.hero_image_url !== undefined)
    updates.hero_image_url = body.hero_image_url || null;
  if (body.hero_image_mobile_url !== undefined)
    updates.hero_image_mobile_url = body.hero_image_mobile_url || null;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.status !== undefined) updates.status = body.status;
  if (body.published_at !== undefined)
    updates.published_at = body.published_at || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("collections")
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
    .from("collection_products")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot archive collection with assigned products" },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("collections")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
