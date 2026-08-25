/* ── Product Types ── */

export type PricingMode = "PRICE_ON_REQUEST" | "FIXED";
export type Availability = "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";
export type MediaMode = "photos" | "video" | "360";

export interface ProductMedia {
  primary: string;
  /** Distinct image shown on desktop hover / mobile second slide */
  hover?: string;
  gallery: string[];
  details: string[];
  thumbnail: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: string;
  category: string;
  pricingMode: PricingMode;
  availability: Availability;
  description: string;
  media: ProductMedia;
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

/* ── PDP Size Options ── */

export interface SizeOption {
  label: string;
  value: string;
  available: boolean;
}

export const PRODUCT_SIZES: SizeOption[] = [
  { label: "30", value: "30", available: true },
  { label: "32", value: "32", available: true },
  { label: "34", value: "34", available: true },
  { label: "36", value: "36", available: true },
];
