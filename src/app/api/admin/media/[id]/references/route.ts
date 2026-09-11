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

  const { data: asset } = await admin
    .from("media_assets")
    .select("id, public_url")
    .eq("id", id)
    .single();

  if (!asset) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  const references: { type: string; name: string; id: string }[] = [];

  const { data: productMedia } = await admin
    .from("product_media")
    .select("id, product_id, products(name)")
    .eq("media_asset_id", id);

  if (productMedia) {
    for (const pm of productMedia) {
      references.push({
        type: "product",
        name: (Array.isArray(pm.products) ? pm.products[0] : pm.products)?.name ?? "Unknown product",
        id: pm.product_id,
      });
    }
  }

  const { data: heroImages } = await admin
    .from("homepage_hero_images")
    .select("id")
    .eq("media_asset_id", id);

  if (heroImages) {
    for (const hi of heroImages) {
      references.push({
        type: "homepage_hero",
        name: "Homepage Hero Image",
        id: hi.id,
      });
    }
  }

  const { data: collections } = await admin
    .from("collections")
    .select("id, name, hero_image_url")
    .not("hero_image_url", "is", null);

  if (collections) {
    for (const col of collections) {
      if (col.hero_image_url === asset.public_url) {
        references.push({
          type: "collection",
          name: col.name,
          id: col.id,
        });
      }
    }
  }

  return NextResponse.json({ references });
}
