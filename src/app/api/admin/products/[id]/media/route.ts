import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const VALID_ROLES = ["primary", "hover", "gallery", "detail"] as const;

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("product_media")
    .select("id, media_asset_id, role, sort_order, created_at")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;
  const body = await request.json();
  const { media_asset_id, role, sort_order } = body;

  if (!media_asset_id) {
    return NextResponse.json({ error: "media_asset_id is required." }, { status: 400 });
  }

  if (!role || !(VALID_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { data: asset } = await admin
    .from("media_assets")
    .select("id")
    .eq("id", media_asset_id)
    .single();

  if (!asset) {
    return NextResponse.json({ error: "Media asset not found." }, { status: 404 });
  }

  const { data: existing } = await admin
    .from("product_media")
    .select("id")
    .eq("product_id", id)
    .eq("media_asset_id", media_asset_id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "This media asset is already assigned to this product." },
      { status: 409 },
    );
  }

  if (role === "primary" || role === "hover") {
    await admin
      .from("product_media")
      .delete()
      .eq("product_id", id)
      .eq("role", role);
  }

  let finalSortOrder = sort_order ?? 0;

  if (role === "gallery" || role === "detail") {
    const { count } = await admin
      .from("product_media")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id)
      .eq("role", role);

    finalSortOrder = sort_order ?? (count ?? 0);
  }

  const { data, error } = await admin
    .from("product_media")
    .insert({
      product_id: id,
      media_asset_id,
      role,
      sort_order: finalSortOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const mediaAssetId = searchParams.get("media_asset_id");

  if (!mediaAssetId) {
    return NextResponse.json(
      { error: "media_asset_id query parameter is required." },
      { status: 400 },
    );
  }

  const { data: existing } = await admin
    .from("product_media")
    .select("id")
    .eq("product_id", id)
    .eq("media_asset_id", mediaAssetId)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Media assignment not found." },
      { status: 404 },
    );
  }

  const { error } = await admin
    .from("product_media")
    .delete()
    .eq("product_id", id)
    .eq("media_asset_id", mediaAssetId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Media unassigned." });
}
