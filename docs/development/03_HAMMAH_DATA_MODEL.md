# 03 — HAMMAH Data Model

> **Purpose:** Canonical data-model reference. Three sections: CURRENT, APPROVED FOUNDATION, FUTURE.
>
> **Canonical source of truth:** This document, cross-referenced with `02_HAMMAH_ARCHITECTURE.md`.
>
> **Last verified against repo:** September 17, 2026 (Sprint 0.19)

---

## A. CURRENT IMPLEMENTED MODEL

These are the actual TypeScript types and fixtures in the codebase today.

### Types (`src/types/products.ts`)

```typescript
type PricingMode = "PRICE_ON_REQUEST" | "FIXED";
type Availability = "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";
type MediaMode = "photos" | "video";

interface ProductMedia {
  primary: string;    // Pixieset URL
  hover?: string;     // Pixieset URL (alternate view)
  gallery: string[];  // 4-5 Pixieset URLs
  details: string[];  // 2 Pixieset URLs
  thumbnail: string;  // Same as primary (redundant)
}

interface Product {
  dbId: string;            // UUID, actual DB primary key
  id: string;              // "design-01" (slug-like, same as slug)
  slug: string;            // "design-01" (same as id)
  name: string;            // "Design 01"
  collection: string;      // "collection-001" (string slug, not FK)
  category: string;        // "trousers" (string slug, not FK)
  pricingMode: PricingMode;
  availability: Availability;
  description: string;
  videoUrl: string | null;
  sizeGuideId: string | null;
  media: ProductMedia;
  variants: ProductVariant[];  // Per-product from Supabase (replaces global PRODUCT_SIZES)
}

interface Collection {
  id: string;              // "collection-001" (slug-like)
  slug: string;            // Same as id
  name: string;
  description?: string;
  heroImage?: string;      // Local path (incomplete)
  products: string[];      // ["design-01", ..., "design-08"]
  visibility?: "PUBLISHED" | "HIDDEN";
  sortOrder?: number;
}

interface Category {
  id: string;              // "trousers" (slug-like)
  slug: string;            // Same as id
  name: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  route: string;           // "/collections/collection-001" — semantic mismatch
  visibility?: "PUBLISHED" | "HIDDEN";
  sortOrder?: number;
}

interface ProductVariant {
  label: string;           // "30", "32", "S", "M"
  value: string;           // Normalized value
  available: boolean;
}
```

### Current Fixture Data

| Entity | Count | Source File |
|--------|-------|-------------|
| Products | 8 | `src/data/products.ts` |
| Collections | 3 | `src/data/collections.ts` |
| Categories | 3 | `src/data/categories.ts` |
| Pixieset images | 160 | `src/data/pixieset-collection-001.ts` |
| Media slots | ~55 | `src/data/media-manifest.ts` |

### Current Relationships (implicit, not enforced)

```
Product.collection → Collection.id (string match, no FK)
Product.category   → Category.id (string match, no FK)
Collection.products → Product.id[] (string array, no junction)
Category.route     → Collection slug (semantic collision)
```

### Current Limitations

1. `id` and `slug` are identical — no separate UUID
2. No referential integrity — string matches only
3. Per-product variants are now DB-authoritative (replaces global `PRODUCT_SIZES`)
4. No price field (all PRICE_ON_REQUEST)
5. No sort order on products
6. No publish/draft state
7. No timestamps
8. `media.thumbnail` always equals `media.primary`
9. Collection-product relationship is one-directional (collection has product IDs, but product also has `collection` string)
10. Category `route` field conflates categories with collections

---

## B. APPROVED SPRINT 0.15 FOUNDATION MODEL

**Status: Implemented** — All tables below are created in `supabase/migrations/00001_initial_schema.sql`. Apply via Supabase SQL Editor or `supabase` CLI.

### Table: `profiles`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | — | PK, FK → auth.users(id) |
| `first_name` | text | NOT NULL | — | |
| `last_name` | text | NOT NULL | — | |
| `phone` | text | NULLABLE | — | |
| `role` | text | NOT NULL | `'customer'` | CHECK IN ('customer', 'admin') |
| `avatar_url` | text | NULLABLE | — | |
| `date_of_birth` | date | NULLABLE | — | Birthday, Sprint 0.19B |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** User profile, linked 1:1 to Supabase auth.users.
**Creation:** Automatic via `handle_new_user()` trigger on `auth.users` INSERT (Sprint 0.19A).
**RLS:** Users can read/update own profile. Admins can read all profiles. Role changes restricted to admins via `prevent_role_escalation()` trigger.

### Table: `saved_products`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| `product_id` | uuid | NOT NULL | — | FK → products(id) ON DELETE CASCADE |
| `created_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Persistent Saved Pieces for authenticated Hamatee members.
**Constraints:** UNIQUE (user_id, product_id) — one save per customer per product.
**RLS:** Authenticated users can SELECT/INSERT/DELETE only their own rows.
**Indexes:** `idx_saved_products_user_id`, `idx_saved_products_user_product`

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

**Purpose:** Product classification. One product belongs to one category.
**RLS:** Public read where `status = 'published'`. Admin full CRUD.

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

**Purpose:** Editorial/commercial product groupings. Dynamic — new collections require no code changes.
**RLS:** Public read where `status = 'published'`. Admin full CRUD.

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
| `video_url` | text | NULLABLE | — | Derived from `video_media_id` → media_assets |
| `video_media_id` | uuid | NULLABLE | — | FK → media_assets(id) ON DELETE SET NULL |
| `size_guide_id` | uuid | NULLABLE | — | FK → size_guides(id) ON DELETE SET NULL |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Core sellable item. Belongs to one category, may belong to multiple collections.
**RLS:** Public read where `status = 'published'`. Admin full CRUD.

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

**Purpose:** Per-product size/variant system. Replaces global `PRODUCT_SIZES`.
**RLS:** Public read for published products. Admin full CRUD.

### Table: `collection_products` (junction)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `collection_id` | uuid | NOT NULL | — | FK → collections(id), ON DELETE CASCADE |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `sort_order` | integer | NOT NULL | `0` | Product display order within collection |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(collection_id, product_id) | | | | |

**Purpose:** Many-to-many relationship between collections and products.
**RLS:** Public read for published collections. Admin full CRUD.

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

**Purpose:** Global media pool. Same asset can be referenced by multiple products/collections/homepage.
**RLS:** Public read for public URLs. Admin full CRUD.

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

**Purpose:** Product-media assignments with role and ordering.
**RLS:** Public read for published products. Admin full CRUD.

### Table: `size_guides`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `name` | text | NOT NULL | — | Display name (e.g., "Trousers Size Guide") |
| `description` | text | NULLABLE | — | Optional explanatory text |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Named size guide templates. One guide can be assigned to multiple products.
**RLS:** Public read. Admin full CRUD.

### Table: `size_guide_rows`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `size_guide_id` | uuid | NOT NULL | — | FK → size_guides(id), ON DELETE CASCADE |
| `size_label` | text | NOT NULL | — | e.g., "S", "M", "32" |
| `waist_cm` | numeric | NULLABLE | — | |
| `hip_cm` | numeric | NULLABLE | — | |
| `length_cm` | numeric | NULLABLE | — | |
| `chest_cm` | numeric | NULLABLE | — | |
| `shoulder_cm` | numeric | NULLABLE | — | |
| `footwear_uk` | numeric | NULLABLE | — | |
| `footwear_eu` | numeric | NULLABLE | — | |
| `sort_order` | integer | NOT NULL | `0` | Display order |
| `created_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Individual measurement rows within a size guide. Columns are nullable — only relevant measurements are filled per guide type (e.g., trousers use waist/hip/length, footwear uses UK/EU).
**RLS:** Public read. Admin full CRUD.

### Table: `homepage_featured_products`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `sort_order` | integer | NOT NULL | `0` | |
| `is_active` | boolean | NOT NULL | `true` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(product_id) | | | | |

**Purpose:** Controls which products appear as "featured" on homepage.
**RLS:** Public read where `is_active`. Admin full CRUD.

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

**Purpose:** Controls hero rotation images on homepage.
**RLS:** Public read where `is_active`. Admin full CRUD.

### Table: `homepage_collection_feature`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `collection_id` | uuid | NOT NULL | — | FK → collections(id) |
| `heading` | text | NOT NULL | `'The first release.'` | |
| `statement` | text | NOT NULL | — | |
| `is_active` | boolean | NOT NULL | `true` | |
| `created_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Controls which collection is featured on homepage with editorial copy.
**RLS:** Public read where `is_active`. Admin full CRUD.

### Table: `cta_placements`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `slot` | text | NOT NULL | — | Predefined frontend placement slot |
| `label` | text | NOT NULL | — | Display text for CTA |
| `href` | text | NOT NULL | — | Destination URL or path |
| `enabled` | boolean | NOT NULL | `true` | Whether CTA renders in slot |
| `variant` | text | NOT NULL | `'primary'` | CHECK IN ('primary', 'secondary', 'ghost') |
| `sort_order` | integer | NOT NULL | `0` | Display order within slot |
| `starts_at` | timestamptz | NULLABLE | — | Optional scheduling start |
| `ends_at` | timestamptz | NULLABLE | — | Optional scheduling end |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Admin-managed CTA placements in predefined frontend positions.
**RLS:** Public read active (enabled, non-expired). Admin full CRUD.

### Indexes (Foundation)

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

-- Homepage
CREATE INDEX idx_hfp_active ON homepage_featured_products(is_active, sort_order);
CREATE INDEX idx_hhi_active ON homepage_hero_images(is_active, sort_order);
```

---

## C. FUTURE / PROVISIONAL MODEL

These tables are approved but NOT part of Sprint 0.15. They will be introduced closer to their implementation sprint.

### Table: `saved_products` (Sprint 0.19)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | uuid | NOT NULL | — | FK → auth.users(id), ON DELETE CASCADE |
| `product_id` | uuid | NOT NULL | — | FK → products(id), ON DELETE CASCADE |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| UNIQUE(user_id, product_id) | | | | |

**Purpose:** Persistent saved pieces per user.

### Table: `addresses` (Sprint 0.19)

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

**Purpose:** Customer delivery addresses.

### Table: `orders` (Sprint 0.18.1)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `order_number` | text | NOT NULL | — | UNIQUE, human-readable (HAM-YYYY-NNNN) |
| `user_id` | uuid | NULLABLE | — | FK → auth.users(id), NULL for guests |
| `source` | text | NOT NULL | `'website_guest'` | CHECK IN ('website_guest', 'hamatee') |
| `communication_channel` | text | NOT NULL | `'whatsapp'` | |
| `status` | text | NOT NULL | `'pending'` | CHECK IN ('pending', 'contacted', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled') |
| `customer_name` | text | NOT NULL | — | |
| `customer_phone` | text | NOT NULL | — | |
| `customer_email` | text | NULLABLE | — | |
| `delivery_region` | text | NOT NULL | — | |
| `delivery_city` | text | NOT NULL | — | |
| `delivery_area` | text | NULLABLE | — | |
| `delivery_landmark` | text | NULLABLE | — | |
| `delivery_gps` | text | NULLABLE | — | |
| `delivery_notes` | text | NULLABLE | — | |
| `customer_note` | text | NULLABLE | — | |
| `admin_notes` | text | NULLABLE | — | |
| `idempotency_key` | text | NULLABLE | — | UNIQUE — prevents duplicate submissions |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Request-based order records. Status tracks the operational flow.

### Table: `order_items` (Sprint 0.18.1)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `order_id` | uuid | NOT NULL | — | FK → orders(id), ON DELETE CASCADE |
| `product_id` | uuid | NULLABLE | — | FK → products(id), ON DELETE SET NULL — for reference only |
| `product_name_snapshot` | text | NOT NULL | — | Immutable at order time |
| `product_slug_snapshot` | text | NOT NULL | — | Immutable at order time |
| `variant_label` | text | NULLABLE | — | Immutable at order time (e.g., "32") |
| `variant_value` | text | NULLABLE | — | Immutable at order time (e.g., "32") |
| `quantity` | integer | NOT NULL | `1` | CHECK > 0 |
| `pricing_mode_snapshot` | text | NOT NULL | — | PRICE_ON_REQUEST or FIXED |
| `price_amount_snapshot` | integer | NULLABLE | — | In pence/pesewas, nullable for PRICE_ON_REQUEST |
| `currency` | text | NOT NULL | `'GHS'` | |
| `media_url_snapshot` | text | NULLABLE | — | Immutable at order time — primary image URL |
| `created_at` | timestamptz | NOT NULL | `now()` | |

**Purpose:** Individual items within an order. Snapshots mutable product data for historical accuracy.

### Sequence: `order_number_seq`

Used by the `create_order` RPC function to generate unique order numbers in the format `HAM-YYYY-NNNN`.

### Function: `create_order` (RPC)

Atomic function that validates product/variant, generates order number, creates order + order items in a single transaction. Accepts optional `p_user_id` and `p_source` parameters for authenticated orders. Used by `POST /api/orders`.

### Table: `hamatee_enrolments`

**Purpose:** Stores enrolment intent from guest orders with birthday. One enrolment per order maximum. Enrolment failure never rolls back the order.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `order_id` | uuid | NOT NULL | — | FK → orders(id), ON DELETE CASCADE, UNIQUE |
| `email` | text | NOT NULL | — | Lowercased, trimmed |
| `first_name` | text | NULLABLE | — | |
| `last_name` | text | NULLABLE | — | |
| `phone` | text | NULLABLE | — | |
| `date_of_birth` | date | NOT NULL | — | |
| `status` | text | NOT NULL | `'pending'` | CHECK: pending/invited/activated/existing_account/failed/cancelled |
| `activated_user_id` | uuid | NULLABLE | — | FK → auth.users(id), ON DELETE SET NULL |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |
| `activated_at` | timestamptz | NULLABLE | — | |
| `last_error` | text | NULLABLE | — | |

### Function: `create_hamatee_enrolment` (RPC)

SECURITY DEFINER function that inserts an enrolment record. Detects existing Auth users by email (sets `status = 'existing_account'`). Idempotent via `ON CONFLICT (order_id)`.

---

## Foreign Key Relationships

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
products ← size_guides (via size_guide_id, nullable)
products ← media_assets (via video_media_id, nullable, SET NULL)

collections ← collection_products.collection_id (CASCADE)
collections ← homepage_collection_feature.collection_id

media_assets ← product_media.media_asset_id (CASCADE)
media_assets ← homepage_hero_images.media_asset_id (CASCADE)

size_guides ← size_guide_rows.size_guide_id (CASCADE)
size_guides ← products.size_guide_id (SET NULL)

orders ← order_items.order_id (CASCADE)
orders ← hamatee_enrolments.order_id (CASCADE)
auth.users ← hamatee_enrolments.activated_user_id (SET NULL)
```

---

*This document is the canonical data-model reference. For the current implemented state, see section A. For the approved foundation, see section B. For future/provisional models, see section C.*
