import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const body = await request.json();
  const { name, slug, description, category_id, pricing_mode, price_amount, availability, video_url, video_media_id } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!category_id) {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }

  const finalSlug = slug?.trim() || generateSlug(name);

  if (!finalSlug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  // Derive video_url from video_media_id when set
  let resolvedVideoUrl = video_url?.trim() || null;
  if (video_media_id) {
    const { data: asset } = await admin
      .from("media_assets")
      .select("public_url")
      .eq("id", video_media_id)
      .single();
    resolvedVideoUrl = asset?.public_url ?? null;
  }

  const { data: existing } = await admin
    .from("products")
    .select("id")
    .eq("slug", finalSlug)
    .single();

  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
  }

  const { data, error } = await admin
    .from("products")
    .insert({
      name: name.trim(),
      slug: finalSlug,
      description: description || null,
      category_id,
      pricing_mode: pricing_mode || "PRICE_ON_REQUEST",
      price_amount: price_amount ?? null,
      availability: availability || "COMING_SOON",
      video_url: resolvedVideoUrl,
      video_media_id: video_media_id || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
