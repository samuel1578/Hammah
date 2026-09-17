import { createClient } from "@/lib/supabase/server";
import type { CatalogueProduct, CatalogueCollection, CatalogueCategory } from "./types";

export async function getPublishedProducts(): Promise<CatalogueProduct[]> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, description, pricing_mode, availability, sort_order, video_url, video_media_id, size_guide_id,
      category:categories ( slug, name ),
      product_media (
        sort_order, role,
        media_asset:media_assets ( public_url )
      ),
      product_variants ( size_label, size_value, available, sort_order ),
      video_asset:media_assets!products_video_media_id_fkey ( public_url )
    `)
    .eq("status", "published")
    .order("sort_order");

  if (error || !products) return [];

  return products.map((p: any) => mapProduct(p));
}

export async function getPublishedProductBySlug(slug: string): Promise<CatalogueProduct | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, description, pricing_mode, availability, sort_order, video_url, video_media_id, size_guide_id,
      category:categories ( slug, name ),
      product_media (
        sort_order, role,
        media_asset:media_assets ( public_url )
      ),
      product_variants ( size_label, size_value, available, sort_order ),
      video_asset:media_assets!products_video_media_id_fkey ( public_url )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !product) return null;

  return mapProduct(product);
}

export async function getRelatedProducts(currentSlug: string, count = 4): Promise<CatalogueProduct[]> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, description, pricing_mode, availability, sort_order, video_url, video_media_id, size_guide_id,
      category:categories ( slug, name ),
      product_media (
        sort_order, role,
        media_asset:media_assets ( public_url )
      ),
      product_variants ( size_label, size_value, available, sort_order ),
      video_asset:media_assets!products_video_media_id_fkey ( public_url )
    `)
    .eq("status", "published")
    .neq("slug", currentSlug)
    .order("sort_order")
    .limit(count);

  if (error || !products) return [];

  return products.map((p: any) => mapProduct(p));
}

export async function getPublishedCollections(): Promise<CatalogueCollection[]> {
  const supabase = await createClient();

  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, sort_order")
    .eq("status", "published")
    .order("sort_order");

  if (error || !collections) return [];

  return collections.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? undefined,
    sortOrder: c.sort_order,
  }));
}

export async function getPublishedCollectionBySlug(slug: string): Promise<CatalogueCollection | null> {
  const supabase = await createClient();

  const { data: collection, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, sort_order")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !collection) return null;

  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description ?? undefined,
    sortOrder: collection.sort_order,
  };
}

export async function getCollectionProducts(collectionSlug: string): Promise<CatalogueProduct[]> {
  const supabase = await createClient();

  const { data: cp, error: cpError } = await supabase
    .from("collection_products")
    .select(`
      sort_order,
      product:products!inner (
        id, slug, name, description, pricing_mode, availability, sort_order, status, video_url, video_media_id, size_guide_id,
        category:categories ( slug, name ),
        product_media (
          sort_order, role,
          media_asset:media_assets ( public_url )
        ),
        product_variants ( size_label, size_value, available, sort_order ),
        video_asset:media_assets!products_video_media_id_fkey ( public_url )
      ),
      collection:collections!inner ( slug )
    `)
    .eq("collection.slug", collectionSlug)
    .eq("product.status", "published")
    .order("sort_order");

  if (cpError || !cp) return [];

  return cp
    .filter((row: any) => row.product)
    .map((row: any) => mapProduct(row.product));
}

export async function getPublishedCategories(): Promise<CatalogueCategory[]> {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, name, short_description, sort_order")
    .eq("status", "published")
    .order("sort_order");

  if (error || !categories) return [];

  return categories.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    shortDescription: c.short_description ?? undefined,
    sortOrder: c.sort_order,
  }));
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<CatalogueProduct[]> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, description, pricing_mode, availability, sort_order, video_url, video_media_id, size_guide_id,
      category:categories!inner ( slug, name ),
      product_media (
        sort_order, role,
        media_asset:media_assets ( public_url )
      ),
      product_variants ( size_label, size_value, available, sort_order ),
      video_asset:media_assets!products_video_media_id_fkey ( public_url )
    `)
    .eq("status", "published")
    .eq("category.slug", categorySlug)
    .order("sort_order");

  if (error || !products) return [];

  return products.map((p: any) => mapProduct(p));
}

export async function getHomepageFeaturedProducts(): Promise<CatalogueProduct[]> {
  const supabase = await createClient();

  const { data: hfp, error } = await supabase
    .from("homepage_featured_products")
    .select(`
      sort_order,
      product:products!inner (
        id, slug, name, description, pricing_mode, availability, sort_order, status, video_url, video_media_id, size_guide_id,
        category:categories ( slug, name ),
        product_media (
          sort_order, role,
          media_asset:media_assets ( public_url )
        ),
        product_variants ( size_label, size_value, available, sort_order ),
        video_asset:media_assets!products_video_media_id_fkey ( public_url )
      )
    `)
    .eq("is_active", true)
    .eq("product.status", "published")
    .order("sort_order");

  if (error || !hfp) return [];

  return hfp
    .filter((row: any) => row.product)
    .map((row: any) => mapProduct(row.product));
}

function mapProduct(row: any): CatalogueProduct {
  const mediaRows: any[] = row.product_media ?? [];
  const variants: any[] = row.product_variants ?? [];

  const primary = mediaRows.find((m: any) => m.role === "primary")?.media_asset?.public_url ?? "";
  const hover = mediaRows.find((m: any) => m.role === "hover")?.media_asset?.public_url;
  const gallery = mediaRows
    .filter((m: any) => m.role === "gallery")
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((m: any) => m.media_asset?.public_url ?? "");
  const details = mediaRows
    .filter((m: any) => m.role === "detail")
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((m: any) => m.media_asset?.public_url ?? "");

  const category = Array.isArray(row.category) ? row.category[0] : row.category;

  // Prefer the joined video_asset URL; fall back to legacy video_url column
  const videoAsset = Array.isArray(row.video_asset) ? row.video_asset[0] : row.video_asset;
  const videoUrl = videoAsset?.public_url ?? row.video_url ?? null;

  return {
    dbId: row.id,
    id: row.slug,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    category: { slug: category?.slug ?? "", name: category?.name ?? "" },
    pricingMode: row.pricing_mode,
    availability: row.availability,
    sortOrder: row.sort_order,
    videoUrl,
    sizeGuideId: row.size_guide_id ?? null,
    media: {
      primary,
      hover: hover ?? undefined,
      gallery,
      details,
      thumbnail: primary,
    },
    variants: variants.map((v: any) => ({
      label: v.size_label,
      value: v.size_value,
      available: v.available,
    })),
  };
}
