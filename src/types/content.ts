/* ── Site Content Types ── */

export interface HeroSection {
  heading: string;
  subheading?: string;
  body?: string;
  cta?: {
    label: string;
    href: string;
  };
}

export interface EditorialSection {
  heading: string;
  body?: string;
  mediaSlot?: string;
}

export interface PageContent {
  slug: string;
  title: string;
  metaDescription?: string;
  hero?: HeroSection;
  sections: EditorialSection[];
}
