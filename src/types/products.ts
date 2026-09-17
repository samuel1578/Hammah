/* ── Product Types ── */

export type PricingMode = "PRICE_ON_REQUEST" | "FIXED";
export type Availability = "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";
export type MediaMode = "photos" | "video";

export interface ProductMedia {
  primary: string;
  /** Distinct image shown on desktop hover / mobile second slide */
  hover?: string;
  gallery: string[];
  details: string[];
  thumbnail: string;
}

export interface Product {
  dbId: string;
  id: string;
  slug: string;
  name: string;
  collection: string;
  category: string;
  pricingMode: PricingMode;
  availability: Availability;
  description: string;
  videoUrl: string | null;
  sizeGuideId: string | null;
  media: ProductMedia;
  variants: ProductVariant[];
}

/* ── Collection Types ── */

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  heroImage?: string;
  products: string[];
  visibility?: "PUBLISHED" | "HIDDEN";
  sortOrder?: number;
}

/* ── Category Types ── */

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  route: string;
  visibility?: "PUBLISHED" | "HIDDEN";
  sortOrder?: number;
}

/* ── Variant Types ── */

export interface ProductVariant {
  label: string;
  value: string;
  available: boolean;
}
