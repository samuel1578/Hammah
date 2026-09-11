# HAMMAH — Sprint 0.14 Architecture Investigation

## Commerce Domain & Admin Data Architecture Blueprint

**Date:** September 11, 2026
**Status:** Investigation Complete — Architecture Proposed
**Scope:** Repository inspection, domain modelling, Supabase schema, Admin IA, migration strategy

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Findings](#2-current-architecture-findings)
3. [Current Hardcoded Data Inventory](#3-current-hardcoded-data-inventory)
4. [Product Domain Findings](#4-product-domain-findings)
5. [Category Domain Findings](#5-category-domain-findings)
6. [Collection Domain Findings](#6-collection-domain-findings)
7. [Product Media Findings](#7-product-media-findings)
8. [Photos Architecture](#8-photos-architecture)
9. [Video Architecture](#9-video-architecture)
10. [360° Architecture](#10-360-architecture)
11. [`/dev/media` Findings](#11-devmedia-findings)
12. [Future Media Library Design](#12-future-media-library-design)
13. [Homepage Merchandising Findings](#13-homepage-merchandising-findings)
14. [Hamatee / Legacy Findings](#14-hamatee--legacy-findings)
15. [Auth Findings](#15-auth-findings)
16. [Saved Pieces Findings](#16-saved-pieces-findings)
17. [Order-Flow Findings](#17-order-flow-findings)
18. [Archive/Delete Semantics](#18-archive-delete-semantics)
19. [Publishing Model](#19-publishing-model)
20. [Proposed Supabase Schema](#20-proposed-supabase-schema)
21. [Constraints/Indexes/Relationships](#21-constraintsindexesrelationships)
22. [RLS/Access-Control Matrix](#22-rlsaccess-control-matrix)
23. [Cloudflare Media Contract](#23-cloudflare-media-contract)
24. [Current → Future Migration Matrix](#24-current--future-migration-matrix)
25. [Admin Information Architecture](#25-admin-information-architecture)
26. [Product Editor Specification](#26-product-editor-specification)
27. [Collection Editor Specification](#27-collection-editor-specification)
28. [Media Management Specification](#28-media-management-specification)
29. [Route/URL Recommendations](#29-routeurl-recommendations)
30. [SEO Requirements](#30-seo-requirements)
31. [Caching/Performance Strategy](#31-cachingperformance-strategy)
32. [Supabase Free Considerations](#32-supabase-free-considerations)
33. [Migration Strategy](#33-migration-strategy)
34. [Risks / Open Questions](#34-risks--open-questions)
35. [Recommended Sprint 0.15–0.20 Implementation Sequence](#35-recommended-sprint-015020-implementation-sequence)

---

## 1. Executive Summary

HAMMAH is a Next.js 16.3 / React 19 / TypeScript / Tailwind CSS v4 fashion commerce application. The public frontend is substantially complete across 19 routes (18 public + `/dev/media`). All product data, media references, editorial content, and navigation are currently hardcoded in TypeScript fixture files. No backend, database, authentication, or admin interface exists.

This sprint inspected the actual repository to produce a canonical architecture blueprint for transitioning HAMMAH from hardcoded fixtures to a production commerce platform powered by Supabase (database, auth, RLS) and Cloudflare (media delivery).

**Key findings:**
- 8 products with 7 curated Pixieset images each (56 product images total from a 160-image pool)
- 3 categories (Trousers, Kaftans, Footwear) — categories currently masquerade as collections in routing
- 3 collections (Collection 001 with 8 products, Kaftans empty, Footwear empty)
- ~55 media slot entries across all routes in a typed media manifest
- Order flow is request-based (not instant checkout) — customer submits request, Hammah continues conversation
- Authentication is fully mocked — no real auth exists
- Saved Pieces is frontend-only state
- Video and 360° are placeholder tabs on PDP
- `/dev/media` is a functional 160-image contact sheet for developers

**Recommended production architecture:** Supabase Free (PostgreSQL + Auth + RLS) for all business data and user accounts, Cloudflare for media storage/delivery, Next.js server components for public reads, Admin dashboard for business content management.

---

## 2. Current Architecture Findings

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.3.2 |
| React | React | 19.2.8 |
| Language | TypeScript | ^5 (strict) |
| Styling | Tailwind CSS | ^4 |
| Animation | Motion (Framer Motion) | ^13.1.1 |
| Carousel | Swiper | ^14.1.0 |
| Icons | Lucide React | ^1.33.0 |
| Themes | next-themes | ^0.4.6 |
| Module Resolution | Bundler | — |
| Path Alias | `@/*` → `./src/*` | — |

### Source Structure

```
src/
├── app/
│   ├── layout.tsx              (root layout, metadata, fonts)
│   ├── globals.css             (CSS variables, typography system, CTA styles)
│   ├── (public)/
│   │   ├── layout.tsx          (route group layout)
│   │   ├── page.tsx            (/ — homepage)
│   │   ├── shop/page.tsx       (/shop)
│   │   ├── collections/
│   │   │   ├── page.tsx        (/collections)
│   │   │   ├── collection-001/page.tsx
│   │   │   ├── kaftans/page.tsx
│   │   │   └── footwear/page.tsx
│   │   ├── product/[slug]/
│   │   │   ├── page.tsx        (dynamic PDP)
│   │   │   └── not-found.tsx
│   │   ├── our-story/page.tsx
│   │   ├── legacy/page.tsx
│   │   ├── saved/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── track/page.tsx
│   │   ├── delivery/page.tsx
│   │   ├── returns/page.tsx
│   │   ├── size-guide/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   └── dev/media/page.tsx      (development-only)
├── components/ (43 files across 9 directories)
├── data/ (7 fixture files)
├── types/ (2 type definition files)
├── lib/ (empty)
└── styles/ (fonts.ts)
```

### Data Flow Pattern

All pages currently import directly from `src/data/` fixtures:
- `products.ts` → `getProductBySlug()`, `getProductsByCollection()`, `getProductsByCategory()`, `getRelatedProducts()`
- `collections.ts` → `getCollectionBySlug()`
- `categories.ts` → `getCategoryBySlug()`
- `media-manifest.ts` → `getMediaByRoute()`, `getMediaBySection()`, `getMediaById()`, `getMediaByRouteAndSection()`
- `pixieset-collection-001.ts` → raw 160-image pool with numbered access helpers
- `navigation.ts` → static nav structures
- `site-content.ts` → page metadata (mostly unused by pages)

### Server vs Client Components

- **Server components:** `editorial-heading`, `product-price`, `availability-label`, `button`, `container`, `section`, `legal-section`, `site-footer`, root layout, `(public)/layout`
- **Client components:** All 8 homepage sections, all product components, shop page, collections pages, auth pages, saved page, track page, mobile menu, theme components

---

## 3. Current Hardcoded Data Inventory

### Type Definitions

| File | Types Defined |
|------|--------------|
| `src/types/products.ts` | `PricingMode`, `Availability`, `MediaMode`, `ProductMedia`, `Product`, `Collection`, `Category`, `SizeOption`, `PRODUCT_SIZES` (fixture) |
| `src/types/content.ts` | `HeroSection`, `EditorialSection`, `PageContent` |

### Fixture Files

| File | Records | Key Data |
|------|---------|----------|
| `src/data/products.ts` | 8 products | Design 01–08, all Collection 001 / Trousers / PRICE_ON_REQUEST / AVAILABLE |
| `src/data/collections.ts` | 3 collections | Collection 001 (8 product IDs), Kaftans (empty), Footwear (empty) |
| `src/data/categories.ts` | 3 categories | Trousers, Kaftans, African-made Footwear |
| `src/data/pixieset-collection-001.ts` | 160 images | All from Pixieset gallery 638827911 |
| `src/data/media-manifest.ts` | ~55 MediaSlot entries | Route-based media references for all pages |
| `src/data/navigation.ts` | 4 nav structures | Primary, Utility, Category, Footer |
| `src/data/site-content.ts` | 4 page entries | Minimal page metadata (largely unused) |

### Inline Hardcoded Data (in components/pages)

| Location | Data |
|----------|------|
| `home-editorial-hero.tsx` | 4 hero rotation images (Pixieset URLs directly) |
| `home-world.tsx` | 3 category entries with labels, status, hrefs, mediaIds |
| `home-featured.tsx` | None (reads from fixtures) |
| `home-craft.tsx` | INITIAL_PAIR, ROTATION_INTERVAL |
| `home-legacy.tsx` | 4 benefit items |
| `home-faq.tsx` | 8 FAQ items |
| `product-info-panel.tsx` | Hardcoded "Collection 001" and "Category: Trousers" text |
| `order-drawer.tsx` | Hardcoded "Collection 001" in order summary |
| `product-card.tsx` | Hardcoded "Collection 001" label |
| `related-pieces.tsx` | "More from Collection 001" heading |
| `shop/page.tsx` | Hardcoded editorial copy |
| `collection-001/page.tsx` | Hardcoded "Design 01" featured product name |
| `our-story/page.tsx` | Extensive hardcoded editorial copy (761 lines) |
| `delivery/page.tsx` | 4 hardcoded delivery steps |
| `track/page.tsx` | 7 hardcoded tracking timeline steps |
| `size-guide/page.tsx` | 6 measurement types, 4 size rows with placeholder dashes |
| `saved/page.tsx` | `demoProducts = products.slice(0, 4)` |
| `layout.tsx` | Root metadata: title, description, metadataBase, OG image |

---

## 4. Product Domain Findings

### Current Product Interface

```typescript
// src/types/products.ts
interface Product {
  id: string;              // "design-01" (slug-like ID)
  slug: string;            // "design-01" (same as id)
  name: string;            // "Design 01"
  collection: string;      // "collection-001" (slug reference)
  category: string;        // "trousers" (slug reference)
  pricingMode: PricingMode; // "PRICE_ON_REQUEST"
  availability: Availability; // "AVAILABLE"
  description: string;     // Temporary placeholder text
  media: ProductMedia;
}

interface ProductMedia {
  primary: string;         // Pixieset URL
  hover?: string;          // Pixieset URL (alternate view)
  gallery: string[];       // 4-5 Pixieset URLs
  details: string[];       // 2 Pixieset URLs
  thumbnail: string;       // Pixieset URL (same as primary)
}
```

### Current Product Data (8 products)

| Product | ID | Primary Image | Gallery Size | Collection |
|---------|-----|---------------|-------------|------------|
| Design 01 | design-01 | u(11) | 5 gallery + 2 details | collection-001 |
| Design 02 | design-02 | u(16) | 5 gallery + 2 details | collection-001 |
| Design 03 | design-03 | u(26) | 5 gallery + 2 details | collection-001 |
| Design 04 | design-04 | u(38) | 5 gallery + 2 details | collection-001 |
| Design 05 | design-05 | u(56) | 5 gallery + 2 details | collection-001 |
| Design 06 | design-06 | u(75) | 4 gallery + 2 details | collection-001 |
| Design 07 | design-07 | u(125) | 5 gallery + 2 details | collection-001 |
| Design 08 | design-08 | u(141) | 5 gallery + 2 details | collection-001 |

### Consumer Components

| Component | How it uses Product |
|-----------|-------------------|
| `product-card.tsx` | Reads `media.primary`, `media.hover`, `media.gallery` for card images; displays `name`, `collection`, `pricingMode`, `availability` |
| `product-info-panel.tsx` | Displays `name`, `description`, `pricingMode`, `availability`; uses `PRODUCT_SIZES` for size selector |
| `pdp-client.tsx` | Passes entire `product` to gallery, info panel, order drawer |
| `product-gallery.tsx` | Uses `[...media.gallery, ...media.details]` as all images |
| `order-drawer.tsx` | Uses `media.primary` for thumbnail, `name`, hardcoded "Collection 001" |
| `related-pieces.tsx` | Calls `getRelatedProducts(currentSlug, 4)` |
| `home-featured.tsx` | Calls `getProductsByCollection("collection-001").slice(0, 4)` |
| `shop/page.tsx` | Calls `products` directly, filters by category |
| `collection-001/page.tsx` | Calls `getProductsByCollection("collection-001")` |
| `saved/page.tsx` | Uses `products.slice(0, 4)` as demo data |

### Key Observations

1. `id` and `slug` are identical — no separate UUID/numeric ID exists
2. `collection` is a string slug, not a foreign key — no referential integrity
3. `category` is a string slug, same issue
4. `PRODUCT_SIZES` is a global fixture — all products share the same 4 sizes (30, 32, 34, 36)
5. No price field exists (all are PRICE_ON_REQUEST)
6. No sort order field on products
7. No publish/draft state on products
8. No timestamp fields (created_at, updated_at)
9. `media.thumbnail` always equals `media.primary` — redundant field
10. Product names are "Design 01"–"Design 08" — placeholder naming

---

## 5. Category Domain Findings

### Current Category Interface

```typescript
interface Category {
  id: string;              // "trousers"
  slug: string;            // "trousers"
  name: string;            // "Trousers"
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  route: string;           // "/collections/collection-001" — PROBLEM
  visibility?: "PUBLISHED" | "HIDDEN";
  sortOrder?: number;
}
```

### Current Categories

| Category | Slug | Route | Problem |
|----------|------|-------|---------|
| Trousers | trousers | `/collections/collection-001` | Category route points to a collection |
| Kaftans | kaftans | `/collections/kaftans` | Collection slug doubles as category |
| Footwear | footwear | `/collections/footwear` | Collection slug doubles as category |

### Semantic Mismatch

**Current state:** Product categories and collections share the same URL space. "Trousers" is a category, but its page is `/collections/collection-001`. "Kaftans" is both a category and a collection at `/collections/kaftans`.

**Problem:** This conflates two distinct concepts:
- **Category** = product classification (trousers, kaftans, footwear)
- **Collection** = editorial/commercial grouping (Collection 001, future Collection 002, Seasonal, etc.)

A future Collection 002 could contain trousers AND kaftans, or a "Summer Essentials" collection could span categories. The current model cannot express this cleanly.

### Recommended Future IA

| Concept | URL Pattern | Purpose |
|---------|-------------|---------|
| Category browse | `/shop/trousers`, `/shop/kaftans`, `/shop/footwear` | Product classification |
| Collection browse | `/collections`, `/collections/[slug]` | Editorial grouping |
| Shop index | `/shop` | All products with category filters |

**Migration requirement:** `/collections/kaftans` and `/collections/footwear` currently serve as both category pages and collection pages. When the model splits, these routes need careful handling — they are currently "coming soon" pages with no products, so the migration is low-risk.

**Compatibility:** No URL changes during Sprint 0.14. Document only. `/collections/collection-001` will eventually become `/collections/[slug]` for any collection, and category browsing will move to `/shop/[category]`.

---

## 6. Collection Domain Findings

### Current Collection Interface

```typescript
interface Collection {
  id: string;              // "collection-001"
  slug: string;            // "collection-001"
  name: string;            // "Collection 001"
  description?: string;
  heroImage?: string;      // Local path (incomplete)
  products: string[];      // ["design-01", ..., "design-008"]
  visibility?: "PUBLISHED" | "HIDDEN";
  sortOrder?: number;
}
```

### Current Collections

| Collection | Products | Visibility | Notes |
|------------|----------|------------|-------|
| Collection 001 | 8 product IDs | PUBLISHED | Active, has full page |
| Kaftans | [] (empty) | PUBLISHED | Placeholder, no products |
| Footwear | [] (empty) | PUBLISHED | Placeholder, no products |

### Consumer Components

| Component | How it uses Collection |
|-----------|----------------------|
| `collections/page.tsx` | Renders Collection 001 dominant + Kaftans/Footwear previews |
| `collection-001/page.tsx` | Calls `getProductsByCollection("collection-001")` |
| `collections/kaftans/page.tsx` | Standalone editorial page (no product data) |
| `collections/footwear/page.tsx` | Standalone editorial page (no product data) |
| `navigation.ts` | Static nav references to collection slugs |
| `home-world.tsx` | Category links point to collection routes |

### Key Observations

1. Collection-product relationship is a string array (`products: string[]`) — not normalized
2. No many-to-many junction — one collection has many products, but a product can only belong to one collection (via `product.collection` field)
3. No collection hero media in the data model — `heroImage` field exists but is incomplete; actual hero images come from `media-manifest.ts`
4. Collection pages have extensive hardcoded editorial copy
5. `collection-001/page.tsx` hardcodes "Design 01" as the featured product
6. Kaftans and Footwear "collections" are really category placeholders

### Recommended Future Model

**One collection → many products** (via junction table)
**One product → potentially many collections** (future flexibility)

Collection entity should own: name, slug, description, hero media, editorial copy, publish state, sort order.

Product-to-collection assignment happens via Admin, not hardcoded arrays.

---

## 7. Product Media Findings

### Current Media Mode Selector

The PDP (`pdp-client.tsx`) renders a `MediaModeSelector` with three tabs:

| Tab | Icon | Status |
|-----|------|--------|
| Photos | Camera | **Functional** — renders `ProductGallery` |
| Video | Video | **Placeholder** — renders `MediaModePlaceholder` ("Product video will appear here when available") |
| 360° | Box | **Placeholder** — renders `MediaModePlaceholder` ("Interactive garment view coming later") |

**Important:** All three tabs are always visible regardless of whether the product has video or 360° media. There is no conditional rendering based on available media.

### Current Image Flow

1. `ProductGallery` receives `allImages = [...product.media.gallery, ...product.media.details]`
2. Gallery renders primary image + horizontal thumbnail strip + fullscreen lightbox
3. Lightbox has keyboard navigation (arrows, Escape), prev/next buttons, image counter

### Media Manifest Relationship

The `media-manifest.ts` provides route-level media slots (`MediaSlot`) that are consumed by page components for hero images, editorial imagery, and product card images. This is a **separate system** from product-level media (`ProductMedia`). They overlap for product cards — the `ProductCard` component accepts an optional `media?: MediaSlot` that can override `product.media.primary`.

---

## 8. Photos Architecture

### Recommended Production Model

**Separate global media assets from product-media assignments.**

```
media_assets (global pool)
    ↕ referenced by
product_media (junction with ordering + role)
```

### Media Asset Entity

A `media_assets` table stores each uploaded file's metadata once. The same asset can be referenced by multiple products, collections, or homepage slots.

### Product-Media Junction

Each product has a set of media assignments with:
- Reference to `media_assets`
- Role: `primary`, `hover`, `gallery`, `detail`, `thumbnail`
- Sort order (integer, for gallery ordering)
- The current curated grouping (56 images across 8 products) becomes seed data in this junction

### Cardinality

- One product: 1 primary, 0–1 hover, 0–N gallery, 0–N detail, 1 thumbnail
- One media asset: can belong to 0–N products (reuse potential)
- Gallery ordering: explicit integer sort order

---

## 9. Video Architecture

### Current State

- Video tab exists on PDP but shows a placeholder message
- Homepage hero uses `/herovideo.mp4` (2.6 MB) and `/mobhero.mp4` for video background
- No product-level video data exists

### Recommended Production Model

Products may have an associated video. The simplest model:

- Optional video reference on the product entity (FK to `media_assets`)
- A single video per product (MVP) — no ordering needed
- Poster image: either the product's primary image or a dedicated poster asset

### Video Tab Visibility

Future PDP should conditionally render tabs:
- Product has photos only → show "Photos" tab only (no tab bar needed)
- Product has photos + video → show "Photos | Video"
- Product has photos + video + 360 → show "Photos | Video | 360°"

Do not show disabled/dead tabs without content.

### Storage

Video files should be stored on Cloudflare (R2 or Stream), not Supabase Storage. The database stores the URL/reference. Reasonable MVP constraints:
- Max duration: 60 seconds
- Max file size: 100 MB
- Formats: MP4 (H.264)
- Poster: separate image asset

---

## 10. 360° Architecture

### Current State

- 360° tab exists on PDP but shows a placeholder message
- No 360° data, frame sequences, or viewer component exists

### Recommended Direction: Image Sequence

An image-sequence 360° viewer (not GLB/Three.js) where:
1. Photographer captures 24–36 frames around the product
2. Dragging horizontally advances/reverses through frames
3. All frames preloaded for instant response

### Recommended Model

Option A: **Dedicated `product_360_sets` + `product_360_frames`** — cleaner but more tables
Option B: **Use generic `media_assets` with a `set_id` grouping** — simpler, fewer tables

**Recommendation:** Option B — use `media_assets` with an optional `set_id` or `set_identifier` field. A 360° set is just a group of images with a known frame count and ordering. No need for a separate table.

### Frame Requirements

| Attribute | Recommendation |
|-----------|---------------|
| Frame count | 24 frames (standard) or 36 (higher quality) |
| Naming/ordering | Integer `frame_order` on each asset in the set |
| Storage key pattern | `products/{product_id}/360/{set_id}/frame-{NNN}.jpg` |
| Dimensions | Consistent across all frames (e.g., 1200×1200) |
| Preload | JavaScript preloads all frames before activating viewer |
| Touch | Horizontal drag maps to frame index |
| Mouse | Horizontal drag + scroll wheel |
| Keyboard | Left/Right arrows |
| Reduced motion | Static first frame, no auto-rotation |
| Fallback | If frame count incomplete, show static primary image |
| Mobile | Touch-optimized, no momentum scroll |

### Admin Upload Workflow

1. Admin selects product
2. Admin uploads frame sequence (batch upload)
3. System validates: consistent dimensions, correct frame count (24 or 36)
4. System auto-orders by filename
5. Admin previews rotation in browser
6. Admin saves set → frames stored as media assets with set grouping

---

## 11. `/dev/media` Findings

### What It Does

Route: `/dev/media` (315 lines, client component)

A visual contact sheet displaying all 160 Pixieset images from Collection 001. Features:
- Responsive grid (3-col mobile → 6-col desktop)
- Image number badges (001–160)
- Search by number
- Jump-to-image input
- Copy URL button per tile
- Copy reference button (e.g., `COLLECTION_001_PIXIESET[35]`)
- Fullscreen preview with prev/next navigation
- Keyboard controls (Escape, Arrow Left/Right)

### Data Source

Reads directly from `COLLECTION_001_PIXIESET` array in `src/data/pixieset-collection-001.ts`.

### Key Observations

1. It is **not linked from public navigation** — accessed only by typing the URL
2. It has **no authentication or authorization**
3. It is a **client component** (entire page is `"use client"`)
4. It could inform the Admin Media Library UI but should NOT be exposed as-is

### Reusable Concepts for Admin Media Library

| Concept | Reuse Potential |
|---------|----------------|
| Grid layout with number badges | Admin media grid |
| Search/filter functionality | Admin media search |
| Copy URL functionality | Admin media selection |
| Fullscreen preview with navigation | Admin media preview |
| Keyboard navigation | Admin accessibility |

### What Should Remain Developer-Only

- The raw Pixieset URL display
- The copy-reference (code-level reference)
- Direct pool access without authentication

---

## 12. Future Media Library Design

### Requirements

The Admin Media Library must support:

| Media Type | Use Cases |
|------------|-----------|
| Images | Product photography, collection heroes, homepage editorial, category covers |
| Videos | Product videos, homepage hero video, editorial video |
| 360° Sets | Product 360° frame sequences |

### Recommended Architecture

**Database:** `media_assets` table stores metadata for all uploaded files.
**Storage:** Binary files on Cloudflare R2 (or Stream for video).
**Admin UI:** Authenticated media manager with upload, search, preview, selection.

### Media Asset Schema

```
media_assets
├── id (UUID, PK)
├── storage_key (text, unique) — Cloudflare path
├── public_url (text) — CDN delivery URL
├── media_type (enum: 'image' | 'video' | '360_frame')
├── mime_type (text) — e.g., 'image/jpeg', 'video/mp4'
├── file_size_bytes (integer)
├── width (integer, nullable)
├── height (integer, nullable)
├── alt_text (text, default '')
├── caption (text, nullable)
├── set_id (UUID, nullable) — groups 360° frames
├── frame_order (integer, nullable) — for 360° frames
├── duration_ms (integer, nullable) — for video
├── uploaded_by (UUID, FK → auth.users)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Media Selection Workflow

Admin editors (Product, Collection, Homepage) should include a media picker component that:
1. Opens the Media Library in a modal/panel
2. Allows search/filter by type, date, alt text
3. Allows multi-select for galleries
4. Returns selected asset IDs/URLs to the calling form
5. Supports upload-new from within the picker

---

## 13. Homepage Merchandising Findings

### A. Featured Pieces Section (`home-featured.tsx`)

**Current implementation:**
```typescript
const products = getProductsByCollection("collection-001").slice(0, 4);
```

This is hardcoded to show the first 4 products from Collection 001. Admin cannot control which products appear, their order, or the section copy.

**Future Admin requirement:** Admin must be able to:
- Select which products appear as "featured"
- Control their display order
- Show/hide the section
- Edit the section heading and editorial statement

**Recommended model:**

A `homepage_sections` table or a dedicated `homepage_featured_products` join table:

```
homepage_featured_products
├── id (UUID, PK)
├── product_id (UUID, FK → products)
├── sort_order (integer)
├── is_active (boolean, default true)
├── created_at (timestamptz)
└── UNIQUE(product_id)
```

**Is a generic merchandising-slot model justified?** At this stage, no. HAMMAH has exactly one homepage with specific sections. A generic slot system would be overengineering. If future sections need similar treatment, the model can be extended then.

### B. Collection Feature Section (`home-collection.tsx`)

**Current implementation:**
```typescript
const media = getMediaBySection("collection-001");
```

Shows 4 images from the media manifest for the "collection-001" section. The images are hardcoded Pixieset URLs via the media manifest.

**Future Admin requirement:** Admin must be able to:
- Select which collection is featured on the homepage
- Control the editorial images for this section
- Edit the heading and statement copy

**Recommended model:**

```
homepage_collection_feature
├── id (UUID, PK)
├── collection_id (UUID, FK → collections)
├── heading (text)
├── statement (text)
├── sort_order (integer) — for multiple featured images
├── media_asset_id (UUID, FK → media_assets)
└── is_active (boolean)
```

Alternatively, the collection entity itself could have a `featured_on_homepage` flag, but this couples collection management to homepage merchandising.

### C. Editorial Hero Images (`home-editorial-hero.tsx`)

**Current implementation:**
4 hardcoded Pixieset URLs in a `const IMAGES` array directly in the component file. Auto-rotates every 1.5 seconds.

**Future Admin requirement:** Admin must be able to:
- Select which images rotate in the hero
- Control their order
- Edit alt text

**Recommended model:**

```
homepage_hero_images
├── id (UUID, PK)
├── media_asset_id (UUID, FK → media_assets)
├── alt_text (text)
├── object_position (text, nullable)
├── sort_order (integer)
└── is_active (boolean)
```

### D. Category World Section (`home-world.tsx`)

**Current implementation:**
3 hardcoded category entries with labels, status text, href, mediaId, and dominance flag.

**Future Admin requirement:** Admin should manage category display (which categories appear, their status labels, images). This likely maps to the `categories` table with an additional `homepage_section_config` or simply reads from categories where `show_on_homepage = true`.

---

## 14. Hamatee / Legacy Findings

### Current Implementation

| Route | Purpose | Status |
|-------|---------|--------|
| `/legacy` | Public membership marketing page — "Join the Hammah Legacy" | Complete editorial page |
| `/login` | Sign-in form (frontend demo) | Complete UI, no real auth |
| `/signup` | Two-step registration (frontend demo) | Complete UI, no real auth |
| `/saved` | Saved pieces (frontend demo with state selector) | Complete UI, no persistence |

### Semantic Confusion

`/legacy` serves as both:
1. A public marketing page explaining what the Legacy/Hamatee program is
2. An implicit entry point to account creation

The primary navigation includes "The Hammah Legacy" as a top-level item, which feels odd for what is essentially an account/membership concept.

### Recommended Information Architecture

```
Public Navigation (primary):
├── Shop
├── Collections
├── Our Story
└── (utility) Search, Saved, Account

/legacy
└── Public explanation of Hamatee membership (optional primary nav, better as footer/CTA)

/account or /hamatee (authenticated)
├── Overview
├── Orders
├── Saved Pieces
├── Profile
├── Addresses
├── Member Privileges
└── Sign Out
```

**Route recommendation:** Use `/account` for the authenticated area. It is shorter, clearer, and more conventional than `/hamatee`. The "Hamatee" branding lives in copy and UI, not in the URL.

**Do NOT change routes yet.** Document only.

---

## 15. Auth Findings

### Current State

| Page | Status |
|------|--------|
| `/login` | Frontend demo — `setTimeout` simulates auth, always returns error |
| `/signup` | Frontend demo — `setTimeout` simulates signup, shows success state |
| Google OAuth | UI only — button exists but does nothing real |
| Session | None — no cookies, no tokens, no state persistence |

### Current Signup Fields

Step 1: First Name, Last Name, Email, Phone/WhatsApp
Step 2: Password, Terms checkbox, Privacy checkbox

Google flow adds: Phone/WhatsApp completion step

### Future Supabase Auth Design

**auth.users** (Supabase managed):
- `id` (UUID)
- `email`
- `encrypted_password`
- `email_confirmed_at`
- `created_at`
- `updated_at`

**profiles** table (custom, linked 1:1 to auth.users):
- `id` (UUID, PK, FK → auth.users.id)
- `first_name` (text)
- `last_name` (text)
- `phone` (text, nullable)
- `role` (enum: 'customer' | 'admin', default 'customer')
- `avatar_url` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Role Model

**Recommended:** Store roles in `profiles.role` as a simple enum. For Supabase Free, this is sufficient. No need for a separate roles table or JWT custom claims at this scale.

**RLS enforcement:** Admin operations check `profiles.role = 'admin'` via a helper function. Customer operations check `auth.uid() = profiles.id`.

---

## 16. Saved Pieces Findings

### Current State

`/saved` page has three demo states:
- **Populated:** Shows first 4 products with View/Order/Remove buttons
- **Empty:** "Nothing saved yet" message
- **Signed Out:** "Keep your saved pieces together" with Sign In / Join Legacy CTAs

State is managed via `useState<SavedState>("populated")` — a dev toggle, not real persistence.

The PDP `ProductInfoPanel` has a "Save Piece" heart toggle — `useState(false)`, no persistence.

### Future Model

```
saved_products
├── id (UUID, PK)
├── user_id (UUID, FK → auth.users, NOT NULL)
├── product_id (UUID, FK → products, NOT NULL)
├── created_at (timestamptz)
└── UNIQUE(user_id, product_id) — prevents duplicate saves
```

### Guest Behaviour

- Unauthenticated users see "Save Piece" button
- On click: redirect to `/login` with return URL (e.g., `/login?return=/product/design-01`)
- After login: automatically save the intended product
- Implementation: store intended product in URL param or sessionStorage before redirect

---

## 17. Order-Flow Findings

### Current Implementation

The order flow is **request-based**, not instant checkout:

1. Customer clicks "Order This Piece" on PDP
2. `OrderDrawer` slides in from right
3. Shows order summary: product thumbnail, name, "Collection 001", size, qty, "Price on request"
4. Customer fills: Name, Phone/WhatsApp, Email (optional), Region, City/Town, Area, Landmark, GhanaPost GPS, Delivery Notes
5. Customer clicks "Place Order Request"
6. Success state: "Your order request is in." + "This is currently a frontend demonstration"
7. **No data is persisted anywhere**

### Business Process

This is NOT conventional e-commerce checkout. The flow is:
1. Customer submits order request
2. Hammah contacts customer directly (WhatsApp/phone)
3. They agree on payment, delivery, final pricing
4. Hammah fulfils the order

### Recommended Order Model

```
orders
├── id (UUID, PK)
├── order_number (text, unique) — human-readable, e.g., "HAM-2026-0001"
├── user_id (UUID, FK → auth.users, nullable) — guest orders have NULL
├── status (enum: 'pending' | 'contacted' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled')
├── customer_name (text)
├── customer_phone (text)
├── customer_email (text, nullable)
├── delivery_region (text)
├── delivery_city (text)
├── delivery_area (text, nullable)
├── delivery_landmark (text, nullable)
├── delivery_gps (text, nullable)
├── delivery_notes (text, nullable)
├── admin_notes (text, nullable)
├── subtotal_snapshot (integer) — stored in pence/pesewas for immutability
├── total_snapshot (integer) — stored in pence/pesewas
├── currency (text, default 'GHS')
├── created_at (timestamptz)
├── updated_at (timestamptz)
└── contact_at (timestamptz, nullable) — when Hammah last contacted

order_items
├── id (UUID, PK)
├── order_id (UUID, FK → orders, ON DELETE CASCADE)
├── product_id (UUID, FK → products) — for reference, not dependency
├── product_name_snapshot (text) — IMMUTABLE copy of product name at order time
├── product_slug_snapshot (text) — IMMUTABLE copy
├── size (text, nullable)
├── quantity (integer, default 1)
├── price_snapshot (integer) — IMMUTABLE price at order time (pence/pesewas)
├── media_url_snapshot (text) — IMMUTABLE primary image URL at order time
└── created_at (timestamptz)
```

### Critical: Immutability

Historic orders must NOT depend on current mutable product data. Every `order_item` snapshots:
- Product name (at time of order)
- Product slug
- Price (at time of order)
- Primary image URL (at time of order)

This means a product can be renamed, repriced, or archived without breaking order history.

---

## 18. Archive/Delete Semantics

### Principle

**Soft-delete (archive) for anything referenced by orders or other users' data. Hard-delete only for orphaned data with no references.**

### Entity-Level Rules

| Entity | Unpublish | Archive | Restore | Hard Delete |
|--------|-----------|---------|---------|-------------|
| **Products** | ✅ Hide from public | ✅ Soft-delete, hide from all queries | ✅ Restore to published/draft | ❌ Never if referenced by orders |
| **Collections** | ✅ Hide from public | ✅ Soft-delete, products remain | ✅ Restore | ❌ Never if referenced by homepage or orders |
| **Categories** | ✅ Hide from public | ✅ Soft-delete only if no products | ✅ Restore | ❌ Only if zero products assigned |
| **Media Assets** | N/A | ✅ Soft-delete, remove from pickers | ✅ Restore | ❌ Only if zero references (no product/collection/homepage usage) |

### Implementation

Add to relevant tables:
- `status` enum: `'active' | 'archived'` (or `published`/`draft`/`archived`)
- `archived_at` (timestamptz, nullable)
- `published_at` (timestamptz, nullable)

All public queries filter `WHERE status = 'published'` (or `active`).
Admin queries show all statuses.

---

## 19. Publishing Model

### Recommended States

```
draft → published → archived
```

Simple three-state model. No need for review queues, scheduled publishing, or complex workflow at this stage.

### When Each State Applies

| State | Meaning | Public Visible | Admin Visible |
|-------|---------|---------------|--------------|
| `draft` | Not ready for public | No | Yes |
| `published` | Live on site | Yes | Yes |
| `archived` | Removed from public, preserved for history | No | Yes |

### Publishing Workflow

1. Admin creates product/collection → starts as `draft`
2. Admin fills in all fields, uploads media
3. Admin clicks "Publish" → status changes to `published`, `published_at` set
4. Public site immediately shows the item (after cache revalidation)
5. Admin can "Unpublish" → status changes back to `draft`
6. Admin can "Archive" → status changes to `archived`, `archived_at` set
7. Archived items can be "Restored" to `draft` or `published`

### Collection Publishing

Collection 002 can be prepared as `draft` while Collection 001 remains `published`. When ready, Admin publishes Collection 002 and it appears on `/collections` and `/collections/[slug]`.

---

## 20. Proposed Supabase Schema

### Table: `profiles`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | — | PK, FK → auth.users(id) |
| `first_name` | text | NOT NULL | — | |
| `last_name` | text | NOT NULL | — | |
| `phone` | text | NULLABLE | — | |
| `role` | text | NOT NULL | `'customer'` | CHECK IN ('customer', 'admin') |
| `avatar_url` | text | NULLABLE | — | |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

**RLS:** Users can read/update own profile. Admins can read all profiles.

### Table: `categories`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `slug` | text | NOT NULL | — | UNIQUE |
| `name` | text | NOT NULL | — | |
| `short_description` | text | NULLABLE | — | |
| `description` | text | NULLABLE | — | |
| `cover_image_url` | text | NULLABLE | — | FK concept → media_assets |
| `sort_order` | integer | NOT NULL | `0` | |
| `status` | text | NOT NULL | `'draft'` | CHECK IN ('draft', 'published', 'archived') |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

### Table: `collections`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `slug` | text | NOT NULL | — | UNIQUE |
| `name` | text | NOT NULL | — | |
| `description` | text | NULLABLE | — | |
| `hero_image_url` | text | NULLABLE | — | Primary hero media |
| `hero_image_mobile_url` | text | NULLABLE | — | Mobile-specific hero |
| `editorial_heading` | text | NULLABLE | — | Section heading |
| `editorial_statement` | text | NULLABLE | — | Lead statement |
| `editorial_body` | text | NULLABLE | — | Longer description |
| `sort_order` | integer | NOT NULL | `0` | |
| `status` | text | NOT NULL | `'draft'` | CHECK IN ('draft', 'published', 'archived') |
| `published_at` | timestamptz | NULLABLE | — | |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

### Table: `products`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `slug` | text | NOT NULL | — | UNIQUE |
| `name` | text | NOT NULL | — | |
| `description` | text | NULLABLE | — | |
| `category_id` | uuid | NOT NULL | — | FK → categories(id) |
| `pricing_mode` | text | NOT NULL | `'PRICE_ON_REQUEST'` | CHECK IN ('PRICE_ON_REQUEST', 'FIXED') |
| `price_amount` | integer | NULLABLE | — | In pence/pesewas, nullable for PRICE_ON_REQUEST |
| `currency` | text | NOT NULL | `'GHS'` | |
| `availability` | text | NOT NULL | `'COMING_SOON'` | CHECK IN ('AVAILABLE', 'COMING_SOON', 'SOLD_OUT') |
| `sort_order` | integer | NOT NULL | `0` | Within category |
| `status` | text | NOT NULL | `'draft'` | CHECK IN ('draft', 'published', 'archived') |
| `published_at` | timestamptz | NULLABLE | — | |
| `video_url` | text | NULLABLE | — | FK concept → media_assets |
| `has_360` | boolean | NOT NULL | `false` | Whether 360 set exists |
| `set_360_id` | text | NULLABLE | — | Grouping key for 360 frames in media_assets |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

### Table: `product_variants`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `size_label` | text | NOT NULL | — | e.g., "30", "32", "S", "M" |
| `size_value` | text | NOT NULL | — | Normalized value |
| `available` | boolean | NOT NULL | `true` | |
| `sort_order` | integer | NOT NULL | `0` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(product_id, size_value) | | | | |

### Table: `collection_products` (junction)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `collection_id` | uuid | NOT NULL | — | FK → collections(id), ON DELETE CASCADE |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `sort_order` | integer | NOT NULL | `0` | Product display order within collection |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(collection_id, product_id) | | | | |

### Table: `media_assets`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `storage_key` | text | NOT NULL | — | UNIQUE — Cloudflare R2 path |
| `public_url` | text | NOT NULL | — | CDN delivery URL |
| `media_type` | text | NOT NULL | — | CHECK IN ('image', 'video', '360_frame') |
| `mime_type` | text | NOT NULL | — | e.g., 'image/jpeg' |
| `file_size_bytes` | integer | NULLABLE | — | |
| `width` | integer | NULLABLE | — | |
| `height` | integer | NULLABLE | — | |
| `alt_text` | text | NOT NULL | `''` | |
| `caption` | text | NULLABLE | — | |
| `set_id` | text | NULLABLE | — | Groups 360° frames |
| `frame_order` | integer | NULLABLE | — | For 360° frame ordering |
| `duration_ms` | integer | NULLABLE | — | For video |
| `uploaded_by` | uuid | NULLABLE | — | FK → auth.users(id) |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

### Table: `product_media` (junction)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `media_asset_id` | uuid | NOT NULL | — | FK → media_assets(id), ON DELETE CASCADE |
| `role` | text | NOT NULL | — | CHECK IN ('primary', 'hover', 'gallery', 'detail') |
| `sort_order` | integer | NOT NULL | `0` | Display order within role |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(product_id, media_asset_id) | | | | One assignment per product per asset |

### Table: `homepage_featured_products`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `sort_order` | integer | NOT NULL | `0` | |
| `is_active` | boolean | NOT NULL | `true` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(product_id) | | | | |

### Table: `homepage_hero_images`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `media_asset_id` | uuid | NOT NULL | — | FK → media_assets(id), ON DELETE CASCADE |
| `alt_text` | text | NOT NULL | `''` | |
| `object_position` | text | NULLABLE | — | CSS object-position value |
| `sort_order` | integer | NOT NULL | `0` | |
| `is_active` | boolean | NOT NULL | `true` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |

### Table: `homepage_collection_feature`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `collection_id` | uuid | NOT NULL | — | FK → collections(id) |
| `heading` | text | NOT NULL | `'The first release.'` | |
| `statement` | text | NOT NULL | — | |
| `is_active` | boolean | NOT NULL | `true` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |

### Table: `saved_products`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | uuid | NOT NULL | — | FK → auth.users(id), ON DELETE CASCADE |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(user_id, product_id) | | | | |

### Table: `addresses`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | uuid | NOT NULL | — | FK → auth.users(id), ON DELETE CASCADE |
| `label` | text | NOT NULL | `'Home'` | e.g., Home, Work |
| `region` | text | NOT NULL | — | |
| `city` | text | NOT NULL | — | |
| `area` | text | NULLABLE | — | |
| `landmark` | text | NULLABLE | — | |
| `gps_address` | text | NULLABLE | — | GhanaPost GPS |
| `phone` | text | NOT NULL | — | |
| `is_default` | boolean | NOT NULL | `false` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

### Table: `orders`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `order_number` | text | NOT NULL | — | UNIQUE, human-readable |
| `user_id` | uuid | NULLABLE | — | FK → auth.users(id), NULL for guests |
| `status` | text | NOT NULL | `'pending'` | CHECK IN ('pending', 'contacted', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled') |
| `customer_name` | text | NOT NULL | — | |
| `customer_phone` | text | NOT NULL | — | |
| `customer_email` | text | NULLABLE | — | |
| `delivery_region` | text | NOT NULL | — | |
| `delivery_city` | text | NOT NULL | — | |
| `delivery_area` | text | NULLABLE | — | |
| `delivery_landmark` | text | NULLABLE | — | |
| `delivery_gps` | text | NULLABLE | — | |
| `delivery_notes` | text | NULLABLE | — | |
| `admin_notes` | text | NULLABLE | — | |
| `subtotal_snapshot` | integer | NULLABLE | — | In pence/pesewas |
| `total_snapshot` | integer | NULLABLE | — | In pence/pesewas |
| `currency` | text | NOT NULL | `'GHS'` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |
| `contacted_at` | timestamptz | NULLABLE | — | |

### Table: `order_items`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `order_id` | uuid | NOT NULL | — | FK → orders(id), ON DELETE CASCADE |
| `product_id` | uuid | NULLABLE | — | FK → products(id), for reference only |
| `product_name_snapshot` | text | NOT NULL | — | Immutable at order time |
| `product_slug_snapshot` | text | NOT NULL | — | Immutable at order time |
| `size` | text | NULLABLE | — | |
| `quantity` | integer | NOT NULL | `1` | CHECK > 0 |
| `price_snapshot` | integer | NULLABLE | — | Immutable at order time |
| `media_url_snapshot` | text | NULLABLE | — | Immutable at order time |
| `created_at` | timestamptz | NOT NULL | `now()` | |

---

## 21. Constraints/Indexes/Relationships

### Indexes

```sql
-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sort ON products(category_id, sort_order);

-- Collections
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_status ON collections(status);

-- Collection Products
CREATE INDEX idx_cp_collection ON collection_products(collection_id);
CREATE INDEX idx_cp_product ON collection_products(product_id);

-- Product Media
CREATE INDEX idx_pm_product ON product_media(product_id);
CREATE INDEX idx_pm_asset ON product_media(media_asset_id);
CREATE INDEX idx_pm_role ON product_media(product_id, role);

-- Media Assets
CREATE INDEX idx_ma_type ON media_assets(media_type);
CREATE INDEX idx_ma_set ON media_assets(set_id) WHERE set_id IS NOT NULL;
CREATE INDEX idx_ma_uploaded ON media_assets(uploaded_by);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_oi_order ON order_items(order_id);

-- Saved Products
CREATE INDEX idx_sp_user ON saved_products(user_id);
CREATE INDEX idx_sp_product ON saved_products(product_id);

-- Addresses
CREATE INDEX idx_addr_user ON addresses(user_id);

-- Homepage
CREATE INDEX idx_hfp_active ON homepage_featured_products(is_active, sort_order);
CREATE INDEX idx_hhi_active ON homepage_hero_images(is_active, sort_order);
```

### Foreign Key Relationships

```
auth.users ← profiles.id
profiles ← orders.user_id (nullable)
profiles ← saved_products.user_id
profiles ← addresses.user_id
profiles ← media_assets.uploaded_by (nullable)

categories ← products.category_id
products ← product_variants.product_id (CASCADE)
products ← product_media.product_id (CASCADE)
products ← collection_products.product_id (CASCADE)
products ← saved_products.product_id (CASCADE)
products ← order_items.product_id (no cascade — preserve references)

collections ← collection_products.collection_id (CASCADE)
collections ← homepage_collection_feature.collection_id

media_assets ← product_media.media_asset_id (CASCADE)
media_assets ← homepage_hero_images.media_asset_id (CASCADE)

orders ← order_items.order_id (CASCADE)
```

---

## 22. RLS/Access-Control Matrix

### Helper Functions

```sql
-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if current user owns a profile
CREATE OR REPLACE FUNCTION is_owner(profile_uuid uuid)
RETURNS boolean AS $$
  SELECT auth.uid() = profile_uuid;
$$ LANGUAGE sql SECURITY DEFINER;
```

### Policy Matrix

| Table | Public (anon) | Authenticated Customer | Admin |
|-------|--------------|----------------------|-------|
| **profiles** | No access | Read/update own | Read all, update roles |
| **categories** | Read where `status = 'published'` | Same as public | Full CRUD |
| **collections** | Read where `status = 'published'` | Same as public | Full CRUD |
| **products** | Read where `status = 'published'` | Same as public | Full CRUD |
| **product_variants** | Read for published products | Same as public | Full CRUD |
| **collection_products** | Read for published collections | Same as public | Full CRUD |
| **media_assets** | Read public URLs | Read public URLs | Full CRUD |
| **product_media** | Read for published products | Same as public | Full CRUD |
| **homepage_featured_products** | Read where `is_active` | Same as public | Full CRUD |
| **homepage_hero_images** | Read where `is_active` | Same as public | Full CRUD |
| **homepage_collection_feature** | Read where `is_active` | Same as public | Full CRUD |
| **saved_products** | No access | Read/write own only | Read all |
| **addresses** | No access | Read/write own only | Read all |
| **orders** | No access | Read own only | Full CRUD |
| **order_items** | No access | Read via own orders | Full CRUD |

### Critical Rules

1. **Never use service-role key in browser/client code**
2. All admin operations go through server-side API routes or server components
3. Client input is untrusted — validate on server
4. Published product reads are public — no auth needed for Shop/PDP
5. Customer data (orders, saved, addresses) is user-scoped via RLS
6. Admin role check happens in RLS policies, not just in application code

---

## 23. Cloudflare Media Contract

### Architecture

```
Admin uploads → Cloudflare R2 (storage) → Cloudflare CDN (delivery) → Public URL stored in media_assets.public_url
```

### Storage Key Convention

```
hammah-media/
├── products/
│   └── {product-id}/
│       ├── primary.jpg
│       ├── hover.jpg
│       ├── gallery/
│       │   ├── 001.jpg
│       │   ├── 002.jpg
│       │   └── ...
│       ├── details/
│       │   ├── 001.jpg
│       │   └── 002.jpg
│       ├── video.mp4
│       └── 360/
│           └── {set-id}/
│               ├── frame-001.jpg
│               ├── frame-002.jpg
│               └── ... (24 or 36 frames)
├── collections/
│   └── {collection-id}/
│       ├── hero-desktop.jpg
│       ├── hero-mobile.jpg
│       └── editorial/
│           └── ...
├── homepage/
│   ├── hero/
│   │   ├── 001.jpg
│   │   └── ...
│   ├── featured/
│   │   └── ...
│   └── editorial/
│       └── ...
├── categories/
│   └── {category-id}/
│       └── cover.jpg
└── global/
    ├── logo/
    └── ...
```

### Delivery

- Cloudflare CDN provides automatic image optimisation (format, quality, resizing)
- Public URLs follow pattern: `https://media.slbyhammah.com/{storage_key}`
- No Supabase Storage for heavy media — Cloudflare handles all binary delivery

---

## 24. Current → Future Migration Matrix

| Current Source | Current Consumer | Future Source | Admin Owner | Migration Notes |
|---------------|-----------------|--------------|-------------|----------------|
| `src/data/products.ts` (8 products) | Shop, PDP, Home Featured, Collection 001, Saved | `products` table + `product_variants` table | Products | Preserve slugs; map DESIGN 01–08 names to curated names; seed curated photo grouping into `product_media` |
| `src/data/products.ts` → `media` object | PDP gallery, Product cards | `product_media` junction | Products/Media | Preserve curated grouping (56 images); each product's primary/hover/gallery/detail becomes explicit role assignments |
| `src/data/pixieset-collection-001.ts` (160 images) | Media manifest, products, components | `media_assets` table | Media | All 160 URLs become media_asset records; curated product groupings preserved via `product_media` |
| `src/data/collections.ts` (3 collections) | Collections pages, navigation | `collections` table + `collection_products` junction | Collections | Collection 001 becomes first seed; Kaftans/Footwear become published collections |
| `src/data/categories.ts` (3 categories) | Shop filters, mobile menu, home-world | `categories` table | Products | Route field removed; categories decoupled from collection URLs |
| `src/data/media-manifest.ts` (~55 slots) | All page components | Split: product media → `product_media`; editorial → `media_assets` referenced by pages; homepage → `homepage_*` tables | Media/Homepage | Media manifest concept dissolves into specific data relationships |
| `src/data/navigation.ts` | Header, footer, mobile menu | Admin-managed navigation OR keep as code | Code (navigation stays in code) | Navigation structure is design, not business content |
| `src/data/site-content.ts` | Largely unused | Remove or repurpose | — | Pages currently hardcode their own copy |
| `src/components/home/home-editorial-hero.tsx` (4 images) | Homepage hero rotation | `homepage_hero_images` table | Homepage Admin | 4 Pixieset URLs become media_asset references |
| `src/components/home/home-featured.tsx` (4 products) | Homepage featured section | `homepage_featured_products` table | Homepage Admin | Currently hardcoded first 4 from collection-001 |
| `src/components/home/home-world.tsx` (3 categories) | Homepage categories | `categories` table (show_on_homepage flag) | Homepage Admin | Category data already exists, just needs admin management |
| `src/components/home/home-faq.tsx` (8 items) | Homepage FAQ | Keep as code OR admin-managed content | Code or Admin | FAQ copy is editorial — could remain in code or become admin-managed |
| `src/components/home/home-legacy.tsx` (4 benefits) | Homepage legacy section | Keep as code | Code | Benefits list is editorial/design |
| `src/app/(public)/our-story/page.tsx` (761 lines) | Our Story page | Keep as code | Code | Editorial content is design-owned |
| `src/app/(public)/delivery/page.tsx` (4 steps) | Delivery page | Keep as code | Code | Operational flow, not merchandising |
| `src/app/(public)/size-guide/page.tsx` (measurements) | Size guide | `product_variants` or size config | Products | Size data should come from variant system |
| `src/types/products.ts` — `PRODUCT_SIZES` | PDP size selector | `product_variants` table | Products | Sizes become per-product variants |
| `src/components/product/order-drawer.tsx` | PDP order flow | Server-side order creation API | Orders | Form submits to API route, not frontend demo |
| `/dev/media` | Developer tool | Keep as dev tool | Code | Add env-gating for production |
| Public video assets (`/herovideo.mp4`, `/mobhero.mp4`) | Homepage hero | Cloudflare CDN | Media | Move to Cloudflare storage |

---

## 25. Admin Information Architecture

### Proposed Navigation

```
Dashboard
│
├── Catalogue
│   ├── Products          (list/create/edit/archive)
│   ├── Categories        (list/create/edit/reorder)
│   └── Variants          (managed within product editor)
│
├── Collections           (list/create/edit/publish/archive)
│
├── Media
│   ├── Images            (upload/manage/select)
│   ├── Videos            (upload/manage/select)
│   └── 360 Sets          (upload/manage/attach)
│
├── Homepage
│   ├── Featured Pieces   (select/reorder products)
│   ├── Hero Images       (select/reorder images)
│   └── Collection Feature (select collection + copy)
│
├── Orders                (list/view/update status/notes)
│
├── Customers             (list/view profiles)
│
└── Settings
    ├── Profile           (admin own profile)
    └── Store             (general config — future)
```

### Per-Area Specification

#### Products

| Aspect | Detail |
|--------|--------|
| **List view** | Table: name, category, collection(s), status, price, availability, updated_at. Filters: status, category. Sort: name, date, sort_order |
| **Create/edit view** | Full product editor (see §26) |
| **Important actions** | Publish, unpublish, archive, restore, set primary image, reorder gallery |
| **Dangerous actions** | Archive (prevents public visibility), delete (only if no orders) |
| **Validation** | Name required, slug auto-generated from name (editable), category required, at least one media asset |
| **Empty state** | "No products yet. Create your first product." |
| **Permissions** | Admin only |

#### Categories

| Aspect | Detail |
|--------|--------|
| **List view** | Table: name, slug, product count, status, sort_order. Drag-to-reorder |
| **Create/edit view** | Name, slug, description, cover image, status |
| **Important actions** | Create, edit, reorder, publish/unpublish |
| **Dangerous actions** | Archive (only if no products assigned) |
| **Empty state** | "No categories yet." |
| **Permissions** | Admin only |

#### Collections

| Aspect | Detail |
|--------|--------|
| **List view** | Table: name, slug, product count, status, sort_order |
| **Create/edit view** | Full collection editor (see §27) |
| **Important actions** | Create, publish, unpublish, archive, add/remove products, reorder products |
| **Dangerous actions** | Archive (preserves products, removes collection from public) |
| **Empty state** | "No collections yet. Create your first collection." |
| **Permissions** | Admin only |

#### Media Library

| Aspect | Detail |
|--------|--------|
| **List view** | Grid: thumbnails with type badge, alt text, upload date. Filters: type (image/video/360), upload date. Search: alt text, file name |
| **Upload** | Drag-and-drop zone, file picker, batch upload for 360 sets |
| **Detail/edit view** | Preview, alt text, caption, dimensions, file size, associated products/collections |
| **Important actions** | Upload, edit metadata, delete (if unused), select for product/collection/homepage |
| **Dangerous actions** | Delete (only if zero references) |
| **Empty state** | "No media uploaded yet. Drop files here or click to upload." |
| **Permissions** | Admin only |

#### Homepage / Merchandising

| Aspect | Detail |
|--------|--------|
| **Featured Pieces** | Drag-to-reorder product list, add/remove products, toggle active |
| **Hero Images** | Drag-to-reorder image list, add/remove images, edit alt text |
| **Collection Feature** | Select collection, edit heading/statement |
| **Permissions** | Admin only |

#### Orders

| Aspect | Detail |
|--------|--------|
| **List view** | Table: order number, customer, status, date, total. Filters: status. Sort: date |
| **Detail view** | Full order with items, customer info, delivery info, status timeline, admin notes |
| **Important actions** | Update status, add admin notes, contact customer |
| **Dangerous actions** | Cancel order |
| **Empty state** | "No orders yet." |
| **Permissions** | Admin only |

#### Customers

| Aspect | Detail |
|--------|--------|
| **List view** | Table: name, email, phone, role, join date, order count |
| **Detail view** | Profile, addresses, order history, saved pieces |
| **Permissions** | Admin only |

---

## 26. Product Editor Specification

### Identity Section

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | text | Yes | Product display name |
| Slug | text | Yes | Auto-generated from name, editable |
| Description | textarea | No | Product description |

### Merchandising Section

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Category | select | Yes | From categories table |
| Collection membership | multi-select | No | From collections table (via junction) |
| Sort order | number | No | Display order within category |

### Commerce Section

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Pricing mode | radio | Yes | PRICE_ON_REQUEST or FIXED |
| Price | number | Conditional | Required if mode = FIXED |
| Currency | select | Yes | Default GHS |
| Availability | radio | Yes | AVAILABLE, COMING_SOON, SOLD_OUT |
| Variants/Sizes | dynamic list | No | Add size label + value + available toggle |

### Media Section

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Primary image | media picker | Yes | Single image selection |
| Hover image | media picker | No | Alternate view for desktop hover |
| Gallery | media picker (multi) | No | Ordered list of images |
| Video | media picker | No | Single video |
| 360° set | upload/select | No | Frame sequence or set reference |

### Lifecycle Section

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Status | radio | Yes | Draft / Published / Archived |
| Published at | auto | — | Set automatically on first publish |

### Validation Rules

- Name: required, 1–200 characters
- Slug: required, unique, pattern `^[a-z0-9]+(-[a-z0-9]+)*$`
- Category: required, must exist
- Price: required if pricing_mode = FIXED, must be > 0
- At least one media asset for published products
- Size labels: unique within product

---

## 27. Collection Editor Specification

### Creating Collection 002 Without Developer

Admin fills:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | text | Yes | e.g., "Summer Essentials" |
| Slug | text | Yes | Auto-generated from name |
| Description | textarea | No | Short description |
| Hero image | media picker | No | Desktop hero |
| Hero image (mobile) | media picker | No | Mobile-specific hero |
| Editorial heading | text | No | e.g., "Summer 2026" |
| Editorial statement | text | No | Lead editorial text |
| Editorial body | textarea | No | Longer description |
| Products | multi-select | No | From products table (via junction) |
| Product order | drag-to-reorder | No | Display order within collection |
| Status | radio | Yes | Draft / Published / Archived |

### How a New Collection Becomes Visible

1. Admin creates collection → status = `draft`
2. Admin adds products, hero media, editorial copy
3. Admin clicks "Publish" → status = `published`, `published_at` set
4. Next page load: `/collections` shows the new collection card
5. `/collections/[new-slug]` renders the collection page
6. No code changes required — the dynamic route handles any published collection

---

## 28. Media Management Specification

### Image Upload

1. Admin navigates to Media Library
2. Clicks "Upload" or drags files into drop zone
3. Files upload to Cloudflare R2 via signed URL
4. On completion: `media_assets` record created with metadata
5. Admin can edit alt text, caption

### Video Upload

1. Admin selects "Videos" tab
2. Uploads MP4 file (max 100MB, max 60s)
3. File stored on Cloudflare R2 (or Stream for transcoding)
4. `media_assets` record created with `media_type = 'video'`
5. Admin can set poster image (select existing or upload new)

### 360° Set Upload

1. Admin selects "360 Sets" tab
2. Clicks "New Set"
3. Uploads frame sequence (24 or 36 JPEGs)
4. System validates:
   - Correct frame count (24 or 36)
   - Consistent dimensions across all frames
   - Correct file types
5. System auto-orders by filename
6. All frames stored under `products/{id}/360/{set_id}/`
7. `media_assets` records created for each frame with shared `set_id`
8. Admin previews rotation in browser
9. Admin saves → set attached to product via `product.has_360` + `product.set_360_id`

### Media Selection

Product/Collection/Homepage editors include a media picker component:
- Opens Media Library in modal
- Filter by type, date, search
- Multi-select for galleries
- Single-select for primary/hero
- Returns asset IDs to calling form

### Media Reuse

The same `media_assets` record can be referenced by multiple products. E.g., a campaign image used as both a collection hero and a homepage featured image.

### Media Removal

Removing an asset from a product deletes the `product_media` junction record, not the `media_assets` record. The asset remains available for reuse elsewhere.

### Alt Text

Required on all `media_assets`. Default empty string. Admin prompted to fill on upload. Used in `<img>` alt attributes across the site.

---

## 29. Route/URL Recommendations

### Current Public Routes

| Route | Purpose | Future |
|-------|---------|--------|
| `/` | Homepage | Stays |
| `/shop` | All products with category filters | Stays |
| `/collections` | Collection index | Stays |
| `/collections/collection-001` | Collection 001 detail | Becomes `/collections/[slug]` |
| `/collections/kaftans` | Kaftans category/collection | Becomes `/collections/[slug]` (if published as collection) OR redirect to `/shop/kaftans` |
| `/collections/footwear` | Footwear category/collection | Same as kaftans |
| `/product/[slug]` | Product detail | Stays |
| `/our-story` | Editorial | Stays |
| `/legacy` | Membership marketing | Stays (consider moving to footer-only) |
| `/saved` | Saved pieces (authenticated) | Stays |
| `/login` | Sign in | Stays |
| `/signup` | Create account | Stays |
| `/track` | Order tracking | Stays |
| `/delivery` | Delivery info | Stays |
| `/returns` | Returns policy | Stays |
| `/size-guide` | Size guide | Stays |
| `/privacy` | Privacy policy | Stays |
| `/terms` | Terms | Stays |
| `/dev/media` | Dev tool | Stays (env-gated) |

### Recommended Future Routes

| Route | Purpose |
|-------|---------|
| `/shop` | All products, category filter tabs |
| `/shop/trousers` | Category-filtered product list |
| `/shop/kaftans` | Category-filtered product list |
| `/shop/footwear` | Category-filtered product list |
| `/collections` | Published collections index |
| `/collections/[slug]` | Any published collection (dynamic) |
| `/product/[slug]` | Product detail (unchanged) |
| `/account` | Authenticated customer area |
| `/account/orders` | Order history |
| `/account/saved` | Saved pieces |
| `/account/profile` | Profile management |
| `/account/addresses` | Address book |

### Redirect Requirements (Future)

When routes change:
- `/collections/kaftans` → `/shop/kaftans` (301)
- `/collections/footwear` → `/shop/footwear` (301)
- `/collections/collection-001` → `/collections/collection-001` (stays — dynamic route handles it)
- Legacy `/legacy` → keep, but de-prioritize in navigation

---

## 30. SEO Requirements

### Metadata Contract

Every public page must provide:
- `title` — via `generateMetadata()` or static export
- `description` — meta description
- `og:title` — Open Graph title
- `og:description` — Open Graph description
- `og:image` — Open Graph image (product/collection specific)
- `canonical` — canonical URL

### Product SEO

```
<title>{product.name} | SL by Hammah</title>
<meta name="description" content="{product.description}" />
<meta property="og:title" content="{product.name}" />
<meta property="og:description" content="{product.description}" />
<meta property="og:image" content="{product.primary_image_url}" />
<link rel="canonical" href="https://slbyhammah.com/product/{slug}" />
```

### Collection SEO

```
<title>{collection.name} | SL by Hammah</title>
<meta name="description" content="{collection.description}" />
<meta property="og:image" content="{collection.hero_image_url}" />
<link rel="canonical" href="https://slbyhammah.com/collections/{slug}" />
```

### Sitemap

Dynamic sitemap generation from published products and collections:
- `/sitemap.xml` → generates from `products WHERE status = 'published'` + `collections WHERE status = 'published'`
- Exclude `draft` and `archived` content
- Include `lastmod` from `updated_at`

### Slug Changes

If a product slug changes, implement a redirect from old slug to new slug. Consider a `product_slugs` audit table or 301 redirect map.

### Unpublished Content

`draft` and `archived` products/collections must:
- Not appear in sitemap
- Return 404 on direct URL access
- Not be indexable by crawlers

---

## 31. Caching/Performance Strategy

### Data Fetching Approach

| Page | Strategy | Rationale |
|------|----------|-----------|
| `/` (Homepage) | Server component, `revalidate: 60` | Merchandising changes infrequently; 60s stale-while-revalidate |
| `/shop` | Server component, `revalidate: 60` | Product list changes on Admin publish |
| `/product/[slug]` | Server component, `revalidate: 60` | Individual product pages |
| `/collections` | Server component, `revalidate: 60` | Collection list |
| `/collections/[slug]` | Server component, `revalidate: 60` | Individual collection pages |
| `/our-story` | Server component, `revalidate: 3600` | Static editorial, rarely changes |
| Legal pages | Server component, `revalidate: 3600` | Static content |

### Cache Invalidation

When Admin publishes/unpublishes content:
- Option A: Wait for revalidation window (60s default) — acceptable for most cases
- Option B: On-demand revalidation via `revalidateTag()` / `revalidatePath()` — use for urgent updates

### Server Components

All public page data fetching should use server components. No client-side database queries. The pattern:

```typescript
// Server component (page.tsx)
import { createClient } from '@/lib/supabase/server';

export default async function ShopPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('status', 'published')
    .order('sort_order');
  
  return <ProductGrid products={products} />;
}
```

### Media Delivery

- All images served via Cloudflare CDN with automatic format/quality optimisation
- Use `next/image` with Cloudflare CDN as remote pattern
- Hero video: keep in `/public` for now, migrate to Cloudflare later
- Lazy loading: native `loading="lazy"` on below-fold images
- Preload: hero image/video, above-fold product images

---

## 32. Supabase Free Considerations

### Limits

| Resource | Free Tier Limit | Pressure Point |
|----------|----------------|---------------|
| Database | 500 MB | Low — product/media/order data is small |
| Storage | 1 GB | **Avoid using for media** — use Cloudflare R2 |
| Bandwidth | 2 GB/month | Low for API calls; avoid for media delivery |
| Auth | 50,000 monthly active users | Ample for launch |
| Edge Functions | 500K invocations/month | Ample |
| Realtime | 200 concurrent connections | Not needed for MVP |
| API requests | Unlimited | N/A |

### Pressure Points

1. **Storage:** Do NOT use Supabase Storage for product images/video. Use Cloudflare R2. The 1GB limit is quickly exhausted by product photography.
2. **Bandwidth:** 2GB/month is tight if serving media through Supabase. Cloudflare CDN eliminates this concern.
3. **Project inactivity:** Supabase Free projects pause after 7 days of inactivity. Set up a cron job (e.g., weekly health check) to keep the project alive.
4. **Backups:** Free tier has no automated backups. Manual backups via `pg_dump` should be scheduled.
5. **Connection limits:** Free tier allows 60 concurrent connections. Use connection pooling (Supabase provides PgBouncer).

### Architecture Adjustments for Free Tier

- All heavy media (images, video) → Cloudflare R2
- Supabase handles only: database, auth, RLS, API
- Server components for public reads (minimize API calls)
- Aggressive caching (60s revalidation)
- No realtime subscriptions needed
- No edge functions needed initially

---

## 33. Migration Strategy

### Principle: Incremental, Verified, Zero-Downtime

We should NOT simultaneously rewrite the frontend, replace data, build Admin, change routes, and change media hosting.

### Phase Sequence

#### Phase 1: Schema + Seed (Sprint 0.15)

1. Create Supabase project
2. Run migrations for all tables
3. Configure RLS policies
4. Seed existing data:
   - 3 categories
   - 3 collections
   - 8 products with variants
   - 160 media assets (Pixieset URLs)
   - Product-media junction records (preserving curated grouping)
   - Homepage merchandising data
5. Verify: `SELECT` queries return same data as TypeScript fixtures

#### Phase 2: Dynamic Reads (Sprint 0.16)

1. Create Supabase client helpers (`src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`)
2. Replace fixture imports in pages with Supabase queries
3. Keep TypeScript fixtures as fallback (import in a `getProductBySlugFallback()` function)
4. Compare: page output with Supabase data matches page output with fixture data
5. Remove fallback once parity verified
6. No Admin mutations yet — reads only

#### Phase 3: Auth + Account (Sprint 0.17)

1. Configure Supabase Auth (email/password, Google OAuth)
2. Create `profiles` on signup trigger
3. Implement real login/signup pages
4. Add session handling middleware
5. Build `/account` area
6. Connect saved pieces to database
7. Add addresses

#### Phase 4: Orders (Sprint 0.18)

1. Create order API route
2. Server-side product/price validation
3. Order + order item persistence
4. Customer order history
5. Admin order management

#### Phase 5: Admin (Sprint 0.19)

1. Admin authentication + role check
2. Product CRUD
3. Category CRUD
4. Collection CRUD
5. Media Library
6. Homepage merchandising
7. Order management

#### Phase 6: Cutover (Sprint 0.20)

1. Remove fixture dependencies
2. Verify all dynamic reads
3. Media delivery via Cloudflare
4. Cache/revalidation tuning
5. RLS testing
6. Performance audit
7. SEO verification

---

## 34. Risks / Open Questions

### Resolved by Repository Inspection

| Question | Answer |
|----------|--------|
| How are products represented? | 8 TypeScript objects in `src/data/products.ts` with Pixieset media URLs |
| How are product images grouped? | Curated `media` object per product: primary, hover, gallery[], details[], thumbnail |
| How does the order flow work? | Request-based — customer submits form, Hammah contacts them. NOT instant checkout |
| Is authentication real? | No — all mocked with `setTimeout` |
| Does saved pieces work? | No — frontend-only `useState` toggle |
| Are video/360 functional? | No — placeholder tabs |
| What does `/dev/media` do? | 160-image contact sheet with search/copy/preview |
| How are categories used? | Shop filter buttons + mobile menu + homepage category cards |
| Are categories the same as collections? | Semantically no, but URL-wise they overlap (kaftans/footwear are both) |

### Genuinely Unresolved Business Decisions

| Question | Why It Matters | Blocks Sprint | Recommended Default | Consequence of Alternative |
|----------|---------------|--------------|--------------------|-----------------------------|
| Should product prices eventually be visible on the site? | Determines whether FIXED pricing mode needs public display | 0.18 (Orders) | Keep PRICE_ON_REQUEST for now; add FIXED display when prices are approved | Showing prices requires price display component + currency formatting |
| Should the Hamatee Legacy be primary navigation or footer-only? | Affects information architecture and navigation component changes | 0.17 (Auth) | Keep in primary nav for now; move to footer-only after account area exists | Moving too early removes a signup entry point |
| Should FAQ content be admin-managed or code-owned? | Determines whether FAQ needs an Admin editor | 0.19 (Admin) | Keep as code — FAQ content is editorial, not merchandising | Admin-managed FAQ adds a content editor with minimal value |
| What is the order number format? | Affects order creation logic | 0.18 (Orders) | `HAM-YYYY-NNNN` (e.g., HAM-2026-0001), auto-incrementing | Custom format requires sequence management |
| Should `/collections/kaftans` and `/collections/footwear` redirect to `/shop/kaftans` and `/shop/footwear`? | Affects routing and redirects | 0.16 (Catalogue) | Keep current routes until categories have real products; redirect when catalogue matures | Early redirect may confuse existing bookmarks |

---

## 35. Recommended Sprint 0.15–0.20 Implementation Sequence

### Sprint 0.15 — Supabase + Cloudflare Foundation

**Scope:**
- Supabase project creation and configuration
- Environment strategy (`.env.local`, `.env.example`)
- All table migrations (§20 schema)
- Indexes and constraints (§21)
- RLS policies (§22)
- Role model (profiles.role enum)
- Server/client Supabase helpers (`src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`)
- Session middleware for auth
- Cloudflare R2 bucket configuration
- Signed upload URL generation (server action or API route)
- No public-page migration yet

**Deliverable:** Empty but fully functional Supabase database with RLS, ready for data seeding.

### Sprint 0.16 — Catalogue Migration

**Scope:**
- Seed existing categories (3)
- Seed Collection 001 + Kaftans + Footwear collections
- Seed 160 media assets from Pixieset pool
- Seed 8 products with curated product-media groupings
- Seed product variants (sizes 30/32/34/36)
- Seed collection_products junction
- Seed homepage merchandising data
- Dynamic Shop page (server component, Supabase query)
- Dynamic PDP (server component, Supabase query)
- Dynamic Collections pages
- Dynamic collection detail pages (`/collections/[slug]`)
- Category-filtered shop views
- Retain TypeScript fallbacks until parity verified
- Video data model ready (no video upload yet)
- 360° data model ready (no 360 upload yet)

**Deliverable:** All public catalogue pages reading from Supabase with identical output to current fixture-driven pages.

### Sprint 0.17 — Hamatee Auth & Account

**Scope:**
- Real email/password signup via Supabase Auth
- Real login/logout
- Session handling (middleware, cookies)
- Profile creation on signup (database trigger)
- Google OAuth (if desired)
- Authenticated account area (`/account`)
- Account sections: Overview, Orders, Saved Pieces, Profile, Addresses
- Saved pieces: real database persistence
- Addresses: CRUD for delivery addresses
- Legacy/account IA clarification
- Account icon behaviour in header (logged in → /account, logged out → /login)

**Deliverable:** Real authentication with persistent user accounts, saved pieces, and addresses.

### Sprint 0.18 — Orders & Customer Commerce

**Scope:**
- Real "Order This Piece" flow
- Server-side product/price validation on order submission
- Order + order item persistence with immutable snapshots
- Customer order history
- Order status tracking (customer-facing)
- Delivery/contact information collection
- Order number generation
- Guest order support (no account required)
- Email confirmation (optional, via Supabase Edge Function or Resend)
- Failure/retry handling

**Deliverable:** Real order submission and persistence with immutable historical records.

### Sprint 0.19 — Admin Operations

**Scope:**
- Protected Admin area (role check middleware)
- Admin dashboard
- Product CRUD (create, edit, publish, unpublish, archive)
- Category CRUD (create, edit, reorder)
- Collection CRUD (create, edit, publish, add/remove/reorder products)
- Media Library (upload, manage, select)
- Image upload to Cloudflare R2
- Video upload to Cloudflare R2
- 360° set upload and management
- Homepage merchandising editors (featured products, hero images, collection feature)
- Order management (status updates, admin notes)
- Customer list view

**Deliverable:** Full Admin dashboard for managing all business content.

### Sprint 0.20 — Managed Content Cutover & Production Hardening

**Scope:**
- Remove all TypeScript fixture dependencies
- Verify all dynamic public reads match expected output
- Cache/revalidation tuning
- Media delivery via Cloudflare CDN
- `next/image` integration with Cloudflare
- Authorization audit (RLS testing with different roles)
- Accessibility audit (WCAG 2.1 AA)
- Responsive QA across breakpoints
- Performance audit (Lighthouse, Core Web Vitals)
- SEO verification (metadata, sitemap, canonical URLs)
- Error states (404, 500, loading)
- Production environment verification
- Regression testing
- `/dev/media` env-gating

**Deliverable:** Production-ready application with all hardcoded data removed, dynamic data verified, and performance/accessibility/SEO standards met.

---

*This document is the canonical architecture proposal for HAMMAH production commerce. It was produced by inspecting the actual repository at `C:\Games\Hammat` on September 11, 2026. All file paths, data structures, and component relationships reference real files found in the codebase.*
