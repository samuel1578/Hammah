# 07 — HAMMAH Development Roadmap

> **Purpose:** Track development from current state to production. Each sprint has clear goals, dependencies, deliverables, out-of-scope items, and exit criteria.
>
> **Canonical source of truth:** This document.
>
> **Last verified against repo:** September 11, 2026 (Sprint 0.17)

---

## Sprint 0.14 — Architecture Investigation

**Status:** ✅ Complete

**Goal:** Inspect the actual repository and produce a canonical architecture blueprint for transitioning from hardcoded fixtures to production commerce.

**Key deliverables:**
- `HAMMAH_SPRINT_0_14_ARCHITECTURE.md` — 35-section architecture investigation
- `docs/development/` — 7 canonical development documents
- Findings: 8 products, 3 categories, 3 collections, 160 Pixieset images, ~55 media slots, request-based order flow, fully mocked auth

**Dependencies:** None

---

## Sprint 0.15 — Production Foundation

**Status:** ✅ Complete

**Goal:** Establish the Supabase + Cloudflare foundation so that Sprint 0.16 can begin replacing fixtures with dynamic reads.

### Dependencies
- Supabase project created (free tier)
- Cloudflare account with R2 enabled
- `.env.local` configured with credentials

### Major Deliverables
- All table migrations (profiles, categories, collections, products, product_variants, collection_products, media_assets, product_media, homepage_featured_products, homepage_hero_images, homepage_collection_feature)
- Indexes and constraints
- RLS policies
- Role model (profiles.role enum)
- Server/client Supabase helpers (`src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`)
- Session middleware for auth
- Cloudflare R2 bucket configuration
- Signed upload URL generation (server action or API route)
- `.env.example` with all required variables

### Out of Scope
- Public page migration (stays fixture-driven)
- Auth implementation
- Order implementation
- Admin UI
- Media upload UI

### Exit Criteria
- `npm run build` succeeds
- All tables exist in Supabase with correct schema
- RLS policies enforce access rules
- Supabase client helpers work from server components
- Signed upload URL generation works
- No public page behaviour changed

---

## Sprint 0.16 — Catalogue Migration

**Status:** ✅ Complete (closeout verified)

**Goal:** All public catalogue pages read from Supabase with identical output to current fixture-driven pages.

### Closeout Verification (September 11, 2026)
- Product variants are **Supabase-authoritative** — `ProductInfoPanel` now reads `product.variants` from DB, `PRODUCT_SIZES` global fixture removed from runtime
- Variant parity confirmed: 4 variants (30, 32, 34, 36) all available across all 8 products
- All 5 migrated routes are **request-time dynamic** (cookies() in Supabase server client forces dynamic rendering)
- Remaining fixture dependencies classified: 0 obsolete, 2 seed-support, 22 runtime/dev
- TypeScript clean, build clean (17 pages)

### Dependencies
- Sprint 0.15 complete (foundation in place)
- Supabase project with schema deployed

### Major Deliverables
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
- TypeScript fallbacks retained until parity verified
- Video data model ready (no video upload yet)
- 360° data model ready (no 360 upload yet)

### Out of Scope
- Auth implementation
- Order implementation
- Admin UI
- Media upload UI
- Route changes (no URL redirects yet)

### Exit Criteria
- `npm run build` succeeds
- All public catalogue pages render correctly from Supabase data
- Output matches fixture-driven output (verified by comparison)
- Curated product-media groupings preserved
- `/collections/[slug]` dynamic route works for any published collection
- TypeScript fallbacks removed after parity verified

---

## Sprint 0.17 — Admin Dashboard & CTA System

**Status:** ✅ CLOSED / COMPLETE

**Goal:** Admin dashboard for managing all business content, plus CTA system with predefined frontend placement slots.

### Closeout Summary (September 11, 2026)
- Admin dashboard with role-based access control
- Admin routes: `/admin`, `/admin/login`, `/admin/products`, `/admin/categories`, `/admin/collections`, `/admin/media`, `/admin/homepage`, `/admin/ctas`
- Product, category, collection, media, homepage, and CTA CRUD operations
- CTA system with 6 predefined frontend slots
- Two Supabase clients: service-role for mutations, cookie-based for auth checks
- Middleware auth flow for admin route protection
- Reusable Media Picker component (modal, search, filter, single/multi select)
- Product media UX: clear Primary/Hover/Gallery/Detail sections with obvious actions
- Gallery/Detail reordering via move left/right arrows
- Removal/unassignment controls (does not delete global media assets)
- Human QA verified: R2 upload → Media Library → Product assignment → Public storefront rendering

---

## Sprint 0.18 — Orders + WhatsApp Handoff

**Status:** ✅ Complete

**Goal:** Real order submission and persistence with immutable historical records.

### Dependencies
- Sprint 0.17 complete (admin dashboard working)
- Product catalogue reading from Supabase

### Major Deliverables
- Real "Order This Piece" flow
- Server-side product/price validation on order submission
- Order + order item persistence with immutable snapshots
- Customer order history
- Order status tracking (customer-facing)
- Delivery/contact information collection
- Order number generation (HAM-YYYY-NNNN)
- Guest order support (no account required)
- Email confirmation (optional, via Supabase Edge Function or Resend)
- Failure/retry handling

### Out of Scope
- Admin UI
- Media upload UI
- Payment processing (request-based model)

### Exit Criteria
- `npm run build` succeeds
- Order submission persists to database
- Order items snapshot product data correctly
- Guest orders work (user_id = NULL)
- Order history visible in account area
- Order status transitions work

---

## Sprint 0.19 — Hamatee Authentication + Account

**Status:** 🔲 Not started

**Goal:** Real authentication with persistent user accounts, saved pieces, and addresses.

### Dependencies
- Sprint 0.18 complete (orders working)
- Auth with admin role working

### Major Deliverables
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

### Out of Scope
- Admin UI (complete)
- Media upload UI

### Exit Criteria
- `npm run build` succeeds
- Admin login works (admin role required)
- Product CRUD works end-to-end
- Category CRUD works
- Collection CRUD works with product assignment
- Media upload to R2 works
- Media selection in product/collection editors works
- Homepage merchandising editors work
- Order management works

---

## Sprint 0.20 — Production Hardening / Cutover

**Status:** 🔲 Not started

**Goal:** Production-ready application with all hardcoded data removed, dynamic data verified, and performance/accessibility/SEO standards met.

### Dependencies
- Sprint 0.19 complete (auth and accounts working)
- All data managed via Admin

### Major Deliverables
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
- Remove obsolete fixture files

### Out of Scope
- New features
- Design changes
- New routes

### Exit Criteria
- `npm run build` succeeds
- No TypeScript fixture imports remain
- All pages render correctly from Supabase data
- Cloudflare CDN serves all media
- RLS policies pass audit
- Accessibility score meets WCAG 2.1 AA
- Performance score meets targets
- SEO metadata complete
- No regressions from current public frontend

---

## Sprint Sequence Summary

```
0.14 (Complete) ──▶ 0.15 (Complete) ──▶ 0.16 (Complete) ──▶ 0.17 (Complete)
                                                                │
                                                                ▼
                                        0.20 (Hardening) ◀── 0.19 (Auth) ◀── 0.18 (Orders)
```

---

*This document is the canonical development roadmap. For the current implemented state, see `01_HAMMAH_SYSTEM_CONTEXT.md`. For the architecture, see `02_HAMMAH_ARCHITECTURE.md`.*
