import type { Metadata } from "next";
import { getHomepageFeaturedProducts, getCollectionProducts } from "@/lib/catalogue";
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
import {
  OG_IMAGE,
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_TITLE,
  absoluteUrl,
} from "@/lib/seo/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

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

export default async function HomePage() {
  const [featuredProducts, collectionProducts] = await Promise.all([
    getHomepageFeaturedProducts(),
    getCollectionProducts("collection-001"),
  ]);

  return (
    <>
      <HomeEditorialHero />
      <HomeCollection001 products={toLegacyProducts(collectionProducts)} />
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
