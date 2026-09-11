import type { PricingMode, Availability } from "@/types/products";

export interface CatalogueProduct {
  dbId: string;
  id: string;
  slug: string;
  name: string;
  description: string;
  category: { slug: string; name: string };
  collection?: { slug: string; name: string };
  pricingMode: PricingMode;
  availability: Availability;
  sortOrder: number;
  media: {
    primary: string;
    hover?: string;
    gallery: string[];
    details: string[];
    thumbnail: string;
  };
  variants: { label: string; value: string; available: boolean }[];
}

export interface CatalogueCollection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
}

export interface CatalogueCategory {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  sortOrder: number;
}
