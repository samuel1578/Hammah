/* ── Media Manifest ── */

import { COLLECTION_001_PIXIESET } from "@/data/pixieset-collection-001";

export type MediaIntent =
  | "hero"
  | "editorial"
  | "product"
  | "ambient"
  | "decorative"
  | "campaign";

export type MotionIntent =
  | "fade-in"
  | "slide-up"
  | "parallax"
  | "scale"
  | "clip-reveal"
  | "stagger"
  | "none";

export type MediaType = "image" | "video";

export interface MediaSlot {
  id: string;
  route: string;
  section: string;
  role: MediaIntent;
  currentSrc: string;
  futureSrc: string;
  aspectRatio: string;
  intent: string;
  motionIntent: MotionIntent;
  type?: MediaType;
}

/* ── Helper: grab URL from verified Pixieset pool by 1-based number ── */
const P = COLLECTION_001_PIXIESET;
const u = (n: number) => P[n - 1]?.url ?? "";

/* ── Unsplash: ONLY for Kaftans + Footwear reference imagery ── */
const KAFTAN_IMG = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80&auto=format&fit=crop";
const KAFTAN_IMG2 = "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80&auto=format&fit=crop";
const FOOTWEAR_IMG = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop";
const FOOTWEAR_IMG2 = "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80&auto=format&fit=crop";

export const mediaManifest: MediaSlot[] = [
  /* ═══════════════════════════════════════════
     HOMEPAGE — all Collection 001 / Trousers
     ═══════════════════════════════════════════ */
  { id: "home-hero", route: "/", section: "hero", role: "hero", currentSrc: "/herovideo.mp4", futureSrc: "/images/hammah/home/hero/main.jpg", aspectRatio: "16/9", intent: "Primary hero — Collection 001 campaign", motionIntent: "scale", type: "video" },
  { id: "home-collection-01", route: "/", section: "collection-001", role: "editorial", currentSrc: u(1), futureSrc: "/images/hammah/home/collection/01.jpg", aspectRatio: "4/5", intent: "Collection 001 — editorial trouser showcase", motionIntent: "slide-up" },
  { id: "home-collection-02", route: "/", section: "collection-001", role: "editorial", currentSrc: u(2), futureSrc: "/images/hammah/home/collection/02.jpg", aspectRatio: "4/5", intent: "Collection 001 — second editorial view", motionIntent: "slide-up" },
  { id: "home-collection-03", route: "/", section: "collection-001", role: "editorial", currentSrc: u(3), futureSrc: "/images/hammah/home/collection/03.jpg", aspectRatio: "4/5", intent: "Collection 001 — third editorial view", motionIntent: "slide-up" },
  { id: "home-collection-04", route: "/", section: "collection-001", role: "editorial", currentSrc: u(4), futureSrc: "/images/hammah/home/collection/04.jpg", aspectRatio: "3/4", intent: "Collection 001 — fourth editorial view", motionIntent: "slide-up" },
  { id: "home-category-trousers", route: "/", section: "hammah-world", role: "editorial", currentSrc: u(5), futureSrc: "/images/hammah/home/categories/trousers.jpg", aspectRatio: "3/4", intent: "Category — Trousers dominant visual", motionIntent: "fade-in" },
  { id: "home-category-kaftans", route: "/", section: "hammah-world", role: "editorial", currentSrc: "/images/hammah/home/categories/kaftan.jpg", futureSrc: "/images/hammah/home/categories/kaftan.jpg", aspectRatio: "4/5", intent: "Category — Kaftans reference visual", motionIntent: "fade-in" },
  { id: "home-category-footwear", route: "/", section: "hammah-world", role: "editorial", currentSrc: FOOTWEAR_IMG, futureSrc: "/images/hammah/home/categories/footwear.jpg", aspectRatio: "4/5", intent: "Category — Footwear reference visual", motionIntent: "fade-in" },
  { id: "home-craft-01", route: "/", section: "detail-craft", role: "editorial", currentSrc: u(6), futureSrc: "/images/hammah/home/craft/detail-01.jpg", aspectRatio: "1/1", intent: "Detail — print close-up", motionIntent: "parallax" },
  { id: "home-craft-02", route: "/", section: "detail-craft", role: "editorial", currentSrc: u(7), futureSrc: "/images/hammah/home/craft/detail-02.jpg", aspectRatio: "1/1", intent: "Detail — construction close-up", motionIntent: "parallax" },
  { id: "home-featured-01", route: "/", section: "featured-pieces", role: "product", currentSrc: u(11), futureSrc: "/images/hammah/products/design-01/main.jpg", aspectRatio: "3/4", intent: "Product card — Design 01", motionIntent: "fade-in" },
  { id: "home-featured-02", route: "/", section: "featured-pieces", role: "product", currentSrc: u(16), futureSrc: "/images/hammah/products/design-02/main.jpg", aspectRatio: "3/4", intent: "Product card — Design 02", motionIntent: "fade-in" },
  { id: "home-featured-03", route: "/", section: "featured-pieces", role: "product", currentSrc: u(26), futureSrc: "/images/hammah/products/design-03/main.jpg", aspectRatio: "3/4", intent: "Product card — Design 03", motionIntent: "fade-in" },
  { id: "home-featured-04", route: "/", section: "featured-pieces", role: "product", currentSrc: u(38), futureSrc: "/images/hammah/products/design-04/main.jpg", aspectRatio: "3/4", intent: "Product card — Design 04", motionIntent: "fade-in" },
  { id: "home-pov", route: "/", section: "point-of-view", role: "hero", currentSrc: u(12), futureSrc: "/images/hammah/home/story/pov.jpg", aspectRatio: "3/4", intent: "Point of View — editorial portrait", motionIntent: "fade-in" },
  { id: "home-legacy", route: "/", section: "legacy", role: "editorial", currentSrc: u(13), futureSrc: "/images/hammah/home/legacy/legacy.jpg", aspectRatio: "16/9", intent: "Legacy section — membership visual", motionIntent: "fade-in" },
  { id: "home-closing", route: "/", section: "closing", role: "hero", currentSrc: u(14), futureSrc: "/images/hammah/home/closing/campaign.jpg", aspectRatio: "16/9", intent: "Closing campaign — Collection 001 composition", motionIntent: "clip-reveal" },

  /* ═══════════════════════════════════════════
     SHOP
     ═══════════════════════════════════════════ */
  { id: "shop-hero", route: "/shop", section: "hero", role: "hero", currentSrc: "/images/hammah/shop/hero/shop-hero.png", futureSrc: "/images/hammah/shop/hero/shop-hero.png", aspectRatio: "16/9", intent: "Shop page hero — Collection 001 campaign", motionIntent: "scale" },
  { id: "shop-product-01", route: "/shop", section: "products", role: "product", currentSrc: u(11), futureSrc: "/images/hammah/products/design-01/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 01", motionIntent: "fade-in" },
  { id: "shop-product-02", route: "/shop", section: "products", role: "product", currentSrc: u(16), futureSrc: "/images/hammah/products/design-02/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 02", motionIntent: "fade-in" },
  { id: "shop-product-03", route: "/shop", section: "products", role: "product", currentSrc: u(26), futureSrc: "/images/hammah/products/design-03/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 03", motionIntent: "fade-in" },
  { id: "shop-product-04", route: "/shop", section: "products", role: "product", currentSrc: u(38), futureSrc: "/images/hammah/products/design-04/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 04", motionIntent: "fade-in" },
  { id: "shop-product-05", route: "/shop", section: "products", role: "product", currentSrc: u(56), futureSrc: "/images/hammah/products/design-05/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 05", motionIntent: "fade-in" },
  { id: "shop-product-06", route: "/shop", section: "products", role: "product", currentSrc: u(75), futureSrc: "/images/hammah/products/design-06/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 06", motionIntent: "fade-in" },
  { id: "shop-product-07", route: "/shop", section: "products", role: "product", currentSrc: u(125), futureSrc: "/images/hammah/products/design-07/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 07", motionIntent: "fade-in" },
  { id: "shop-product-08", route: "/shop", section: "products", role: "product", currentSrc: u(141), futureSrc: "/images/hammah/products/design-08/main.jpg", aspectRatio: "3/4", intent: "Shop product — Design 08", motionIntent: "fade-in" },
  { id: "shop-editorial-break", route: "/shop", section: "editorial-break", role: "campaign", currentSrc: u(24), futureSrc: "/images/hammah/shop/editorial/break-01.jpg", aspectRatio: "16/9", intent: "Shop editorial break — Collection 001 campaign", motionIntent: "scale" },

  /* ═══════════════════════════════════════════
     COLLECTIONS INDEX
     ═══════════════════════════════════════════ */
  { id: "collections-c001-hero", route: "/collections", section: "collection-001", role: "campaign", currentSrc: u(25), futureSrc: "/images/hammah/collections/collection-001/hero.jpg", aspectRatio: "4/5", intent: "Collections index — Collection 001 dominant visual", motionIntent: "scale" },
  { id: "collections-kaftans", route: "/collections", section: "kaftans", role: "editorial", currentSrc: KAFTAN_IMG, futureSrc: "/images/hammah/collections/kaftans/preview.jpg", aspectRatio: "4/5", intent: "Collections index — Kaftans reference preview", motionIntent: "fade-in" },
  { id: "collections-footwear", route: "/collections", section: "footwear", role: "editorial", currentSrc: FOOTWEAR_IMG, futureSrc: "/images/hammah/collections/footwear/preview.jpg", aspectRatio: "4/5", intent: "Collections index — Footwear reference preview", motionIntent: "fade-in" },

  /* ═══════════════════════════════════════════
     COLLECTION 001
     ═══════════════════════════════════════════ */
  { id: "c001-hero", route: "/collections/collection-001", section: "hero", role: "campaign", currentSrc: u(26), futureSrc: "/images/hammah/collections/collection-001/hero-01.jpg", aspectRatio: "16/9", intent: "Collection 001 — hero campaign image", motionIntent: "scale" },
  { id: "c001-hero-desktop", route: "/collections/collection-001", section: "hero-desktop", role: "campaign", currentSrc: "/images/hammah/collections/collection-001/colhero-desktop.png", futureSrc: "/images/hammah/collections/collection-001/colhero-desktop.png", aspectRatio: "16/9", intent: "Collection 001 — hero desktop/tablet", motionIntent: "scale" },
  { id: "c001-hero-mobile", route: "/collections/collection-001", section: "hero-mobile", role: "campaign", currentSrc: "/images/hammah/collections/collection-001/colhero-mobile.png", futureSrc: "/images/hammah/collections/collection-001/colhero-mobile.png", aspectRatio: "3/4", intent: "Collection 001 — hero mobile", motionIntent: "scale" },
  { id: "c001-product-01", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(11), futureSrc: "/images/hammah/products/design-01/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 01", motionIntent: "fade-in" },
  { id: "c001-product-02", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(16), futureSrc: "/images/hammah/products/design-02/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 02", motionIntent: "fade-in" },
  { id: "c001-product-03", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(26), futureSrc: "/images/hammah/products/design-03/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 03", motionIntent: "fade-in" },
  { id: "c001-product-04", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(38), futureSrc: "/images/hammah/products/design-04/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 04", motionIntent: "fade-in" },
  { id: "c001-product-05", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(56), futureSrc: "/images/hammah/products/design-05/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 05", motionIntent: "fade-in" },
  { id: "c001-product-06", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(75), futureSrc: "/images/hammah/products/design-06/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 06", motionIntent: "fade-in" },
  { id: "c001-product-07", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(125), futureSrc: "/images/hammah/products/design-07/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 07", motionIntent: "fade-in" },
  { id: "c001-product-08", route: "/collections/collection-001", section: "products", role: "product", currentSrc: u(141), futureSrc: "/images/hammah/products/design-08/main.jpg", aspectRatio: "3/4", intent: "Collection 001 — Design 08", motionIntent: "fade-in" },
  { id: "c001-detail-01", route: "/collections/collection-001", section: "detail", role: "editorial", currentSrc: u(35), futureSrc: "/images/hammah/collections/collection-001/detail-01.jpg", aspectRatio: "1/1", intent: "Collection 001 — detail close-up", motionIntent: "parallax" },
  { id: "c001-detail-02", route: "/collections/collection-001", section: "detail", role: "editorial", currentSrc: u(36), futureSrc: "/images/hammah/collections/collection-001/detail-02.jpg", aspectRatio: "1/1", intent: "Collection 001 — construction detail", motionIntent: "parallax" },

  /* ═══════════════════════════════════════════
     KAFTANS (Coming Soon) — external reference only
     ═══════════════════════════════════════════ */
  { id: "kaftans-hero", route: "/collections/kaftans", section: "hero", role: "editorial", currentSrc: KAFTAN_IMG, futureSrc: "/images/hammah/collections/kaftans/hero.jpg", aspectRatio: "16/9", intent: "Kaftans — editorial preview hero", motionIntent: "fade-in" },
  { id: "kaftans-preview-01", route: "/collections/kaftans", section: "preview", role: "editorial", currentSrc: KAFTAN_IMG2, futureSrc: "/images/hammah/collections/kaftans/preview-01.jpg", aspectRatio: "4/5", intent: "Kaftans — editorial reference image", motionIntent: "slide-up" },

  /* ═══════════════════════════════════════════
     FOOTWEAR (Coming Soon) — external reference only
     ═══════════════════════════════════════════ */
  { id: "footwear-hero", route: "/collections/footwear", section: "hero", role: "editorial", currentSrc: FOOTWEAR_IMG, futureSrc: "/images/hammah/collections/footwear/hero.jpg", aspectRatio: "16/9", intent: "Footwear — editorial preview hero", motionIntent: "fade-in" },
  { id: "footwear-preview-01", route: "/collections/footwear", section: "preview", role: "editorial", currentSrc: FOOTWEAR_IMG2, futureSrc: "/images/hammah/collections/footwear/preview-01.jpg", aspectRatio: "4/5", intent: "Footwear — editorial reference image", motionIntent: "slide-up" },

  /* ═══════════════════════════════════════════
     OUR STORY
     ═══════════════════════════════════════════ */
  { id: "story-hero", route: "/our-story", section: "hero", role: "hero", currentSrc: u(93), futureSrc: "/images/hammah/story/hero/main.jpg", aspectRatio: "16/9", intent: "Our Story — hero campaign", motionIntent: "scale" },
  { id: "story-pov", route: "/our-story", section: "pov", role: "editorial", currentSrc: u(94), futureSrc: "/images/hammah/story/origin/pov.jpg", aspectRatio: "3/4", intent: "Our Story — point of view", motionIntent: "fade-in" },
  { id: "story-african", route: "/our-story", section: "african-fashion", role: "editorial", currentSrc: u(95), futureSrc: "/images/hammah/story/sourcing/african.jpg", aspectRatio: "4/5", intent: "Our Story — African fashion context", motionIntent: "slide-up" },
  { id: "story-craft-01", route: "/our-story", section: "craft", role: "editorial", currentSrc: u(96), futureSrc: "/images/hammah/story/craftsmanship/craft-01.jpg", aspectRatio: "1/1", intent: "Our Story — craft close-up 01", motionIntent: "parallax" },
  { id: "story-craft-02", route: "/our-story", section: "craft", role: "editorial", currentSrc: u(97), futureSrc: "/images/hammah/story/craftsmanship/craft-02.jpg", aspectRatio: "1/1", intent: "Our Story — craft close-up 02", motionIntent: "parallax" },
  { id: "story-sourcing", route: "/our-story", section: "sourcing", role: "editorial", currentSrc: u(98), futureSrc: "/images/hammah/story/sourcing/material.jpg", aspectRatio: "4/5", intent: "Our Story — sourcing", motionIntent: "fade-in" },
  { id: "story-sustainability", route: "/our-story", section: "sustainability", role: "editorial", currentSrc: u(99), futureSrc: "/images/hammah/story/sustainability/main.jpg", aspectRatio: "3/4", intent: "Our Story — sustainability", motionIntent: "fade-in" },
  { id: "story-closing", route: "/our-story", section: "closing", role: "hero", currentSrc: u(100), futureSrc: "/images/hammah/story/closing/campaign.jpg", aspectRatio: "16/9", intent: "Our Story — closing campaign", motionIntent: "clip-reveal" },

  /* ═══════════════════════════════════════════
     LEGACY
     ═══════════════════════════════════════════ */
  { id: "legacy-hero", route: "/legacy", section: "hero", role: "hero", currentSrc: u(101), futureSrc: "/images/hammah/legacy/hero/main.jpg", aspectRatio: "16/9", intent: "Legacy — hero editorial", motionIntent: "scale" },
  { id: "legacy-remembered", route: "/legacy", section: "remembered", role: "editorial", currentSrc: u(102), futureSrc: "/images/hammah/legacy/membership/remembered.jpg", aspectRatio: "3/4", intent: "Legacy — remembered visual", motionIntent: "fade-in" },
  { id: "legacy-since", route: "/legacy", section: "since", role: "editorial", currentSrc: u(103), futureSrc: "/images/hammah/legacy/membership/since.jpg", aspectRatio: "4/5", intent: "Legacy — Hamatee since visual", motionIntent: "slide-up" },
  { id: "legacy-privileges", route: "/legacy", section: "privileges", role: "editorial", currentSrc: u(104), futureSrc: "/images/hammah/legacy/privileges/main.jpg", aspectRatio: "3/4", intent: "Legacy — privileges visual", motionIntent: "fade-in" },

  /* ═══════════════════════════════════════════
     SAVED (uses product media already in pool)
     ═══════════════════════════════════════════ */
  { id: "saved-hero", route: "/saved", section: "hero", role: "hero", currentSrc: u(105), futureSrc: "/images/hammah/home/hero/main.jpg", aspectRatio: "16/9", intent: "Saved — page hero", motionIntent: "scale" },

  /* ═══════════════════════════════════════════
     AUTH — Login / Signup
     ═══════════════════════════════════════════ */
  { id: "login-editorial", route: "/login", section: "hero", role: "editorial", currentSrc: u(110), futureSrc: "/images/hammah/auth/login/login-editorial.jpg", aspectRatio: "4/5", intent: "Login — editorial campaign media", motionIntent: "scale" },
  { id: "signup-step-01", route: "/signup", section: "hero", role: "editorial", currentSrc: u(115), futureSrc: "/images/hammah/auth/signup/step-01.jpg", aspectRatio: "4/5", intent: "Signup — Step 1 editorial media", motionIntent: "scale" },
  { id: "signup-step-02", route: "/signup", section: "step-02", role: "editorial", currentSrc: u(120), futureSrc: "/images/hammah/auth/signup/step-02.jpg", aspectRatio: "4/5", intent: "Signup — Step 2 editorial media", motionIntent: "fade-in" },
];

export function getMediaByRoute(route: string): MediaSlot[] {
  return mediaManifest.filter((m) => m.route === route);
}

export function getMediaBySection(section: string): MediaSlot[] {
  return mediaManifest.filter((m) => m.section === section);
}

export function getMediaById(id: string): MediaSlot | undefined {
  return mediaManifest.find((m) => m.id === id);
}

export function getMediaByRouteAndSection(
  route: string,
  section: string,
): MediaSlot[] {
  return mediaManifest.filter((m) => m.route === route && m.section === section);
}
