import {
  BRAND_ALTERNATE_NAME,
  BRAND_NAME,
  LOGO_PATH,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
} from "@/lib/seo/site";

type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

interface JsonLdProps {
  data: JsonLdData;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        alternateName: BRAND_ALTERNATE_NAME,
        url: SITE_ORIGIN,
        logo: absoluteUrl(LOGO_PATH),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        alternateName: BRAND_ALTERNATE_NAME,
        url: SITE_ORIGIN,
      }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
}

export function ProductJsonLd({
  name,
  description,
  url,
  image,
  category,
}: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
  };

  if (image) data.image = image;
  if (category) data.category = category;

  return <JsonLd data={data} />;
}

interface CollectionJsonLdProps {
  name: string;
  description: string;
  url: string;
  image?: string;
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  image,
}: CollectionJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
  };

  if (image) data.image = image;

  return <JsonLd data={data} />;
}

export interface BreadcrumbItem {
  name: string;
  /** Omit on the final (current) item. */
  item?: string;
}

export function BreadcrumbListJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.name,
          ...(entry.item ? { item: entry.item } : {}),
        })),
      }}
    />
  );
}
