# 01 — HAMMAH System Context

> **Purpose:** Give any future AI/developer enough context to understand what HAMMAH is before touching code.
>
> **Canonical source of truth:** This document, cross-referenced with `02_HAMMAH_ARCHITECTURE.md` and `03_HAMMAH_DATA_MODEL.md`.
>
> **Last verified against repo:** September 11, 2026 (Sprint 0.17)

---

## 1. Project Purpose

HAMMAH is a premium African fashion commerce application. The public brand is **SL by Hammah**. The product focus is contemporary trousers, with future expansion to kaftans and African-made footwear. The commerce model is **request-based** — customers submit order requests and Hammah contacts them directly to complete the transaction.

---

## 2. Current Stack

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

**Build:** Turbopack (`next build`)
**Hosting target:** Vercel
**Database target:** Supabase Free (PostgreSQL + Auth + RLS)
**Media target:** Cloudflare R2 (images, video, 360° frames)

---

## 3. Repository Structure

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

---

## 4. Current Route Map

| Route | Type | Purpose | Data Source | Caching |
|-------|------|---------|-------------|---------|
| `/` | Dynamic | Homepage — 8 editorial sections | Supabase via `getHomepageFeaturedProducts` | Request-time dynamic (cookies) |
| `/shop` | Dynamic | All products with category filters | Supabase via `getPublishedProducts` + `getPublishedCategories` | Request-time dynamic (cookies) |
| `/collections` | Dynamic | Collection index (3 collections) | Supabase via `getPublishedCollections` | Request-time dynamic (cookies) |
| `/collections/[slug]` | Dynamic | Collection detail (any slug) | Supabase via `getPublishedCollectionBySlug` + `getCollectionProducts` | Request-time dynamic (cookies) |
| `/product/[slug]` | Dynamic | Product detail page | Supabase via `getPublishedProductBySlug` + `getRelatedProducts` | Request-time dynamic (cookies) |
| `/our-story` | Static | Editorial brand story | Hardcoded 761-line page | Static |
| `/legacy` | Static | Hamatee membership marketing | Hardcoded editorial | Static |
| `/saved` | Static | Saved pieces (demo, no persistence) | Legacy fixture (`products.ts`, first 4) | Static |
| `/login` | Static | Sign-in (mocked, no real auth) | Frontend demo | Static |
| `/signup` | Static | Registration (mocked, 2-step) | Frontend demo | Static |
| `/track` | Static | Order tracking (demo) | Hardcoded timeline | Static |
| `/delivery` | Static | Delivery information | Hardcoded editorial | Static |
| `/returns` | Static | Returns policy | Hardcoded editorial | Static |
| `/size-guide` | Static | Size guide | Hardcoded measurements | Static |
| `/privacy` | Static | Privacy policy | Hardcoded legal | Static |
| `/terms` | Static | Terms & conditions | Hardcoded legal | Static |
| `/dev/media` | Static | Dev-only 160-image contact sheet | `pixieset-collection-001.ts` | Static |
| `/admin` | Dynamic | Admin dashboard | Supabase (cookie + admin client) | Request-time dynamic |
| `/admin/login` | Static | Admin login | Supabase Auth | Static |
| `/admin/products` | Static | Product list | Supabase | Static |
| `/admin/products/[id]` | Dynamic | Product edit | Supabase | Dynamic |
| `/admin/products/new` | Static | Create product | Supabase | Static |
| `/admin/categories` | Static | Category list | Supabase | Static |
| `/admin/categories/[id]` | Dynamic | Category edit | Supabase | Dynamic |
| `/admin/collections` | Static | Collection list | Supabase | Static |
| `/admin/collections/[id]` | Dynamic | Collection edit | Supabase | Dynamic |
| `/admin/collections/new` | Static | Create collection | Supabase | Static |
| `/admin/media` | Static | Media Library | Supabase | Static |
| `/admin/homepage` | Static | Homepage merchandising | Supabase | Static |
| `/admin/ctas` | Static | CTA Manager | Supabase | Static |
| `/admin/ctas/[id]` | Dynamic | CTA edit | Supabase | Dynamic |
| `/admin/ctas/new` | Static | Create CTA | Supabase | Static |

**Total:** 32 routes (16 public + 15 admin + `/dev/media`)

**Caching note:** All 5 Supabase-backed routes are request-time dynamic because the cookie-based Supabase server client (`src/lib/supabase/server.ts`) calls `cookies()`, which opts the route into dynamic rendering. No `export const revalidate`, `export const dynamic`, or `use cache` is used.

---

## 5. Current Data Architecture

Catalogue data (products, categories, collections, media, variants) is read from **Supabase** via the data-access layer in `src/lib/catalogue/`. Editorial content, navigation, and homepage sections still use TypeScript fixture files under `src/data/`.

### Supabase Data (Catalogue — Authoritative)

| Query Function | Purpose |
|----------------|---------|
| `getPublishedProducts()` | All published products with media + variants |
| `getPublishedProductBySlug(slug)` | Single product by slug |
| `getRelatedProducts(slug, count)` | Related products for PDP |
| `getPublishedCollections()` | All published collections |
| `getPublishedCollectionBySlug(slug)` | Single collection by slug |
| `getCollectionProducts(slug)` | Products in a collection |
| `getPublishedCategories()` | All published categories |
| `getProductsByCategorySlug(slug)` | Products by category |
| `getHomepageFeaturedProducts()` | Featured products for homepage |
| `getActiveCtaPlacements()` | Active CTAs for frontend slots |

### Fixture Files (Editorial/Dev — Still in Use)

| File | Records | Purpose | Classification |
|------|---------|---------|----------------|
| `src/data/products.ts` | 8 products | Legacy fixture, used by `/saved` page + seed reference | A (runtime for `/saved`) |
| `src/data/pixieset-collection-001.ts` | 160 images | Raw Pixieset image pool, used by editorial sections + dev tool | A (runtime + dev) |
| `src/data/media-manifest.ts` | ~55 slots | Route-based media references for editorial sections | A (runtime) |
| `src/data/navigation.ts` | 4 nav structures | Primary, utility, category, footer navigation | A (runtime) |
| `src/data/site-content.ts` | 4 pages | Minimal page metadata (largely unused) | A (runtime) |
| `src/data/collections.ts` | 3 collections | Legacy fixture (not imported by migrated routes) | B (seed support) |
| `src/data/categories.ts` | 3 categories | Legacy fixture (not imported by migrated routes) | B (seed support) |

### Type Definitions

| File | Types |
|------|-------|
| `src/types/products.ts` | `Product`, `Collection`, `Category`, `ProductMedia`, `ProductVariant` |
| `src/types/content.ts` | `PageContent`, `HeroSection`, `EditorialSection` |

---

## 6. What Is Currently Implemented

### Functional
- Full homepage with 8 editorial sections (hero rotation, featured pieces, craft detail, category world, legacy, FAQ, closing)
- Shop page with all 8 products and category filter tabs
- Collections index with Collection 001 dominant + Kaftans/Footwear previews
- Dynamic PDP via `/product/[slug]` with gallery, info panel, related pieces
- Order request drawer (frontend only, no persistence)
- Saved pieces page with demo state toggle (populated/empty/signed-out)
- Our Story editorial page (761 lines of approved copy)
- Hamatee/Legacy marketing page
- Auth pages (login, signup) with full UI
- Legal pages (delivery, returns, size guide, privacy, terms)
- Dev media contact sheet (`/dev/media`) with search, copy, fullscreen preview
- Admin dashboard with role-based access
- Admin product, category, collection, media, homepage, and CTA management
- CTA system with predefined frontend placement slots
- Light/dark theme via `next-themes`
- Motion animations throughout (scroll reveals, page transitions, stagger effects)
- Responsive design across all breakpoints

### Data Features
- 8 products with 7 curated Pixieset images each (56 product images total)
- `media-manifest.ts` provides ~55 typed media slots consumed by editorial components
- Product `id` === `slug` in legacy fixture; DB uses UUIDs internally + unique slugs for routing
- Product variants are **Supabase-authoritative** — per-product from `product_variants` table (replaces global `PRODUCT_SIZES`)
- All products are `PRICE_ON_REQUEST` with `AVAILABLE` status
- All products belong to category `trousers` and collection `collection-001`

---

## 7. What Is Mocked

| Feature | Mocking Method | Reality |
|---------|---------------|---------|
| Login | `setTimeout` in `handleSubmit` | Always returns error or generic failure |
| Signup | `setTimeout` in `handleStep2Submit` | Shows success state, no data persisted |
| Google OAuth | Button exists, no handler | Clicking does nothing real |
| Session | None | No cookies, tokens, or state persistence |
| Saved Pieces | `useState<SavedState>("populated")` | Dev toggle between 3 demo states |
| Save Piece (heart) | `useState(false)` toggle | No persistence, no user association |
| Order submission | `setTimeout` → `setSubmitted(true)` | Success state only, no data persisted |
| Order tracking | Hardcoded timeline steps | No real order data |
| Size selection | `product.variants` from Supabase | Per-product variants, DB-authoritative |

---

## 8. What Is Not Implemented

- No real authentication or session management (fully mocked)
- No product video playback (placeholder tab only)
- No 360° viewer (placeholder tab only)
- No data persistence for orders, saved pieces, or addresses
- No API routes
- No `/shop/[category]` dynamic route (deferred — category filtering is client-side on `/shop`)
- No env files committed (`.env.local` required, `.env.example` provided)
- Cloudflare R2 media upload not yet wired (media URLs point to Pixieset CDN directly)

---

## 9. Important Terminology

### Product
A sellable item in the catalogue. Currently: "Design 01" through "Design 08". Has a name, description, category, media assets, pricing mode, and availability. Products belong to one category and may belong to multiple collections.

### Category
A product classification. Currently: **Trousers**, **Kaftans**, **African-made Footwear**. Categories are distinct from collections. A product belongs to exactly one category.

### Collection
An editorial/commercial grouping of products. Currently: **Collection 001** (8 products), **Kaftans** (empty), **Footwear** (empty). Collections are dynamic — a future Collection 002 requires no developer changes. A product may belong to multiple collections.

### Hamatee
The customer/member concept. "Hamatee" is the branded term for a Hammah account holder. The authenticated account area is `/account` (future). The public Legacy page (`/legacy`) is marketing content explaining the Hamatee program.

### Legacy
The Hamatee membership program. Public marketing page at `/legacy`. Future authenticated account area at `/account`.

### Media Asset
A stored image, video, or 360° frame. The canonical identity is based on provider/storage reference, not a public URL. Media assets are managed via Admin and referenced by products, collections, and homepage sections.

### Admin
The business data management interface. Admin manages products, categories, collections, media, homepage merchandising, orders, and customers. Admin does NOT manage CSS, typography, animation, layout, breakpoints, or component structure. HAMMAH is not building a page builder.

### Media Manifest
The current route-based media reference system in `src/data/media-manifest.ts`. This is a **current-state** concept that dissolves during migration — media references move to database relationships.

---

## 10. Current Public Frontend Maturity

The public frontend is substantially complete. All 19 routes render correctly. The visual design, typography system, animation, responsive layout, and editorial content are production-quality.

**What prevents production deployment:**
1. All data is hardcoded — no dynamic content management
2. No authentication — login/signup are frontend demos
3. No persistence — saved pieces, orders, nothing is saved
4. No admin — business content cannot be managed by non-developers

---

## 11. `/dev/media` Route

Route: `/dev/media` (315 lines, client component)

A visual contact sheet displaying all 160 Pixieset images from Collection 001. Features responsive grid, image number badges, search by number, jump-to-image input, copy URL button, copy reference button, fullscreen preview with keyboard navigation.

**Key facts:**
- Not linked from public navigation — accessed only by typing the URL
- No authentication or authorization
- Client component (entire page is `"use client"`)
- Reads from `COLLECTION_001_PIXIESET` array
- Should be env-gated for production (not exposed publicly)

---

## 12. Current Product Fixture Structure

Each product in `src/data/products.ts` has this shape:

```typescript
{
  id: "design-01",           // slug-like ID, same as slug
  slug: "design-01",         // same as id
  name: "Design 01",         // placeholder naming
  collection: "collection-001",  // string slug, not FK
  category: "trousers",      // string slug, not FK
  pricingMode: "PRICE_ON_REQUEST",
  availability: "AVAILABLE",
  description: "One of eight trouser designs...",  // temporary
  media: {
    primary: "https://images.pixieset.com/.../u(11).jpg",
    hover: "https://images.pixieset.com/.../u(37).jpg",
    gallery: ["u(37)", "u(38)", "u(39)", "u(40)", "u(41)"],
    details: ["u(42)", "u(43)"],
    thumbnail: "https://images.pixieset.com/.../u(11).jpg"  // same as primary
  }
}
```

**Observations:**
- `id` and `slug` are identical — no separate UUID
- `collection` is a string slug, no referential integrity
- `category` is a string slug, no referential integrity
- `PRODUCT_SIZES` is global — all products share 4 sizes (30, 32, 34, 36)
- No price field (all PRICE_ON_REQUEST)
- No sort order field
- No publish/draft state
- No timestamp fields
- `media.thumbnail` always equals `media.primary` — redundant

---

## 13. Current Order Behaviour

The order flow is **request-based**, not instant checkout:

1. Customer clicks "Order This Piece" on PDP
2. `OrderDrawer` slides in from right
3. Shows order summary: product thumbnail, name, "Collection 001", size, qty, "Price on request"
4. Customer fills: Name, Phone/WhatsApp, Email (optional), Region, City/Town, Area, Landmark, GhanaPost GPS, Delivery Notes
5. Customer clicks "Place Order Request"
6. Success state: "Your order request is in." + "This is currently a frontend demonstration"
7. **No data is persisted anywhere**

**Business process:**
1. Customer submits order request
2. Hammah contacts customer directly (WhatsApp/phone)
3. They agree on payment, delivery, final pricing
4. Hammah fulfils the order

---

## 14. Current Auth Behaviour

| Page | Implementation | Reality |
|------|---------------|---------|
| `/login` | Email/password form, `setTimeout` 800ms | Always shows error; no real auth |
| `/signup` | 2-step form (personal → password), `setTimeout` 1000ms | Shows success; no data created |
| Google OAuth | Button exists on login + signup | No handler attached |
| Session | None | No cookies, tokens, or state |

---

*This document describes the current implemented state. For the approved production architecture, see `02_HAMMAH_ARCHITECTURE.md`.*
