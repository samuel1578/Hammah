import { getPublishedProducts, getPublishedCategories } from "@/lib/catalogue";
import type { CatalogueProduct } from "@/lib/catalogue";
import type { Product } from "@/types/products";
import { ShopClient } from "./shop-client";
import { PublicCTA } from "@/components/ui/public-cta";
import { Container } from "@/components/ui/container";

function toLegacyProducts(items: CatalogueProduct[]): Product[] {
  return items.map((p) => ({
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
  }));
}

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getPublishedProducts(),
    getPublishedCategories(),
  ]);

  return (
    <>
      <Container className="py-4 text-center">
        <PublicCTA slot="shop_banner" />
      </Container>
      <ShopClient products={toLegacyProducts(products)} categories={categories} />
      <Container className="py-8 text-center">
        <PublicCTA slot="shop_footer" />
      </Container>
    </>
  );
}
