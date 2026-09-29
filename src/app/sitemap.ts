import type { MetadataRoute } from "next";
import {
  getPublishedCollectionSitemapEntries,
  getPublishedProductSitemapEntries,
} from "@/lib/catalogue";
import { absoluteUrl } from "@/lib/seo/site";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
  { url: absoluteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteUrl("/collections"), changeFrequency: "daily", priority: 0.8 },
  { url: absoluteUrl("/our-story"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/legacy"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/delivery"), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/returns"), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/size-guide"), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
  { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getPublishedProductSitemapEntries(),
    getPublishedCollectionSitemapEntries(),
  ]);

  const collectionRoutes: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: absoluteUrl(`/collections/${collection.slug}`),
      lastModified: new Date(collection.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
