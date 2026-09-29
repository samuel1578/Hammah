# HAMMAH — Technical SEO Implementation Result (Phase 2)

Domain migration (Phase 1) is complete and was not revisited.
Canonical origin used everywhere: `https://www.hammah.store`

---

## A. SEO Architecture

- **metadataBase**: `https://www.hammah.store` (`src/app/layout.tsx`) — unchanged from Phase 1.
- **Title system**:
  - Root: `title.default = "SL by HAMMAH | Contemporary African Fashion"`, `title.template = "%s | SL by HAMMAH"`.
  - Children now return **only** their page-specific title (no brand suffix).
  - Homepage uses `title: { absolute: SITE_TITLE }` so the full string is never double-suffixed.
- **Canonical origin**: fixed production origin only. No `request.url`, no preview host, no legacy host.
- **Brand naming**: SEO metadata uses `SL by HAMMAH` (alternateName `HAMMAH`). Visible website copy was **not** mass-replaced.
- **SEO helpers**:
  - `src/lib/seo/site.ts` — origin/brand constants, `absoluteUrl()`, `publicPageMetadata()`, `noindexMetadata()`.
  - `src/components/seo/json-ld.tsx` — `JsonLd` renderer + `OrganizationJsonLd`, `WebSiteJsonLd`, `ProductJsonLd`, `CollectionPageJsonLd`, `BreadcrumbListJsonLd`.
  - No third-party SEO package added.

---

## B. Metadata Implemented

| Route | Title | Description | Canonical | OG | Robots |
|---|---|---|---|---|---|
| `/` | `SL by HAMMAH \| Contemporary African Fashion` (absolute) | Yes (root default) | `https://www.hammah.store/` | Yes (siteName/locale/url/image) | index |
| `/shop` | `Shop African Fashion` → `… \| SL by HAMMAH` | Yes | `https://www.hammah.store/shop` | Yes | index |
| `/collections` | `Collections` → `… \| SL by HAMMAH` | Yes | `https://www.hammah.store/collections` | Yes | index |
| `/collections/[slug]` | `collection.name` → `… \| SL by HAMMAH` | `collection.description` + fallback | `https://www.hammah.store/collections/{slug}` | Yes (global OG image) | index |
| `/product/[slug]` | `product.name` → `… \| SL by HAMMAH` | `product.description` + fallback | `https://www.hammah.store/product/{slug}` | Yes (primary product image, global OG fallback) | index |
| `/our-story` | `Our Story` | Yes | `https://www.hammah.store/our-story` | Yes | index |
| `/legacy` | `Hamatee` | Yes | `https://www.hammah.store/legacy` | Yes | index |
| `/delivery` | `Delivery` | Yes | `https://www.hammah.store/delivery` | Yes | index |
| `/returns` | `Returns & Refunds` | Yes | `https://www.hammah.store/returns` | Yes | index |
| `/size-guide` | `Size Guide` | Yes | `https://www.hammah.store/size-guide` | Yes | index |
| `/privacy` | `Privacy Policy` | Yes | `https://www.hammah.store/privacy` | Yes | index |
| `/terms` | `Terms & Conditions` | Yes | `https://www.hammah.store/terms` | Yes | index |

Root Open Graph: `siteName = SL by HAMMAH`, `type = website`, `locale = en_GB`, `url = https://www.hammah.store`, image `/images/hammah/global/logo/og-image.png` (1200×630, alt `SL by HAMMAH`), resolving to `https://www.hammah.store/images/hammah/global/logo/og-image.png`.
Root Twitter: `card = summary_large_image`, same image. No invented `@` handle.

---

## C. Dynamic Catalogue SEO

- **Product metadata**: `generateMetadata()` on `product/[slug]` — unique title, unique description, canonical, OG (title/description/url/image), Twitter.
- **Collection metadata**: `generateMetadata()` on `collections/[slug]` — same shape.
- **Image fallback**: primary product image → first gallery image → global OG image. Collections have no image field in the returned data, so they always use the global OG image. No media URLs invented.
- **Description fallback**:
  - Product: `Discover {name} by SL by HAMMAH — part of our contemporary African fashion collection.`
  - Collection: `Explore {name} from SL by HAMMAH — contemporary African fashion shaped through expressive African print and statement trousers.`
  - Never emits `undefined`/`null`/empty string.
- **Not-found**: `product/[slug]` and `collections/[slug]` return `robots: { index: false, follow: false }` when the record is missing. No fabricated metadata for missing products.
- **Query deduplication**: `getPublishedProductBySlug` and `getPublishedCollectionBySlug` are now wrapped in React `cache()`, so `generateMetadata()` and the page share one Supabase read per request.

---

## D. Index Control

**index**: `/`, `/shop`, `/collections`, `/collections/[slug]`, `/product/[slug]`, `/our-story`, `/legacy`, `/delivery`, `/returns`, `/size-guide`, `/privacy`, `/terms`

**noindex, nofollow**: `/admin/**` (pre-existing, preserved), `/account/**`, `/account/orders`, `/account/saved`, `/saved`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/track`, `/dev/**`
— plus missing product/collection lookups.

No route access was blocked; this is metadata-level only.

---

## E. Robots

- File created: `src/app/robots.ts` → `/robots.txt` (build route confirmed: `○ /robots.txt`).
- **Allowed**: `/` (everything not listed below).
- **Disallowed**: `/admin/`, `/account/`, `/dev/`.
- Auth/utility paths are intentionally **not** disallowed so their `noindex` meta remains crawlable.
- `sitemap: https://www.hammah.store/sitemap.xml`
- `host: https://www.hammah.store`

---

## F. Sitemap

- File created: `src/app/sitemap.ts` → `/sitemap.xml` (build route confirmed: `ƒ /sitemap.xml`).
- **Static URLs (10)**: `/`, `/shop`, `/collections`, `/our-story`, `/legacy`, `/delivery`, `/returns`, `/size-guide`, `/privacy`, `/terms`
- **Dynamic**: `/collections/{slug}` and `/product/{slug}` from Supabase.
- **Filtering**: `status = "published"` only (reuses the existing catalogue query pattern via two new functions, `getPublishedProductSitemapEntries` / `getPublishedCollectionSitemapEntries`).
- **Timestamps**: `lastModified` is only set from the real `updated_at` column on `products` / `collections` (confirmed present + trigger-backed in `supabase/migrations/00001_initial_schema.sql`). No `new Date()` per request. Static routes have **no** `lastModified`.
- **Priority**: home 1.0, shop 0.9, collections 0.8, products/collections-detail 0.8, our-story/legacy 0.6, support 0.4, legal 0.3.

---

## G. Structured Data

Implemented types:
- **Organization** — name `SL by HAMMAH`, alternateName `HAMMAH`, url, logo (real asset).
- **WebSite** — name, alternateName, url. **No SearchAction** (site has no search).
- **Product** — name, description, url, brand `SL by HAMMAH`, image, category (when present).
- **CollectionPage** — name, description, url, image, `isPartOf` WebSite.
- **BreadcrumbList** — Home → Collections → {Collection}; Home → Shop → Product (only real routes).

Organization + WebSite are rendered globally from `(public)/layout.tsx`.

**No fabricated** `offers`, `price`, `priceCurrency`, `lowPrice`, `highPrice`, `aggregateRating`, `review`, `sku`, `gtin`, `mpn`. Pricing is `PRICE_ON_REQUEST`; no commerce schema was invented.

---

## H. Semantic Fixes

- **EditorialBreak** (`src/components/editorial/editorial-break.tsx`): heading changed from `<p>` to a real heading; added `headingLevel` prop (default `2`). Styling unchanged. Used by `/shop`.
- **Our Story duplicate headings** (`our-story-client.tsx`): the three mobile duplicate `<h2>`/`TextReveal as="h2"` copies (Point of View, Craft, Sourcing) are now non-heading elements with identical classes — one semantic heading instance remains in the DOM. Responsive visual layout preserved. Also fixed the dangling `aria-labelledby="story-pov-heading"` / `"story-statement-heading"` references by adding the matching ids.
- **Our Story duplicate hero image**: two identical `<img>` (same src/alt, differing only by breakpoint visibility) merged into one; identical responsive rendering, no duplicate alt.
- **Track H1** (`track-client.tsx`): error state now renders `<h1 className="sr-only">Track your order.</h1>` — semantic fix with zero visual change. `/track` stays noindexed.
- **Duplicate `id="main-content"`**: `account/layout.tsx` inner `<main id="main-content">` → `<div>` (nested `<main>` was invalid HTML and duplicated the public layout id). Skip link still resolves to the single outer `<main>`.
- **Not done (out of scope)**: Admin H1→H3 skips.

---

## I. Files Created

```
src/app/robots.ts
src/app/sitemap.ts
src/app/manifest.ts
src/app/dev/layout.tsx
src/lib/seo/site.ts
src/components/seo/json-ld.tsx
src/app/(public)/login/layout.tsx
src/app/(public)/signup/layout.tsx
src/app/(public)/forgot-password/layout.tsx
src/app/(public)/reset-password/layout.tsx
src/app/(public)/our-story/our-story-client.tsx
src/app/(public)/legacy/legacy-client.tsx
src/app/(public)/delivery/delivery-client.tsx
src/app/(public)/returns/returns-client.tsx
src/app/(public)/size-guide/size-guide-client.tsx
src/app/(public)/privacy/privacy-client.tsx
src/app/(public)/terms/terms-client.tsx
src/app/(public)/track/track-client.tsx
```

Server-wrapper pattern: the existing client UI was moved verbatim into `*-client.tsx`; the new `page.tsx` only exports metadata and renders it. No visual changes.

## J. Files Modified

```
src/app/layout.tsx
src/app/(public)/layout.tsx
src/app/(public)/page.tsx
src/app/(public)/shop/page.tsx
src/app/(public)/collections/page.tsx
src/app/(public)/collections/[slug]/page.tsx
src/app/(public)/product/[slug]/page.tsx
src/app/(public)/our-story/page.tsx
src/app/(public)/legacy/page.tsx
src/app/(public)/delivery/page.tsx
src/app/(public)/returns/page.tsx
src/app/(public)/size-guide/page.tsx
src/app/(public)/privacy/page.tsx
src/app/(public)/terms/page.tsx
src/app/(public)/track/page.tsx
src/app/(public)/account/layout.tsx
src/app/(public)/account/orders/page.tsx
src/app/(public)/account/saved/page.tsx
src/app/(public)/saved/page.tsx
src/components/editorial/editorial-break.tsx
src/lib/catalogue/queries.ts
src/lib/catalogue/index.ts
```

---

## K. Validation

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — exit 0 |
| `npm run build` | **PASS** — exit 0; `○ /robots.txt`, `ƒ /sitemap.xml`, `○ /manifest.webmanifest` generated |
| `npm run lint` | **FAIL** — exit 1, **267 problems (114 errors, 153 warnings)** |

Lint detail:
- **New sprint errors: 0.** Targeted `npx eslint` over every file created/modified this sprint reports only pre-existing rule violations carried over from the moved client code (`@typescript-eslint/no-explicit-any` in `catalogue/queries.ts` and account pages, `react-hooks/immutability` in the Our Story parallax refs, `@next/next/no-img-element` warnings).
- **Baseline comparison**: errors unchanged at **114 → 114**; warnings **154 → 153**.
- Unrelated historical lint debt was not touched, per scope.

---

## L. Manual QA Required

```
[ ] Homepage title is correct and not double-suffixed
[ ] Product title is correct and not double-suffixed
[ ] Collection title is correct and not double-suffixed
[ ] View source shows canonical www.hammah.store URL
[ ] Product canonical points to correct product URL
[ ] Collection canonical points to correct collection URL
[ ] Product social metadata uses product image where available
[ ] https://www.hammah.store/robots.txt loads
[ ] https://www.hammah.store/sitemap.xml loads
[ ] Sitemap contains products
[ ] Sitemap contains collections
[ ] Sitemap excludes Admin/account/auth/dev routes
[ ] /login is noindex
[ ] /signup is noindex
[ ] /account is not an index target
[ ] /admin remains noindex
[ ] /dev/media is noindex
[ ] Homepage JSON-LD identifies SL by HAMMAH / HAMMAH
[ ] Product page contains Product JSON-LD
[ ] Product JSON-LD contains no fake price/offers/reviews
[ ] Our Story still looks and behaves exactly as before
[ ] Hamatee page animations/layout still work
```

---

## M. Remaining SEO Work (not implemented)

- **Phase 3** — Google Search Console + Bing Webmaster registration and verification.
- **Phase 4** — Product/content keyword strengthening.
- **Phase 5** — SEO measurement/analytics, if desired.

---

## Notes / findings outside scope

- `src/app/admin/login/page.tsx` still shows `admin@slbyhammah.com` as a placeholder (admin, unchanged).
- `src/components/home/home-scrollytelling-hero.tsx` and `home-hero.tsx` appear to be unused components; left untouched.
- `/collections/kaftans` and footwear links on `/collections` point at not-yet-published collections (404 until they exist).
- `manifest.ts` ships only the real 512×512 favicon; there is no 192×192 or maskable icon asset, so none was fabricated.
- `/returns`, `/privacy`, `/terms` are labelled "working draft" in their own body copy but remain indexable per scope.
