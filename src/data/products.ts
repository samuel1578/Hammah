import type { Product } from "@/types/products";
import { COLLECTION_001_PIXIESET } from "@/data/pixieset-collection-001";

const P = COLLECTION_001_PIXIESET;
const u = (n: number) => P[n - 1]?.url ?? "";

const TEMP_DESCRIPTION =
  "One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.";

const DEFAULT_VARIANTS = [
  { label: "30", value: "30", available: true },
  { label: "32", value: "32", available: true },
  { label: "34", value: "34", available: true },
  { label: "36", value: "36", available: true },
];

export const products: Product[] = [
  {
    id: "design-01", slug: "design-01", name: "Design 01",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(11), hover: u(37), gallery: [u(37), u(38), u(39), u(40), u(41)], details: [u(42), u(43)], thumbnail: u(11) },
    variants: DEFAULT_VARIANTS,
  },
  {
    id: "design-02", slug: "design-02", name: "Design 02",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(16), hover: u(44), gallery: [u(44), u(45), u(46), u(47), u(48)], details: [u(49), u(50)], thumbnail: u(16) },
    variants: DEFAULT_VARIANTS,
  },
  {
    id: "design-03", slug: "design-03", name: "Design 03",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(26), hover: u(51), gallery: [u(51), u(52), u(53), u(54), u(55)], details: [u(56), u(57)], thumbnail: u(26) },
    variants: DEFAULT_VARIANTS,
  },
  {
    id: "design-04", slug: "design-04", name: "Design 04",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(38), hover: u(58), gallery: [u(58), u(59), u(60), u(61), u(62)], details: [u(63), u(64)], thumbnail: u(38) },
    variants: DEFAULT_VARIANTS,
  },
  {
    id: "design-05", slug: "design-05", name: "Design 05",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(56), hover: u(65), gallery: [u(65), u(66), u(67), u(68), u(69)], details: [u(70), u(71)], thumbnail: u(56) },
    variants: DEFAULT_VARIANTS,
  },
  {
    id: "design-06", slug: "design-06", name: "Design 06",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(75), hover: u(72), gallery: [u(72), u(73), u(74), u(76)], details: [u(77), u(78)], thumbnail: u(75) },
    variants: DEFAULT_VARIANTS,
  },
  {
    id: "design-07", slug: "design-07", name: "Design 07",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(125), hover: u(79), gallery: [u(79), u(80), u(81), u(82), u(83)], details: [u(84), u(85)], thumbnail: u(125) },
    variants: DEFAULT_VARIANTS,
  },
  {
    id: "design-08", slug: "design-08", name: "Design 08",
    collection: "collection-001", category: "trousers",
    pricingMode: "PRICE_ON_REQUEST", availability: "AVAILABLE",
    description: TEMP_DESCRIPTION,
    media: { primary: u(141), hover: u(86), gallery: [u(86), u(87), u(88), u(89), u(90)], details: [u(91), u(92)], thumbnail: u(141) },
    variants: DEFAULT_VARIANTS,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return products.filter((p) => p.collection === collectionSlug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug);
}

export function getRelatedProducts(currentSlug: string, count = 4): Product[] {
  return products.filter((p) => p.slug !== currentSlug).slice(0, count);
}
