import { notFound } from "next/navigation";
import { getPublishedProductBySlug, getRelatedProducts } from "@/lib/catalogue";
import type { CatalogueProduct } from "@/lib/catalogue";
import { PdpClient } from "@/components/product/pdp-client";
import type { Product } from "@/types/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function toLegacyProduct(p: CatalogueProduct): Product {
  return {
    dbId: p.dbId,
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
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | SL by Hammah`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [product, relatedRaw] = await Promise.all([
    getPublishedProductBySlug(slug),
    getRelatedProducts(slug, 4),
  ]);

  if (!product) {
    notFound();
  }

  const related = relatedRaw.map(toLegacyProduct);

  return <PdpClient product={toLegacyProduct(product)} relatedProducts={related} />;
}
