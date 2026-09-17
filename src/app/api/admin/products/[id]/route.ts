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
    .from("products")
    .select(`
      *,
      categories(id, name, slug),
      product_variants(*),
      product_media(
        id,
        media_asset_id,
        role,
        sort_order,
        media_assets(id, public_url, alt_text, mime_type, media_type)
      ),
      collection_products(collection_id, collections(id, name, slug)),
      video_asset:media_assets!products_video_media_id_fkey(public_url)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
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
    .from("products")
    .select("id, slug")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (body.slug && body.slug !== existing.slug) {
    const { data: conflict } = await admin
      .from("products")
      .select("id")
      .eq("slug", body.slug)
      .neq("id", id)
      .single();

    if (conflict) {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
    }
  }

  const updateData: Record<string, unknown> = {};
  const allowedFields = [
    "name", "slug", "description", "category_id", "pricing_mode",
    "price_amount", "availability", "status", "video_url", "video_media_id", "sort_order", "size_guide_id",
  ];

  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  // Derive video_url from video_media_id when set
  if ("video_media_id" in body) {
    if (body.video_media_id) {
      const { data: asset } = await admin
        .from("media_assets")
        .select("public_url")
        .eq("id", body.video_media_id)
        .single();
      updateData.video_url = asset?.public_url ?? null;
    } else {
      updateData.video_url = null;
    }
  }

  if (updateData.status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await admin
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;
  const body = await request.json();

  const { data: existing } = await admin
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if ("status" in body) {
    updateData.status = body.status;
    if (body.status === "published") {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await admin
    .from("products")
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
    .from("products")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (existing.status === "archived") {
    return NextResponse.json({ error: "Product is already archived." }, { status: 400 });
  }

  const { error } = await admin
    .from("products")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Product archived." });
}
