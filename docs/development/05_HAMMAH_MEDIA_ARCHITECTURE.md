# 05 — HAMMAH Media Architecture

> **Purpose:** Freeze media strategy. Current state, approved direction, future/provisional plans.
>
> **Canonical source of truth:** This document, cross-referenced with `03_HAMMAH_DATA_MODEL.md` section B (media_assets, product_media).
>
> **Last verified against repo:** September 11, 2026 (updated Sprint 0.16)

---

## 1. Current Media State

### Pixieset Image Pool

- **Source:** `src/data/pixieset-collection-001.ts`
- **Pool size:** 160 unique images
- **Gallery ID:** 638827911
- **URL pattern:** `https://images.pixieset.com/638827911/{hash}-large.jpg`
- **Size variant:** large (web-optimised)

All 160 images are from Collection 001 photography. They are used across:
- Product media (56 images curated into 8 product groupings)
- Homepage editorial (hero, featured, craft, categories)
- Collections editorial
- Our Story editorial
- Auth page editorial
- Legacy page editorial

### Product-Media Assignments

Each of the 8 products has a curated set of 7 images from the 160-image pool:

| Product | Primary | Hover | Gallery | Details |
|---------|---------|-------|---------|---------|
| Design 01 | u(11) | u(37) | u(37)–u(41) | u(42)–u(43) |
| Design 02 | u(16) | u(44) | u(44)–u(48) | u(49)–u(50) |
| Design 03 | u(26) | u(51) | u(51)–u(55) | u(56)–u(57) |
| Design 04 | u(38) | u(58) | u(58)–u(62) | u(63)–u(64) |
| Design 05 | u(56) | u(65) | u(65)–u(69) | u(70)–u(71) |
| Design 06 | u(75) | u(72) | u(72)–u(76) | u(77)–u(78) |
| Design 07 | u(125) | u(79) | u(79)–u(83) | u(84)–u(85) |
| Design 08 | u(141) | u(86) | u(86)–u(90) | u(91)–u(92) |

These curated groupings MUST be preserved during migration to `product_media` junction records.

### Media Manifest

- **Source:** `src/data/media-manifest.ts`
- **Slots:** ~55 `MediaSlot` entries
- **Purpose:** Route-based media references for all page components
- **Structure:** `{ id, route, section, role, currentSrc, futureSrc, aspectRatio, intent, motionIntent, type }`
- **Consumed by:** Homepage sections, Shop, Collections, Our Story, Auth pages, Saved

The media manifest is a **current-state** concept. During migration, it dissolves:
- Product media → `product_media` junction
- Homepage images → `homepage_hero_images`, `homepage_featured_products`, `homepage_collection_feature`
- Editorial images → `media_assets` referenced by page components

### `/dev/media` Contact Sheet

- **Route:** `/dev/media` (315 lines, client component)
- **Purpose:** Visual contact sheet of all 160 Pixieset images
- **Features:** Grid, search, copy URL, copy reference, fullscreen preview
- **Auth:** None — no authentication
- **Navigation:** Not linked from public nav
- **Production:** Should be env-gated

### Inline Hardcoded Media

| Location | Data | Future |
|----------|------|--------|
| `home-editorial-hero.tsx` | 4 Pixieset URLs in `IMAGES` array | → `homepage_hero_images` |
| `home-world.tsx` | 3 category entries with media IDs | → `categories` table |
| `product-info-panel.tsx` | Hardcoded "Collection 001" text | → Dynamic from product data |
| `order-drawer.tsx` | Hardcoded "Collection 001" text | → Dynamic from product data |
| `product-card.tsx` | Hardcoded "Collection 001" label | → Dynamic from product data |

---

## 2. Approved Production Media Model

### Architecture

```
Admin uploads → Cloudflare R2 (storage) → Cloudflare CDN (delivery) → Public URL stored in media_assets.public_url
```

### Media Asset Entity (`media_assets`)

Each uploaded file gets one `media_assets` record. The same asset can be referenced by multiple products, collections, or homepage sections.

**Canonical identity is based on `storage_key`**, not public URL. Delivery URLs are derivable through a media helper/service.

### Product-Media Junction (`product_media`)

Each product has media assignments with:
- Reference to `media_assets`
- Role: `primary`, `hover`, `gallery`, `detail`
- Sort order (integer, for gallery ordering)

**Cardinality:**
- One product: 1 primary, 0–1 hover, 0–N gallery, 0–N detail
- One media asset: can belong to 0–N products (reuse potential)
- Gallery ordering: explicit integer sort order

### Media Roles

| Role | Purpose | Cardinality | Notes |
|------|---------|-------------|-------|
| `primary` | Main product image | Exactly 1 | Shown in cards, PDP hero |
| `hover` | Alternate view (desktop) | 0–1 | Shown on card hover (desktop) |
| `gallery` | Gallery images | 0–N | Ordered list in PDP gallery |
| `detail` | Close-up/detail shots | 0–N | Appended after gallery in PDP |

---

## 3. Media Roles in Detail

### Primary Image
- Displayed in product cards, PDP hero, order summary, related pieces
- Exactly one per product
- Should be the strongest single image of the product

### Hover Image
- Displayed on desktop card hover as alternate view
- Optional (0 or 1 per product)
- Typically a different angle or detail

### Gallery Images
- Displayed in PDP `ProductGallery` component
- Ordered by `sort_order`
- Combined with detail images for full gallery: `[...gallery, ...details]`

### Detail Images
- Close-up or construction detail shots
- Appended after gallery images in PDP
- Ordered by `sort_order`

---

## 4. Storage Key Convention

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

---

## 5. Delivery

- Cloudflare CDN provides automatic image optimisation (format, quality, resizing)
- Public URLs follow pattern: `https://media.slbyhammah.com/{storage_key}`
- No Supabase Storage for heavy media — Cloudflare handles all binary delivery
- `next/image` with Cloudflare CDN as remote pattern

---

## 6. Media Reuse

The same `media_assets` record can be referenced by multiple products. Examples:
- A campaign image used as both a collection hero and a homepage featured image
- A detail shot shared between related products
- An editorial image used across multiple pages

**Removing an asset from a product** deletes the `product_media` junction record, NOT the `media_assets` record. The asset remains available for reuse elsewhere.

---

## 7. Alt Text

- Required on all `media_assets`. Default empty string.
- Admin prompted to fill on upload.
- Used in `<img>` alt attributes across the site.
- Important for accessibility and SEO.

---

## 8. Archive/Delete Rules for Media

| Action | Rule |
|--------|------|
| Remove from product | Delete `product_media` junction only. Asset remains. |
| Archive asset | Soft-delete. Remove from pickers. Asset preserved. |
| Restore asset | Return to active state. |
| Hard delete | Only allowed if zero references (no product, collection, or homepage usage). |

---

## 9. Admin Media Library Requirements

### Upload
- Drag-and-drop zone
- File picker
- Batch upload for 360° sets
- Progress indicators
- File type validation (JPEG, PNG, WebP for images; MP4 for video)

### Management
- Grid view with thumbnails, type badges, alt text, upload date
- Search by alt text, file name
- Filter by type (image/video/360), upload date
- Detail view with preview, metadata, associated products/collections
- Edit alt text, caption

### Selection
- Product/Collection/Homepage editors include a media picker component
- Opens Media Library in modal/panel
- Filter by type, date, search
- Multi-select for galleries
- Single-select for primary/hero
- Returns asset IDs to calling form
- Supports upload-new from within the picker

---

## 10. Video — Future Direction

**Video is NOT currently functional.** The PDP has a Video tab that shows a placeholder message.

### Approved Direction

- Products may have an optional video reference (FK to `media_assets`)
- Single video per product (MVP)
- Poster image: either the product's primary image or a dedicated poster asset
- Storage: Cloudflare R2 (or Stream for transcoding)
- Max duration: 60 seconds
- Max file size: 100 MB
- Format: MP4 (H.264)

### Video Tab Visibility (Future)

PDP should conditionally render tabs:
- Photos only → show "Photos" tab only (no tab bar)
- Photos + Video → show "Photos | Video"
- Photos + Video + 360 → show "Photos | Video | 360°"

Do not show disabled/dead tabs without content.

---

## 11. 360° — Future/Provisional Direction

**360° is NOT currently functional.** The PDP has a 360° tab that shows a placeholder message.

### Approved Direction: Image Sequence

An image-sequence 360° viewer (not GLB/Three.js) where:
1. Photographer captures 24–36 frames around the product
2. Dragging horizontally advances/reverses through frames
3. All frames preloaded for instant response

### Data Model

Use `media_assets` with `set_id` grouping. A 360° set is a group of images with a known frame count and ordering. No dedicated 360 tables needed.

### Frame Requirements (Provisional)

| Attribute | Recommendation |
|-----------|---------------|
| Frame count | 24 frames (standard) or 36 (higher quality) |
| Naming/ordering | Integer `frame_order` on each asset in the set |
| Storage key | `products/{product_id}/360/{set_id}/frame-{NNN}.jpg` |
| Dimensions | Consistent across all frames (e.g., 1200×1200) |
| Preload | JavaScript preloads all frames before activating viewer |
| Touch | Horizontal drag maps to frame index |
| Mouse | Horizontal drag + scroll wheel |
| Keyboard | Left/Right arrows |
| Reduced motion | Static first frame, no auto-rotation |
| Fallback | If frame count incomplete, show static primary image |

### Important

**Do NOT make the canonical schema depend heavily on 360° assumptions.** The current schema includes `has_360`, `set_360_id`, `set_id`, and `frame_order` fields, which are sufficient. The 360° workflow is provisional until actual assets and workflow are approved.

---

## 12. Current → Future Migration

| Current Source | Future Source | Migration Notes |
|---------------|--------------|----------------|
| `pixieset-collection-001.ts` (160 URLs) | `media_assets` table | All 160 URLs become media_asset records |
| `products.ts` → `media` object | `product_media` junction | Curated groupings preserved as role assignments |
| `media-manifest.ts` (~55 slots) | Split: product → `product_media`; homepage → `homepage_*` tables; editorial → `media_assets` | Media manifest concept dissolves |
| `home-editorial-hero.tsx` (4 URLs) | `homepage_hero_images` table | 4 Pixieset URLs become media_asset references |
| `home-world.tsx` (3 categories) | `categories` table (cover_image_url) | Category data already exists |
| Public video assets (`/herovideo.mp4`) | Cloudflare CDN | Move to Cloudflare storage |
| `/dev/media` | Keep as dev tool | Add env-gating for production |

---

*This document is the canonical media architecture reference. For the data model, see `03_HAMMAH_DATA_MODEL.md`. For the architecture, see `02_HAMMAH_ARCHITECTURE.md`.*
