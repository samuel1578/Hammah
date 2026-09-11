import { getHomepageFeaturedProducts } from "@/lib/catalogue";
import type { CatalogueProduct } from "@/lib/catalogue";
import type { Product } from "@/types/products";
import { HomeEditorialHero } from "@/components/home/home-editorial-hero";
import { HomeCollection001 } from "@/components/home/home-collection";
import { HomeHammahWorld } from "@/components/home/home-world";
import { HomeDetailCraft } from "@/components/home/home-craft";
import { HomeFeaturedPieces } from "@/components/home/home-featured";
import { HomePointOfView } from "@/components/home/home-pov";
import { HomeLegacy } from "@/components/home/home-legacy";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeClosing } from "@/components/home/home-closing";
import { PublicCTA } from "@/components/ui/public-cta";
import { Container } from "@/components/ui/container";

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

export default async function HomePage() {
  const featuredProducts = await getHomepageFeaturedProducts();

  return (
    <>
      <HomeEditorialHero />
      <HomeCollection001 />
      <HomeHammahWorld />
      <HomeDetailCraft />
      <HomeFeaturedPieces products={toLegacyProducts(featuredProducts)} />
      <Container className="py-8 text-center">
        <PublicCTA slot="home_midpage" />
      </Container>
      <HomePointOfView />
      <HomeLegacy />
      <HomeFaq />
      <HomeClosing />
      <Container className="py-8 text-center">
        <PublicCTA slot="home_closing" />
      </Container>
    </>
  );
}
