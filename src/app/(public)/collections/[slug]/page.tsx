import { notFound } from "next/navigation";
import { getPublishedCollectionBySlug, getCollectionProducts } from "@/lib/catalogue";
import type { CatalogueProduct } from "@/lib/catalogue";
import type { Product } from "@/types/products";
import { CollectionSlugClient } from "./collection-slug-client";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

function toLegacyProducts(items: CatalogueProduct[]): Product[] {
  return items.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    collection: "collection-001",
    category: p.category.slug,
    pricingMode: p.pricingMode,
    availability: p.availability,
    description: p.description,
    media: p.media,
    variants: p.variants,
  }));
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getPublishedCollectionBySlug(slug);
  if (!collection) return { title: "Collection Not Found" };
  return {
    title: `${collection.name} | SL by Hammah`,
    description: collection.description ?? `${collection.name} — SL by Hammah`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  const [collection, products] = await Promise.all([
    getPublishedCollectionBySlug(slug),
    getCollectionProducts(slug),
  ]);

  if (!collection) {
    notFound();
  }

  return (
    <CollectionSlugClient
      collection={{ id: collection.id, slug: collection.slug, name: collection.name, description: collection.description }}
      products={toLegacyProducts(products)}
    />
  );
}
