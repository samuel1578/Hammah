# HAMMAH Product Price + Hover Media Investigation

> Investigation only. No code, database, fixture, Admin, order, or JSON-LD changes were made.
> Live Supabase rows were read read-only where possible (anonymous/publishable key, GET only).

---

## 1. Executive Summary

### Fixed price not rendering

**Confirmed root cause: multiple layers — Public query + Mapper/type + Rendering.**

- **Admin persistence: PASS.** Admin saves `pricing_mode = "FIXED"` and `price_amount = 300` (raw integer, GHS, no unit conversion) to the `products` table. Confirmed in code and confirmed live.
- **Database schema: PASS.** The schema already fully supports fixed-price products. **No migration required.**
- **Public query: FAIL.** Every public catalogue query in `src/lib/catalogue/queries.ts` selects `pricing_mode` but **never selects `price_amount` or `currency`** (select lists at lines 11, 36, 60, 130, 178, 204).
- **Mapper/type: FAIL.** `mapProduct()` has no price mapping and `CatalogueProduct` / `Product` types have **no price field at all**, so the amount is dropped before any component sees it.
- **Rendering: FAIL.** `ProductPrice` accepts only `pricingMode` and renders `"Price on request"` for `PRICE_ON_REQUEST` and a literal em dash `"—"` for `FIXED`. There is no amount prop, no GHS formatting, and no fixed-price branch.
- **Legacy fixture dependency: none.** The storefront does not read pricing from `src/data/products.ts` (that file is dead code).

**Classification:** Public query + Mapper/type + Rendering (multiple layers). Live row for `design-mmrepa` is correct, so no "pending live DB confirmation" for this issue.

### Hover image not switching

**Confirmed root cause: Rendering / Interaction (component branch logic only). The data pipeline up to the card is PASS.**

- **Database media role: PASS.** `product_media.role` CHECK explicitly allows `'hover'`.
- **Admin assignment: PASS.** The Admin product editor has a dedicated Hover section and persists `role: "hover"`. A hover row exists live for `design-mmrepa`.
- **Public query: PASS.** All public queries select `product_media ( sort_order, role, media_asset:media_assets ( public_url ) )`.
- **Mapper: PASS.** `mapProduct()` derives `media.hover` and the public types declare `hover?: string`.
- **Card props: PASS.** `ProductCard` reads `product.media.hover`.
- **Desktop hover implementation: FAIL.** `product-card.tsx` chooses its render branch with `isMobileCard = mobile.length > 1`, i.e. based on **image count, not viewport/pointer**. Because adding a hover image (or any gallery image) makes `mobile.length > 1`, the card renders the **Swiper branch** and the desktop crossfade `<img>` pair is **never mounted**, so hovering changes React state but nothing is visible.

**Classification:** Rendering / Interaction/CSS (single layer). Not a fixture dependency, not a schema problem, not an Admin persistence problem.

---

## 2. Fixed Price Data Flow

| Stage | Status | Finding | File/Function |
|---|---|---|---|
| Admin form fields | **PASS** | State keys `pricingMode` (`"PRICE_ON_REQUEST" \| "FIXED"`), `priceAmount` (string). No currency state; input label is `Price (GHS)` and there is no currency input. Price input is `#price`, `type="number"`, not `required`. Toggling mode only calls `setPricingMode` — the typed amount is **preserved in state** but hidden, and **nulled in the DB on save** if mode is not FIXED. | `src/app/admin/products/new/page.tsx:33-35, 196-234`; `src/app/admin/products/[id]/page.tsx:111-113, 634-670` |
| Admin save payload | **PASS** | `price_amount: pricingMode === "FIXED" ? parseInt(priceAmount, 10) \|\| null : null`, `pricing_mode: pricingMode`. No ×100 conversion, no rounding, no currency field sent. (`parseInt("0")` → `0` → `null`, so a price of 0 becomes NULL; decimals are truncated.) | `new/page.tsx:83-91`; `[id]/page.tsx:258-270` |
| Admin API → Supabase | **PASS** | Create inserts `pricing_mode` and `price_amount` into `products`. Update allowlist contains `pricing_mode`, `price_amount` (`currency` is **not** in the allowlist and is never written by any code path → keeps DB default `GHS`). No server-side validation that FIXED has a non-null price. | `src/app/api/admin/products/route.ts:53-68`; `src/app/api/admin/products/[id]/route.ts:72-82, 102-107` |
| Database schema | **PASS** | `pricing_mode text NOT NULL DEFAULT 'PRICE_ON_REQUEST' CHECK (pricing_mode IN ('PRICE_ON_REQUEST','FIXED'))`; `price_amount integer` (nullable); `currency text NOT NULL DEFAULT 'GHS'`. Schema fully supports fixed price; no CHECK requires `price_amount` when mode = FIXED. Expected storage for "GHS 300": live row holds `300` (raw GHS as typed in Admin). Note: internal docs describe pence/pesewas (`docs/development/03_HAMMAH_DATA_MODEL.md:196`, `docs/development/04_HAMMAH_PRODUCT_AND_ADMIN_RULES.md:34`) while the Admin UI stores whole GHS — an unresolved unit convention, see §7. | `supabase/migrations/00001_initial_schema.sql:105-107` |
| Public catalogue query | **FAIL** | All six product queries select `pricing_mode` but omit `price_amount` and `currency`: `getPublishedProducts` (line 11), `getPublishedProductBySlug` (line 36), `getRelatedProducts` (line 60), `getCollectionProducts` (line 130), `getProductsByCategorySlug` (line 178), `getHomepageFeaturedProducts` (line 204). The amount never leaves the database. | `src/lib/catalogue/queries.ts` |
| Mapper / types | **FAIL** | `mapProduct()` returns `pricingMode: row.pricing_mode` and no price/currency keys. `CatalogueProduct` has no price field; legacy `Product` has no price field; all four `toLegacyProducts`/`toLegacyProduct` converters copy `pricingMode` only. The value is **never selected, never mapped, never typed** — it is dropped at the query boundary. | `src/lib/catalogue/queries.ts:225-271`; `src/lib/catalogue/types.ts:3-24`; `src/types/products.ts:16-30`; `src/app/(public)/shop/page.tsx:21-37`; `src/app/(public)/page.tsx:47-63`; `src/app/(public)/collections/[slug]/page.tsx:24-40`; `src/app/(public)/product/[slug]/page.tsx:14` |
| PDP rendering | **FAIL** | The only price component renders `{pricingMode === "PRICE_ON_REQUEST" ? "Price on request" : "—"}` — a FIXED product therefore displays `"—"`. No amount prop exists, no `GHS` formatting, and the UI deliberately shows a placeholder for non-request pricing. PDP uses it via the info panel. | `src/components/product/product-price.tsx:8-13`; `src/components/product/product-info-panel.tsx:50-53` |
| Product card rendering | **FAIL** | Every card calls `<ProductPrice pricingMode={product.pricingMode} />` with no amount, so Shop/Collection/Homepage cards show `"—"` for FIXED products. | `src/components/product/product-card.tsx:136` |
| Order snapshot | **PASS (schema) / WARNING (units)** | `create_order` reads the live product row and copies `pricing_mode`, `price_amount`, `currency` verbatim into `order_items` (`pricing_mode_snapshot`, `price_amount_snapshot`, `currency`). The API request carries no price fields; price is never taken from the client. The order **history page divides the snapshot by 100** (`price_amount_snapshot / 100`), which does not match how Admin stores the value (`300` stored raw would render as `GHS 3.00`). | `supabase/migrations/00009_enforce_size_required.sql:62-65, 160-174` (current effective definition; also `00003_orders.sql:200-214`); `src/app/api/orders/route.ts:15-31, 77`; `src/app/(public)/account/orders/[id]/page.tsx:115-119` |
| SEO schema | **FAIL (by design today)** | Product JSON-LD emits `@context, @type, name, description, url, brand, image, category` only. **No `Offer`, `price`, or `priceCurrency` is emitted under any condition** — there is not even a conditional block to extend. | `src/components/seo/json-ld.tsx:57-88`; call site `src/app/(public)/product/[slug]/page.tsx:102-108` |

---

## 3. Hover Image Data Flow

| Stage | Status | Finding | File/Function |
|---|---|---|---|
| Database media role | **PASS** | `product_media` table: `role text NOT NULL CHECK (role IN ('primary','hover','gallery','detail'))`, `sort_order integer NOT NULL DEFAULT 0`, `UNIQUE(product_id, media_asset_id)`. A dedicated `'hover'` role genuinely exists. No later migration (00002–00011) alters the CHECK. `media_assets` itself has no role column (flat asset library). RLS: SELECT for anon/authenticated when the product is published; admin INSERT/DELETE — **no UPDATE policy**. | `supabase/migrations/00001_initial_schema.sql:196-208, 483-507` |
| Admin assignment | **PASS** | The product editor has a "Hover" section ("Optional") with `Select/Change hover image` buttons calling `openPicker("hover")` (picker mode forced to `single` for `primary`/`hover`). On select it upserts `{ product_id, media_asset_id, role: pickerRole, sort_order }` with `role = "hover"` via the browser Supabase client. The awaited result is not error-checked, and this client path does not delete pre-existing hover rows (a server route that does enforce single-hover exists but is not called from this page). | `src/app/admin/products/[id]/page.tsx:79, 368-378, 380-395, 892-955`; unused-but-present `src/app/api/admin/products/[id]/media/route.ts:8, 94-114` |
| Public query | **PASS** | Every product query joins `product_media` selecting both `sort_order` and `role`. No role filter or ordering is applied server-side; filtering happens in JS in the mapper. Nothing drops the hover row. | `src/lib/catalogue/queries.ts:13-16, 38-41, 62-65, 132-135, 180-183, 206-209` |
| Mapper | **PASS** | `const hover = mediaRows.find((m) => m.role === "hover")?.media_asset?.public_url;` → exposed as `media.hover`. `CatalogueProduct.media.hover?: string` and `ProductMedia.hover?: string` both exist; `toLegacyProducts` copies `media` wholesale, so hover survives into card props. | `src/lib/catalogue/queries.ts:230, 258-264`; `src/lib/catalogue/types.ts:16-22`; `src/types/products.ts:7-14`; `src/app/(public)/shop/page.tsx:34` |
| Product card props | **PASS** | `getCardImages()` reads `product.media?.hover` (the optional `media` MediaSlot prop only supplies the primary `currentSrc` and is not passed by Shop/Collections/Homepage). It also builds `mobile = [primary, hover?, firstGallery?]` and returns `desktopHover`. | `src/components/product/product-card.tsx:16-38` |
| Desktop hover implementation | **FAIL** | Two-`<img>` crossfade logic exists (`showHover = hovered && desktopHover && desktopHover !== desktopPrimary`, `onMouseEnter/onMouseLeave/onFocus/onBlur`), **but** the crossfade block is gated by `{!isMobileCard ? (...) : (<Swiper ...>)}` where `isMobileCard = mobile.length > 1`. Any product with a hover image **or** ≥1 gallery image yields `mobile.length > 1`, so the Swiper branch renders on desktop and the crossfade `<img>`s are never mounted. Hovering only flips unused state; no visible switch. Secondary gate: `desktopHover === desktopPrimary` would force `showHover` false. The hover arrow (`group-hover:opacity-100 max-md:hidden`) still appears, giving the false impression that hover is active. | `src/components/product/product-card.tsx:63-64, 70-73, 77-125, 128` |
| Touch / mobile | **PASS (current design)** | Touch relies on the Swiper (`touchRatio={1}`, pagination bullets styled in `globals.css:314-335`). There are **no** `@media (hover: hover)` / `pointer: coarse` rules anywhere in `src`. Hover state is driven only by mouse/focus handlers; `max-md:hidden` is a breakpoint, not a pointer check. Whether `onMouseEnter` fires on touch tap is UNKNOWN (not runtime-tested). | `src/components/product/product-card.tsx:45-61, 104-125`; `src/app/globals.css:314-335` |

---

## 4. Design Mmrepa Trace

### Confirmed from accessible live data (read-only queries executed against the project Supabase project)

Pricing:

```json
{ "id": "c0000000-0000-0000-0000-000000000003", "slug": "design-mmrepa", "name": "Design Mmrepa",
  "pricing_mode": "FIXED", "price_amount": 300, "currency": "GHS",
  "status": "published", "availability": "AVAILABLE" }
```

So the application **does** expect `pricing_mode = FIXED`, `price = 300`, `currency = GHS`, and the row is correct.

Hover media (same product, `product_media` ordered by `sort_order`):

| role | sort_order | note |
|---|---|---|
| primary | 0 | present |
| **hover** | **1** | **present** (asset `148631f0-cfd6-4514-9b21-6f4d04d517fe`) |
| gallery ×4 | 0 | present |
| detail ×2 | 0 | present |

Additional live context: 8 published products total, **7 are `FIXED`** (amounts 297–300, currency `GHS`), and **8 `hover` media rows** exist across the project.

### Confirmed from code — where the data is lost

- **Price:** lost at the query boundary. `getPublishedProductBySlug` (`src/lib/catalogue/queries.ts:36`) does not select `price_amount`/`currency`; `mapProduct` (`:225`) has no price field; `ProductPrice` (`src/components/product/product-price.tsx:11`) renders `"—"` for `FIXED`. Net public result: `design-mmrepa` shows `Price on request`-style placeholder `"—"` on cards and PDP.
- **Hover:** reaches the card intact (`media.hover`), but `product-card.tsx:64/77` routes it into the Swiper branch, so desktop hover never switches images.

### Unknown without further inspection

- Nothing material remains unknown for this product; both rows were readable anonymously. Whether the deployed `create_order` function matches migration `00009` (deployment state) is UNKNOWN — code reads `supabase/migrations` only.

---

## 5. Source of Truth Assessment

| Concern | Achieves Admin → Supabase → automatic storefront rendering? | Why |
|---|---|---|
| **Price** | **No** | Admin and Supabase are correct and authoritative, but the storefront never selects/maps the amount and the price component cannot render one. The break is entirely in application code (query → type → component), not in data or fixtures. |
| **Hover media** | **Partially** | Admin → Supabase → query → mapper → card props is fully automatic and correct. The card component fails to *display* it on desktop hover, so the chain breaks at the final rendering step. |

- No public surface for pricing, hover images, media roles, or card output imports `src/data/products.ts` or `src/data/collections.ts` (repo-wide code search: **0 imports**; only Markdown docs mention them). Those fixtures still contain `pricingMode: "PRICE_ON_REQUEST"` and `hover:` URLs (`src/data/products.ts:21-90`) but are **orphaned runtime code**, not an active defect for these two issues.
- Adjacent (not part of these defects): homepage editorial sections do use `src/data/media-manifest.ts` fixture slots, and `ProductCard`'s optional `media` prop comes from that manifest — but no caller passes it on Shop/Collections, and it only affects the primary image, not price or hover.

**Therefore: no fixture update, no seed update, no per-product code, and no second setup step is or should be involved.** The required work is purely in query/mapper/type/component code.

---

## 6. Other Affected Surfaces

### Pricing (all use the same broken chain: query → mapper → `ProductPrice`)

| Surface | Cards/panel | Current fixed-price output | Evidence |
|---|---|---|---|
| Homepage `/` | `HomeFeaturedPieces` → `ProductCard` | `"—"` | `src/app/(public)/page.tsx:66, 74`; `src/components/home/home-featured.tsx:38` |
| Shop `/shop` | `ProductGrid` → `ProductCard` | `"—"` | `src/app/(public)/shop/page.tsx:40-50`; `src/components/product/product-grid.tsx:25` |
| Collections index `/collections` | No product cards (collection tiles only) | n/a | `src/app/(public)/collections/page.tsx:17-19` |
| Collection detail `/collections/[slug]` | `ProductCard` (2 call sites) | `"—"` | `src/app/(public)/collections/[slug]/collection-slug-client.tsx:89, 113` |
| PDP `/product/[slug]` | `ProductInfoPanel` → `ProductPrice` | `"—"` | `src/app/(public)/product/[slug]/page.tsx:85-88`; `src/components/product/product-info-panel.tsx:50-53` |
| Related pieces (PDP) | `ProductCard` | `"—"` | `src/components/product/related-pieces.tsx:34` |
| Account order history | separate renderer | shows `snapshot/100` | `src/app/(public)/account/orders/[id]/page.tsx:115-119` |

### Hover media

| Surface | Behaviour today |
|---|---|
| Homepage | `ProductCard` without `media` prop → hover read from `product.media.hover`, but Swiper branch is taken when hover/gallery exist → **no desktop switch** |
| Shop | Same component, same defect. (`mediaSlots` is never passed, so `media` is `undefined`; primary falls back to `product.media.primary` — correct.) |
| Collections index | No product cards → not applicable |
| Collection detail | Same `ProductCard` defect (both call sites) |
| PDP main gallery | Not a card; PDP gallery is separate and unaffected by this defect. PDP **related pieces** row uses `ProductCard` → same defect |
| Saved pieces (account) | `saved-piece-card.tsx` has a single `<img>` and **no hover logic at all** by design |

---

## 7. Order Impact

- **Order creation is already price-safe and client-independent:** `create_order` reads the product row server-side and snapshots `pricing_mode_snapshot`, `price_amount_snapshot`, `currency` (`supabase/migrations/00009_enforce_size_required.sql:62-65, 160-174`). The order API payload contains no price fields (`src/app/api/orders/route.ts:15-31`).
- **Inconsistency already exists, independent of the storefront fix:** Admin stores `price_amount` as whole GHS (`300`), while the order history UI renders `price_amount_snapshot / 100` (`src/app/(public)/account/orders/[id]/page.tsx:118`) and internal docs specify pence/pesewas. If the storefront starts displaying `300` as `GHS 300.00`, an order for the same product would read `GHS 3.00`.
- **Conclusion for the eventual fix:**
  - Storefront rendering of fixed price: **UI/query only** — no order schema change, no migration.
  - Order domain: **no `order_items` migration required**, but the display/units convention must be aligned (either render the snapshot without `/100`, or adopt minor units everywhere — this is a display decision, not a schema decision). No change to `create_order` is needed for correct snapshotting.
  - Whether any historical order rows exist could not be confirmed (anonymous read of `order_items` returned no visible rows under RLS) — **UNKNOWN**.

---

## 8. SEO Impact

- Current Product JSON-LD contains **no `Offer` at all** (`src/components/seo/json-ld.tsx:57-88`): only `name`, `description`, `url`, `brand`, optional `image`/`category`. Repo-wide search for `priceCurrency` / `"@type": "Offer"` in source returns zero hits.
- The PDP call site cannot pass price data because the component's prop interface has none (`json-ld.tsx:57-63`) and the page's product object has no price (query omits it).
- **Recommendation for the later fix (not implemented now):** emit `offers` (`@type: Offer`, `price`, `priceCurrency: "GHS"`, `availability`) **only when** `pricingMode === "FIXED"` **and** `priceAmount != null` **and** `currency` is present; continue omitting `offers` entirely for `PRICE_ON_REQUEST` products. Do not emit an Offer with a missing/null price.

---

## 9. Exact Fix Scope

Smallest implementation scope for **both** defects (proposal only — not implemented):

**Fixed price (query → type → component):**

1. `src/lib/catalogue/queries.ts` — add `price_amount, currency` to all six product select lists (lines 11, 36, 60, 130, 178, 204) and map them in `mapProduct()` (line 225 area).
2. `src/lib/catalogue/types.ts` — add `priceAmount: number | null` and `currency: string` to `CatalogueProduct`.
3. `src/types/products.ts` — add the same fields to `Product`.
4. `src/app/(public)/shop/page.tsx` (`toLegacyProducts`), `src/app/(public)/page.tsx` (`toLegacyProducts`), `src/app/(public)/collections/[slug]/page.tsx` (`toLegacyProducts`), `src/app/(public)/product/[slug]/page.tsx` (`toLegacyProduct`) — copy the new fields through (4 converters).
5. `src/components/product/product-price.tsx` — accept `priceAmount` + `currency` and render formatted `GHS 300.00` when mode is `FIXED` and an amount exists; keep `Price on request` otherwise; handle `FIXED` with null amount gracefully.
6. `src/components/product/product-card.tsx` (line 136) and `src/components/product/product-info-panel.tsx` (lines 50-53) — pass the new price props.

**Hover image (rendering only):**

7. `src/components/product/product-card.tsx` — stop deriving the desktop/mobile branch from `mobile.length > 1` (line 64/77). Desktop must render the crossfade whenever `desktopHover` exists, with the Swiper limited to touch/small-screen contexts (e.g. pointer/viewport-based condition), keeping `showHover` semantics and mouse-leave restore. No other file needs changes for hover.

**Explicit determination:**

- **No migration is needed.** Schema already supports fixed price and the `'hover'` media role.
- **No Admin changes are required.** Admin already persists `pricing_mode`, `price_amount` and `role = "hover"` correctly; live rows confirm both.
- **No fixture/seed/code-per-product changes.** `src/data/products.ts` and `src/data/collections.ts` are unused by the storefront.
- **No order-domain schema change.** Only the units/display convention decision described in §7.
- **Optional follow-up (separate, small):** conditional Product Offer JSON-LD per §8; consider adding `currency` to the Admin API allowlist only if currency ever becomes editable (currently correctly defaulted to `GHS`).

Desired end state after the fix, with zero per-product work:

- Admin sets fixed price → save → public cards/PDP automatically render the formatted GHS price.
- Admin assigns hover image → save → desktop product cards automatically switch primary → hover on hover and restore on mouse leave; products without a hover image keep the primary image.

---

## 10. Implementation Acceptance Criteria

- [ ] Fixed-price product automatically displays its saved price (e.g. `design-mmrepa` → `GHS 300.00`) on Shop cards, Collection cards, Homepage cards and the PDP
- [ ] Price-on-request product still displays the correct non-fixed-price state (`Price on request`)
- [ ] No fixture/code update required after Admin changes a price (Admin → Supabase → storefront only)
- [ ] Hover asset assigned in Admin automatically reaches product card (already true today; must remain true after the fix)
- [ ] Desktop hover switches primary → hover image
- [ ] Mouse leave restores primary image
- [ ] Product without hover image remains on primary image
- [ ] Touch/mobile is not broken by desktop hover behaviour (Swiper swipe still works on small/touch screens)
- [ ] Shop and Collection cards behave consistently (same component, same output)
- [ ] `FIXED` with a null amount does not crash and does not render a false zero price
- [ ] Order history price display uses the same unit convention as the storefront (no `GHS 3.00` vs `GHS 300.00` mismatch)

HAMMAH PRODUCT PRICE + HOVER MEDIA INVESTIGATION COMPLETE
