import type { Category } from "@/types/products";

export const categories: Category[] = [
  {
    id: "trousers",
    slug: "trousers",
    name: "Trousers",
    shortDescription: "African-print trousers form the opening Hammah collection.",
    route: "/collections/collection-001",
    visibility: "PUBLISHED",
    sortOrder: 1,
  },
  {
    id: "kaftans",
    slug: "kaftans",
    name: "Kaftans",
    shortDescription: "A wider expression of the Hammah wardrobe.",
    route: "/collections/kaftans",
    visibility: "PUBLISHED",
    sortOrder: 2,
  },
  {
    id: "footwear",
    slug: "footwear",
    name: "African-made Footwear",
    shortDescription: "The Hammah wardrobe continues from the ground up.",
    route: "/collections/footwear",
    visibility: "PUBLISHED",
    sortOrder: 3,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
