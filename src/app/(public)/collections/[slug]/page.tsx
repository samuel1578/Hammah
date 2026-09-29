import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedCollectionBySlug, getCollectionProducts } from "@/lib/catalogue";
import type { CatalogueProduct } from "@/lib/catalogue";
import type { Product } from "@/types/products";
import { CollectionSlugClient } from "./collection-slug-client";
import { PublicCTA } from "@/components/ui/public-cta";
import { Container } from "@/components/ui/container";
import {
  BreadcrumbListJsonLd,
  CollectionPageJsonLd,
} from "@/components/seo/json-ld";
import {
  OG_IMAGE,
  OG_IMAGE_PATH,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/seo/site";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

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
    videoUrl: p.videoUrl,
    sizeGuideId: p.sizeGuideId,
    media: p.media,
    variants: p.variants,
  }));
}

function collectionDescription(name: string, description?: string) {
  const trimmed = description?.trim();
  if (trimmed) return trimmed;
  return `Explore ${name} from SL by HAMMAH — contemporary African fashion shaped through expressive African print and statement trousers.`;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPublishedCollectionBySlug(slug);
  if (!collection) {
    return {
      title: "Collection Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = collectionDescription(collection.name, collection.description);
  const url = absoluteUrl(`/collections/${slug}`);
  const title = `${collection.name} | SL by HAMMAH`;

  return {
    title: collection.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
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

  const description = collectionDescription(collection.name, collection.description);
  const url = absoluteUrl(`/collections/${slug}`);

  return (
    <>
      <CollectionPageJsonLd
        name={collection.name}
        description={description}
        url={url}
        image={absoluteUrl(OG_IMAGE_PATH)}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", item: absoluteUrl("/") },
          { name: "Collections", item: absoluteUrl("/collections") },
          { name: collection.name },
        ]}
      />
      <Container className="py-4 text-center">
        <PublicCTA slot="collection_hero" />
      </Container>
      <CollectionSlugClient
        collection={{ id: collection.id, slug: collection.slug, name: collection.name, description: collection.description }}
        products={toLegacyProducts(products)}
      />
      <Container className="py-8 text-center">
        <PublicCTA slot="collection_footer" />
      </Container>
    </>
  );
}
