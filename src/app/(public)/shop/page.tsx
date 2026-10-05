import type { Metadata } from "next";
import { getPublishedProducts, getPublishedCategories } from "@/lib/catalogue";
import type { CatalogueProduct } from "@/lib/catalogue";
import type { Product } from "@/types/products";
import { ShopClient } from "./shop-client";
import { PublicCTA } from "@/components/ui/public-cta";
import { Container } from "@/components/ui/container";
import { publicPageMetadata } from "@/lib/seo/site";

const SHOP_TITLE = "Shop African Fashion";
const SHOP_DESCRIPTION =
  "Shop contemporary African fashion from SL by HAMMAH, including expressive African-print trousers and statement pieces.";

export const metadata: Metadata = publicPageMetadata({
  title: SHOP_TITLE,
  description: SHOP_DESCRIPTION,
  path: "/shop",
});


function toLegacyProducts(items: CatalogueProduct[]): Product[] {
  return items.map((p) => ({
    dbId: p.dbId,
    id: p.slug,
    slug: p.slug,
    name: p.name,
    collection: "collection-001",
    category: p.category.slug,
    pricingMode: p.pricingMode,
    priceAmount: p.priceAmount,
    currency: p.currency,
    availability: p.availability,
    description: p.description,
    videoUrl: p.videoUrl,
    sizeGuideId: p.sizeGuideId,
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
