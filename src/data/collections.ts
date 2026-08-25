import type { Collection } from "@/types/products";

export const collections: Collection[] = [
  {
    id: "collection-001",
    slug: "collection-001",
    name: "Collection 001",
    description: "Eight African-print trouser designs form the first orderable Hammah collection.",
    heroImage: "/images/hammah/collections/collection-001/",
    products: [
      "design-01",
      "design-02",
      "design-03",
      "design-04",
      "design-05",
      "design-06",
      "design-07",
      "design-08",
    ],
    visibility: "PUBLISHED",
    sortOrder: 1,
  },
  {
    id: "kaftans",
    slug: "kaftans",
    name: "Kaftans",
    description: "A wider expression of the Hammah wardrobe.",
    heroImage: "/images/hammah/collections/kaftans/",
    products: [],
    visibility: "PUBLISHED",
    sortOrder: 2,
  },
  {
    id: "footwear",
    slug: "footwear",
    name: "Footwear",
    description: "The Hammah wardrobe continues from the ground up.",
    heroImage: "/images/hammah/collections/footwear/",
    products: [],
    visibility: "PUBLISHED",
    sortOrder: 3,
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}
