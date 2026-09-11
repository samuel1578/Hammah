# 04 — HAMMAH Product and Admin Rules

> **Purpose:** Freeze product/business rules. These are approved decisions that all future development must follow.
>
> **Canonical source of truth:** This document.
>
> **Last verified against repo:** September 11, 2026

---

## 1. Products

### Core Rules

1. **Category ≠ Collection.** These are distinct concepts. A product belongs to one category and may belong to multiple collections.
2. **One product belongs to one category.** This is a many-to-one relationship.
3. **One product may belong to multiple collections.** This is a many-to-many relationship via `collection_products`.
4. **Product naming is Admin-managed.** Current "Design 01"–"Design 08" names are temporary placeholders.
5. **Existing curated image groupings must survive migration.** The 56 curated Pixieset images across 8 products must be preserved as `product_media` junction records.
6. **Product lifecycle:** `draft → published → archived`. Three-state model. No review queues.
7. **Published products require valid catalogue/media data.** At minimum: name, category, at least one media asset.
8. **Historical order references must survive renaming/archiving.** Order items snapshot mutable product data.

### Product Fields

| Field | Source | Notes |
|-------|--------|-------|
| Name | Admin | Display name, 1–200 chars |
| Slug | Admin (auto-generated from name) | Unique, pattern `^[a-z0-9]+(-[a-z0-9]+)*$` |
| Description | Admin | Optional product description |
| Category | Admin (select) | Required, FK → categories |
| Collections | Admin (multi-select) | Via junction table |
| Pricing mode | Admin | PRICE_ON_REQUEST or FIXED |
| Price | Admin | Required if mode = FIXED, in pence/pesewas |
| Currency | Admin | Default GHS |
| Availability | Admin | AVAILABLE, COMING_SOON, SOLD_OUT |
| Sort order | Admin | Within category |
| Status | Admin | draft, published, archived |
| Media | Admin (media picker) | Primary, hover, gallery, details |
| Video | Admin (media picker) | Optional, future |
| 360° set | Admin (upload) | Optional, future/provisional |
| Variants/Sizes | Admin | Per-product via product_variants |

---

## 2. Categories

### Current Categories

| Category | Slug | Description |
|----------|------|-------------|
| Trousers | trousers | African-print trousers form the opening Hammah collection |
| Kaftans | kaftans | A wider expression of the Hammah wardrobe |
| African-made Footwear | footwear | The Hammah wardrobe continues from the ground up |

### Rules

1. **Categories are product classifications**, not editorial groupings.
2. **Future categories are possible.** The system must accommodate new categories without code changes.
3. **Category browse belongs under `/shop`.** Future routes: `/shop/trousers`, `/shop/kaftans`, `/shop/footwear`.
4. **Category archive rule:** A category can only be archived if no products are assigned to it.
5. **Category sort order** controls display order in Shop filters and navigation.

### Category vs Collection Distinction

| Aspect | Category | Collection |
|--------|----------|------------|
| Purpose | Product classification | Editorial/commercial grouping |
| Relationship | One product → one category | One product → many collections |
| URL pattern | `/shop/[category]` | `/collections/[slug]` |
| Examples | Trousers, Kaftans, Footwear | Collection 001, Summer Essentials, Limited Edition |
| Admin scope | Manage product taxonomy | Manage merchandising/editorial |

---

## 3. Collections

### Current Collections

| Collection | Slug | Products | Notes |
|------------|------|----------|-------|
| Collection 001 | collection-001 | 8 products | Active, has full page |
| Kaftans | kaftans | 0 products | Placeholder |
| Footwear | footwear | 0 products | Placeholder |

### Rules

1. **Collections are dynamic.** A future Collection 002 requires no developer changes — Admin creates it and it appears on `/collections` and `/collections/[slug]`.
2. **Collection 001 must NOT be architecturally special.** It is the first seed data, but the system treats all collections identically.
3. **Slug-based routing is the approved model.** `/collections/[slug]` handles any published collection.
4. **Special Edition, Limited Edition, seasonal/editorial collections** must work without developer changes.
5. **Collection archive rule:** Archiving a collection removes it from public view but preserves product relationships.
6. **Collection sort order** controls display order on `/collections` index.

---

## 4. Homepage Merchandising

### What Admin Eventually Controls

| Section | Current Source | Future Admin Control |
|---------|---------------|---------------------|
| Featured Pieces | `getProductsByCollection("collection-001").slice(0, 4)` | Select products, control order, show/hide section |
| Collection Feature | `getMediaBySection("collection-001")` | Select collection, edit heading/statement, control images |
| Editorial Hero | 4 hardcoded Pixieset URLs in `home-editorial-hero.tsx` | Select images, control order, edit alt text |
| Category World | 3 hardcoded entries in `home-world.tsx` | Read from categories table (show_on_homepage flag) |
| FAQ | 8 hardcoded items in `home-faq.tsx` | Keep as code (editorial, not merchandising) |
| Legacy benefits | 4 hardcoded items in `home-legacy.tsx` | Keep as code (editorial/design) |

### Rules

1. **A generic merchandising-slot model is NOT justified** at this stage. HAMMAH has one homepage with specific sections.
2. **Homepage sections are Admin-managed** for product/image selection and ordering.
3. **Homepage section copy** (headings, statements) is Admin-managed where it affects merchandising.
4. **Editorial content** (Our Story, FAQ, Legacy benefits, legal pages) remains code-owned.
5. **No page builder.** Admin manages data, not layout or design.

---

## 5. Admin

### What Admin Owns

- Products (CRUD, publish/unpublish/archive)
- Categories (CRUD, reorder)
- Collections (CRUD, publish/unpublish/archive, add/remove/reorder products)
- Media Library (upload, manage, select for products/collections/homepage)
- Homepage merchandising (featured products, hero images, collection feature)
- Orders (view, update status, add notes)
- Customers (view profiles, order history)

### What Code Owns

- CSS, typography scale, colour system
- Animation easing, timing, motion design
- Component structure and composition
- Layout and responsive breakpoints
- Navigation structure (links, hierarchy)
- Editorial page copy (Our Story, delivery, returns, FAQ, legal)
- SEO metadata templates
- Error states (404, 500)

### Dangerous Actions

| Action | Risk | Mitigation |
|--------|------|------------|
| Archive product | Removes from public view | Confirm dialog; check order references |
| Delete product | Permanent data loss | Only allowed if zero order references |
| Archive category | Removes from public | Only if zero products assigned |
| Delete media asset | Permanent | Only if zero references (product/collection/homepage) |
| Cancel order | Operational impact | Confirm dialog; status change only |
| Change order status | Customer impact | Validate status transitions |

### Publishing Behaviour

1. Admin creates entity → starts as `draft`
2. Admin fills fields, uploads media
3. Admin clicks "Publish" → status = `published`, `published_at` set
4. Public site shows entity (after cache revalidation)
5. Admin can "Unpublish" → status back to `draft`
6. Admin can "Archive" → status = `archived`, `archived_at` set
7. Archived items can be "Restored" to `draft` or `published`

---

## 6. Hamatee / Account

### Definition

**Hamatee** is the branded term for a Hammah account holder. The account concept encompasses:
- Profile (name, email, phone)
- Saved Pieces
- Order History
- Delivery Addresses
- Member Privileges (future)

### Route

- **Public marketing:** `/legacy` — explains the Hamatee program
- **Authenticated area:** `/account` — future, with sections:
  - Overview
  - Orders
  - Saved Pieces
  - Profile
  - Addresses
  - Privileges

### Rules

1. **`/account` is the approved authenticated route.** Shorter, clearer, more conventional than `/hamatee`.
2. **"Hamatee" branding lives in copy and UI**, not in the URL.
3. **The public Legacy page may remain** as explanatory/marketing content but should not be confused with the authenticated account area.
4. **Account icon behaviour:** Logged in → `/account`, logged out → `/login`.
5. **Guest order support** is retained — orders do not require an account.

---

## 7. Order Model

### Business Process

This is NOT conventional e-commerce checkout:

1. Customer submits order request (name, phone, delivery details)
2. Hammah contacts customer directly (WhatsApp/phone)
3. They agree on payment, delivery, final pricing
4. Hammah fulfils the order

### Order Status Flow

```
pending → contacted → confirmed → preparing → ready → shipped → delivered
                                    ↓
                                cancelled
```

### Rules

1. **Request-based, not instant checkout.** No payment processing at submission.
2. **Server-authoritative validation.** Product existence, availability, and price validated server-side.
3. **Immutable order items.** Name, slug, price, image snapshotted at order time.
4. **Guest support.** `user_id` is nullable — guests can submit orders.
5. **Order number format:** `HAM-YYYY-NNNN` (e.g., HAM-2026-0001), auto-incrementing.
6. **Currency:** GHS (Ghanaian Cedi) default.

---

*This document freezes product/business rules. For the data model, see `03_HAMMAH_DATA_MODEL.md`. For the architecture, see `02_HAMMAH_ARCHITECTURE.md`.*
