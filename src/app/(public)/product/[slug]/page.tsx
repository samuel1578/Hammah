import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedProductBySlug, getRelatedProducts } from "@/lib/catalogue";
import type { CatalogueProduct } from "@/lib/catalogue";
import { PdpClient } from "@/components/product/pdp-client";
import type { Product } from "@/types/products";
import { BreadcrumbListJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import { OG_IMAGE, OG_IMAGE_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

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
    priceAmount: p.priceAmount,
    currency: p.currency,
    availability: p.availability,
    description: p.description,
    videoUrl: p.videoUrl,
    sizeGuideId: p.sizeGuideId,
    media: p.media,
    variants: p.variants,
  };
}

function productDescription(name: string, description?: string) {
  const trimmed = description?.trim();
  if (trimmed) return trimmed;
  return `Discover ${name} by SL by HAMMAH — part of our contemporary African fashion collection.`;
}

function productImage(product: CatalogueProduct) {
  const primary = product.media.primary?.trim();
  if (primary) return primary;
  const first = product.media.gallery.find((image) => image?.trim());
  return first || undefined;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = productDescription(product.name, product.description);
  const url = absoluteUrl(`/product/${slug}`);
  const title = `${product.name} | SL by HAMMAH`;
  const image = productImage(product);

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      ...(image ? { images: [{ url: image, alt: `${product.name} by SL by HAMMAH` }] } : { images: [OG_IMAGE] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image ?? OG_IMAGE_PATH],
    },
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

  const description = productDescription(product.name, product.description);
  const url = absoluteUrl(`/product/${slug}`);
  const image = productImage(product);

  const related = relatedRaw.map(toLegacyProduct);

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={description}
        url={url}
        image={image ?? absoluteUrl(OG_IMAGE_PATH)}
        category={product.category.name || undefined}
        pricingMode={product.pricingMode}
        priceAmount={product.priceAmount}
        currency={product.currency}
        availability={product.availability}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", item: absoluteUrl("/") },
          { name: "Shop", item: absoluteUrl("/shop") },
          { name: product.name },
        ]}
      />
      <PdpClient product={toLegacyProduct(product)} relatedProducts={related} />
    </>
  );
}
