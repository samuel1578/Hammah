# 02 — HAMMAH Architecture

> **Purpose:** Define the approved production architecture. Distinguish CURRENT from TARGET.
>
> **Canonical source of truth:** This document, cross-referenced with `03_HAMMAH_DATA_MODEL.md` and `05_HAMMAH_MEDIA_ARCHITECTURE.md`.
>
> **Last verified against repo:** September 11, 2026 (Sprint 0.17)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    NEXT.JS 16                              │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │  │
│  │  │  SERVER COMPONENTS│  │  CLIENT COMPONENTS           │   │  │
│  │  │  (data fetching)  │  │  (interactivity, UI)         │   │  │
│  │  │                   │  │                              │   │  │
│  │  │  - Public pages   │  │  - PDP, Shop, Collections   │   │  │
│  │  │  - PDP data       │  │  - Auth pages               │   │  │
│  │  │  - Collections    │  │  - Admin dashboard          │   │  │
│  │  │  - SEO/metadata   │  │  - Order drawer             │   │  │
│  │  │                   │  │  - Saved pieces             │   │  │
│  │  └────────┬──────────┘  └──────────┬───────────────────┘   │  │
│  │           │                        │                        │  │
│  │           └──────────┬─────────────┘                        │  │
│  │                      │                                      │  │
│  │              ┌───────▼────────┐                             │  │
│  │              │  API ROUTES     │                             │  │
│  │              │  (server-side)  │                             │  │
│  │              │  - Auth         │                             │  │
│  │              │  - Orders       │                             │  │
│  │              │  - Media upload │                             │  │
│  │              │  - Admin CRUD   │                             │  │
│  │              └───────┬────────┘                             │  │
│  └──────────────────────┼──────────────────────────────────────┘  │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
     ┌────────▼───┐ ┌────▼────┐ ┌───▼────────┐
     │  SUPABASE   │ │CLOUDFLARE│ │  CLOUDFLARE │
     │  PostgreSQL │ │   R2     │ │   CDN       │
     │  Auth       │ │ (media)  │ │ (delivery)  │
     │  RLS        │ │          │ │             │
     └────────────┘ └──────────┘ └─────────────┘
```

---

## 2. Component Responsibilities

### Next.js (on Vercel)
- **Public catalogue pages:** Server components fetching from Supabase
- **PDP:** Server component for data, client component for interactivity
- **Admin pages:** Client components with authenticated data fetching
- **API routes:** Server-side mutations (orders, media upload, admin CRUD)
- **Middleware:** Session handling, auth redirects, admin role checks
- **SEO:** `generateMetadata()` for all public pages, dynamic sitemap

### Supabase
- **PostgreSQL:** All business data (products, categories, collections, orders, customers, media metadata)
- **Auth:** Email/password signup, Google OAuth, session management
- **RLS:** Row-level security enforcing access rules at the database level
- **API:** PostgREST auto-generated APIs (consumed via Supabase client)

### Cloudflare
- **R2:** Binary media storage (images, video, 360° frames)
- **CDN:** Media delivery with automatic format/quality optimisation

### Vercel
- **Hosting:** Next.js deployment
- **Edge:** Middleware execution
- **Analytics:** Performance monitoring (optional)

---

## 3. Server vs Client Boundaries

### Server Components (default)
All public page components that fetch data should be server components:
- Homepage sections reading from Supabase
- Shop page reading product list
- PDP reading product detail
- Collection pages reading collection data
- SEO metadata generation

### Client Components (`"use client"`)
Components requiring interactivity:
- All homepage sections with animations (Motion requires client)
- Product gallery, info panel, order drawer
- Auth pages (form handling)
- Admin dashboard (mutations, real-time updates)
- Saved pieces (user interactions)
- Mobile menu, theme toggle

### API Routes (server-side)
- `POST /api/orders` — create order request
- `POST /api/media/upload` — generate signed upload URL
- `GET/PUT/DELETE /api/admin/*` — admin CRUD operations
- `POST /api/auth/*` — auth callbacks
- `GET/POST/PUT/DELETE /api/admin/products` — product CRUD
- `GET/POST/PUT/DELETE /api/admin/categories` — category CRUD
- `GET/POST/PUT/DELETE /api/admin/collections` — collection CRUD
- `GET/POST/PUT/DELETE /api/admin/media` — media management
- `GET/POST/PUT/DELETE /api/admin/ctas` — CTA management
- `GET/PUT /api/admin/homepage` — homepage merchandising

---

## 4. Public Catalogue Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Supabase    │────▶│  Server      │────▶│  Client      │
│  PostgreSQL  │     │  Component   │     │  Component   │
│              │     │  (page.tsx)  │     │  (interactive)│
│  products    │     │              │     │              │
│  categories  │     │  SELECT *    │     │  Renders     │
│  collections │     │  FROM ...    │     │  received    │
│  media       │     │  WHERE ...   │     │  props       │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Pattern:**
1. Server component queries Supabase directly (no API route needed for reads)
2. Data passed as props to client components
3. Client components handle interaction only — no data fetching

---

## 5. Admin Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin UI    │────▶│  API Route   │────▶│  Supabase    │
│  (client)    │     │  (server)    │     │  PostgreSQL  │
│              │     │              │     │              │
│  Form data   │     │  Validate    │     │  INSERT/     │
│  mutations   │     │  Authorize   │     │  UPDATE/     │
│              │     │  Execute     │     │  DELETE      │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Pattern:**
1. Admin UI sends mutation to API route
2. API route validates input, checks admin role
3. API route executes Supabase mutation with service-role client
4. Response returned to UI
5. UI revalidates cached data

**Two Supabase clients:**
- **Service-role client** — used for admin mutations (bypasses RLS, server-side only)
- **Cookie-based client** — used for auth checks and reading (respects RLS, session from cookie)

---

## 6. Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Login/      │────▶│  Supabase    │────▶│  Middleware   │
│  Signup      │     │  Auth        │     │  (session)   │
│  (client)    │     │              │     │              │
│              │     │  email/pass  │     │  Cookie      │
│  Form →      │     │  Google OAuth│     │  validation  │
│  Supabase    │     │  JWT token   │     │  Redirect    │
│  client SDK  │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Request     │────▶│  Middleware   │────▶│  Route       │
│  (any page)  │     │  (Edge)      │     │  Handler     │
│              │     │              │     │              │
│  Cookie →    │     │  Validate    │     │  Admin?      │
│  Supabase    │     │  session     │     │  → admin check│
│  session     │     │  Check role  │     │  Public?     │
│              │     │  Redirect    │     │  → proceed   │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Key rules:**
- Supabase client SDK handles auth on client side
- Session stored in HTTP-only cookie (Supabase default)
- Middleware validates session on protected routes
- Profile created via database trigger on signup
- Admin role checked in RLS policies and middleware
- `/admin/*` routes require admin role; unauthenticated users redirect to `/admin/login`

---

## 7. Media Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin       │────▶│  API Route   │────▶│  Cloudflare  │
│  Upload      │     │  (server)    │     │  R2          │
│              │     │              │     │              │
│  File →      │     │  Generate    │     │  Store       │
│  signed URL  │     │  signed URL  │     │  binary      │
│              │     │  Create      │     │              │
│              │     │  DB record   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                            │
┌──────────────┐     ┌──────────────┐       │
│  Public      │◀────│  Cloudflare  │◀──────┘
│  Pages       │     │  CDN         │
│              │     │              │
│  <img> src   │     │  Auto-optim  │
│  = CDN URL   │     │  Format/Qual │
└──────────────┘     └──────────────┘
```

**Current state:** All images are Pixieset URLs. No Cloudflare configured.
**Target state:** Images uploaded to R2, served via CDN, URLs stored in `media_assets`.

---

## 8. Order Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PDP         │────▶│  API Route   │────▶│  Supabase    │
│  OrderDrawer │     │  POST /api/  │     │  orders +    │
│  (client)    │     │  orders      │     │  order_items │
│              │     │              │     │              │
│  Form data → │     │  Validate    │     │  Persist     │
│  Submit      │     │  Snapshot    │     │  Immutable   │
│              │     │  Create      │     │  records     │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Critical:** Order items must snapshot mutable product data (name, slug, price, image) at order time. Historic orders must NOT depend on current product state.

---

## 9. Caching / Revalidation Principles

| Page Type | Strategy | Revalidation |
|-----------|----------|-------------|
| Homepage | ISR (stale-while-revalidate) | 60 seconds |
| Shop | ISR | 60 seconds |
| PDP | ISR | 60 seconds |
| Collections index | ISR | 60 seconds |
| Collection detail | ISR | 60 seconds |
| Our Story | ISR | 3600 seconds (1 hour) |
| Legal pages | ISR | 3600 seconds (1 hour) |
| Admin | No caching | Real-time |

**Cache invalidation:**
- Default: Wait for revalidation window (acceptable for most cases)
- Urgent: `revalidateTag()` / `revalidatePath()` for immediate updates

---

## 10. Admin vs Code Ownership

### Admin Owns (business data)
- Product names, descriptions, pricing, availability, media assignments
- Category names, descriptions, sort order
- Collection names, descriptions, hero images, product assignments
- Homepage featured products, hero images, collection feature
- Order status, admin notes
- Customer profiles (read-only in Admin)

### Code Owns (design/layout)
- CSS, typography scale, colour system
- Animation easing, timing, motion design
- Component structure and composition
- Layout and responsive breakpoints
- Navigation structure (links, hierarchy)
- Editorial page copy (Our Story, delivery, returns, etc.)
- FAQ content
- Legal pages (privacy, terms)

### Overlap (requires coordination)
- Size guide data → should come from `product_variants` (Admin-owned data, code-owned display)
- Navigation links → code structure, but links to Admin-managed pages

---

*This document describes the approved production architecture. For the current implemented state, see `01_HAMMAH_SYSTEM_CONTEXT.md`. For the data model, see `03_HAMMAH_DATA_MODEL.md`.*
