# HAMMAH Production Domain + SEO Investigation

**Status:** Investigation only — no files modified, no env/Supabase/Vercel changes, no SEO implemented.
**Date:** 2026-09-28
**Sources:** repository inspection + live probes of `hammah.store`, `www.hammah.store`, `slhammah.vercel.app`.

---

## A. Executive Summary

| Area | Readiness | Verdict |
|---|---|---|
| **Domain migration** | ~40% | Domain is attached and serving, but **no code or config references `hammah.store` anywhere** (0 matches in repo, 0 matches in built assets). Migration is entirely un-started. |
| **Supabase auth** | ~70% | Auth redirects are origin-dynamic (correct pattern). Residual risk is dashboard-side config plus one client-side `redirectTo`. |
| **Technical SEO** | ~15% | No `robots.txt`, no sitemap, no canonical, no structured data, no verification, no analytics, no per-page OG. Titles are double-suffixed on live production. |

**Biggest risks**

1. **`metadataBase` points at `https://slbyhammah.com` — a domain that does not resolve (DNS failure).** Every absolute URL the site emits (og:image, twitter:image) is broken. Verified live: `og:image = https://slbyhammah.com/images/hammah/global/logo/og-image.png`.
2. **WhatsApp order messages in the production bundle hardcode `https://slhammah.vercel.app`** — verified in live chunk `/_next/static/immutable/chunks/1e7bpfu1es763.js`.
3. **`slhammah.vercel.app` still serves the full site (HTTP 200), does not redirect, and has zero canonical tags** → guaranteed duplicate-indexing risk against `www.hammah.store`.
4. **No `robots.txt` / `sitemap.xml` on any host** (404 on all three hosts).
5. **Local `NEXT_PUBLIC_SITE_URL` is defined twice with conflicting values** (`.env.local:12` = vercel URL, `:14` = `http://localhost:3000`), and the last production build inlined `http://localhost:3000` into client chunks (`.next/static/chunks/3v0dqgabvh-8i.js`).
6. **Canonical host is `www`, not apex**: `https://hammah.store/` returns **308 → `https://www.hammah.store/`**. This decision must be enforced consistently across `metadataBase`, canonical tags, sitemap and Supabase.

---

## B. Domain References

| Location | Current Behaviour | Required Later |
|---|---|---|
| `src/app/layout.tsx:12` | `metadataBase: new URL("https://slbyhammah.com")` — **hardcoded, domain does not resolve** | `https://www.hammah.store` (or env-driven) |
| `.env.local:12` | `NEXT_PUBLIC_SITE_URL=https://slhammah.vercel.app` | `https://www.hammah.store` |
| `.env.local:14` | **Duplicate** `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (conflicting) | Remove duplicate; dev keeps localhost, prod = hammah |
| `.env.example:21` | `NEXT_PUBLIC_SITE_URL=http://localhost:3000` | Split into per-environment guidance |
| `src/lib/orders/whatsapp.ts:2,13` | **Only consumer** of `NEXT_PUBLIC_SITE_URL`; builds `${siteUrl}/product/${slug}` | Must resolve to `https://www.hammah.store` in Production |
| Live prod chunk `1e7bpfu1es763.js` | Inlines `"https://slhammah.vercel.app"` → WhatsApp message links to old domain | Rebuild after env change |
| Local build `.next/static/chunks/3v0dqgabvh-8i.js` | Inlines `"http://localhost:3000"` | Proves localhost **can** appear in production output |
| `next.config.ts:16` | `hostname: "media.slbyhammah.com"` in `images.remotePatterns` (inert — `next/image` is never imported) | Media host decision, separate from site domain |
| `src/app/admin/login/page.tsx:68` | `placeholder="admin@slbyhammah.com"` (cosmetic) | Optional |
| `src/app/auth/callback/route.ts:5,14,18` | Origin from `request.url` — **dynamic, correct** | No change needed |
| `src/app/(public)/forgot-password/page.tsx:27` | `redirectTo: ${window.location.origin}/auth/callback?next=/reset-password` — **dynamic, correct** | Needs `www.hammah.store` in Supabase allow-list |
| `src/middleware.ts:51,61,72` | `new URL(path, request.url)` — path-only, correct | No change |
| `VERCEL_URL` | **0 matches repo-wide** | N/A |
| `localhost` / `127.0.0.1` in `src/` | **0 matches** | N/A |
| `slhammah.vercel.app` in `src/` | **0 matches** (only in `.env.local`) | N/A |
| `hammah.store` anywhere in repo | **0 matches** | N/A |

**Generated vs hardcoded**

- Auth redirects → **dynamic** (correct pattern).
- `metadataBase` → **hardcoded** (incorrect).
- WhatsApp site URL → **env, but bundler-const-folded at build time**. Turbopack resolves the module-level `const SITE_URL_KEY = "NEXT_PUBLIC_SITE_URL"` and inlines the literal value, so it is baked into the bundle, not read at runtime.

**Exact env variable names in play**

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_HAMMAH_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `CLOUDFLARE_R2_PUBLIC_BASE_URL`, `CLOUDFLARE_R2_ENDPOINT`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_BUCKET`.

**Area-by-area answers**

- **Product URLs** — built at runtime from `NEXT_PUBLIC_SITE_URL` (`src/lib/orders/whatsapp.ts:52-57`). Currently resolves to the old Vercel host in production.
- **WhatsApp order messages** — same source; product link is the only absolute URL in the message.
- **Auth callbacks** — `request.url` origin (`src/app/auth/callback/route.ts:5`), no env var.
- **Password-reset links** — `window.location.origin` (`src/app/(public)/forgot-password/page.tsx:27`), no env var.
- **Signup / email verification** — **no `emailRedirectTo` at all** (`src/app/(public)/signup/page.tsx:93-104`); target is entirely Supabase Dashboard controlled.
- **Canonical URLs** — none exist.
- **Open Graph URLs** — root only, `src/app/layout.tsx:16-29`, absolute URL produced from the broken `metadataBase`.
- **Sitemap URLs** — no sitemap exists.
- **Structured data** — none exists.
- **API-generated absolute URLs** — none found; API routes return JSON only.

---

## C. Vercel

**Config files:** none. No `vercel.json`, no `.vercel/` (gitignored), no `@vercel/analytics`, no `@vercel/speed-insights`. `next.config.ts` has **no `redirects` / `rewrites` / `headers`**.

**Middleware hostname use:** none — `src/middleware.ts` matcher is `["/admin/:path*"]` only, and uses `request.url` for relative paths.

**Application logic using `VERCEL_URL`:** none (0 matches).

**Changes eventually required**

### Production

- Set `NEXT_PUBLIC_SITE_URL = https://www.hammah.store` (exactly one definition).
- Keep `NEXT_PUBLIC_SUPABASE_URL` / publishable + secret keys scoped to Production.
- Confirm `CLOUDFLARE_R2_PUBLIC_BASE_URL` for Production (locally it is an `r2.dev` dev domain, not `media.slbyhammah.com`).
- Add redirect rule: `slhammah.vercel.app` → `https://www.hammah.store/:path*` (308). **Currently absent.**

### Preview

- Keep `NEXT_PUBLIC_SITE_URL` **unset or set to the preview host**, because `forgot-password` uses `window.location.origin` — that origin must be in Supabase's Redirect allow-list or reset emails break on previews.
- Preview hosts should be `noindex` (they currently are not).

### Development

- `NEXT_PUBLIC_SITE_URL = http://localhost:3000`.
- Remove the duplicate/conflicting entry in `.env.local`.

### Domain

- `hammah.store` → 308 → `www.hammah.store` is already enforced at the platform level. Canonical host = **`https://www.hammah.store`**. Every absolute URL source must match this exactly.

---

## D. Supabase Auth

| Item | Value | File |
|---|---|---|
| Callback route | `/auth/callback` | `src/app/auth/callback/route.ts` (only handler under `src/app/auth/`) |
| Password reset request | `/forgot-password` → email → `/auth/callback?next=/reset-password` → `/reset-password` | `src/app/(public)/forgot-password/page.tsx:26-28` |
| Password reset form | `/reset-password` | `src/app/(public)/reset-password/page.tsx` |
| Signup verification redirect | **Not set in code** — `emailRedirectTo` absent (0 matches repo-wide) | `src/app/(public)/signup/page.tsx:93-104` |

**How redirect URLs are constructed**

- `src/app/auth/callback/route.ts:5` → `const { origin } = new URL(request.url);`
- `:14` → `NextResponse.redirect(\`${origin}${safeNext}\`)` with `next` sanitised (`startsWith("/") && !startsWith("//")`).
- `:18` → `NextResponse.redirect(\`${origin}/login?error=auth_callback\`)`.
- No env var, no hardcoded host, no open-redirect hole.
- `src/app/(public)/forgot-password/page.tsx:27` → `redirectTo: \`${window.location.origin}/auth/callback?next=/reset-password\``. No env var, no hardcoded host.
- `src/middleware.ts:51,61,72` → `new URL(path, request.url)`, path-only.
- `NEXT_PUBLIC_SITE_URL` is **never** used for auth.

**Answers**

- **Rely on `NEXT_PUBLIC_SITE_URL`?** No — auth uses request/window origin only.
- **Use request origin dynamically?** Yes, in both the callback route and the reset request.
- **Can localhost appear in production emails?** Not from code. It can only appear if the Supabase Dashboard **Site URL** is still `http://localhost:3000`, which `.env.example:21`, `docs/development/06_HAMMAH_SECURITY_AND_ENGINEERING_RULES.md:167`, `SPRINT_LOG.md:529` and `HAMMAH_SPRINT_REPORT.md:2405` all prescribe. Signup verification is entirely dashboard-controlled, so this is the primary exposure.
- **Is the Vercel deployment URL still referenced?** Yes — in `.env.local:12` (baked into the WhatsApp product link), and implicitly as the origin users are currently on when clicking reset links, so reset links currently resolve to `slhammah.vercel.app/auth/callback`.

**Supabase Dashboard settings that will need updating later (do not change now)**

1. **Site URL** → `https://www.hammah.store`
2. **Redirect URLs allow-list** →
   - `https://www.hammah.store/*`
   - `https://www.hammah.store/auth/callback`
   - `http://localhost:3000/*` (development)
   - `https://*.vercel.app/*` (previews, if previews must work)
3. Confirm both email templates (signup verification, password reset) inherit the new Site URL.

**No route handler sends email or creates a user.** The only auth email call in the repo is `resetPasswordForEmail` in `forgot-password/page.tsx`. No `supabase.auth.admin.*` calls exist.

---

## E. Technical SEO Status

| SEO Feature | Status | File | Notes |
|---|---|---|---|
| `metadataBase` | **Incorrect** | `src/app/layout.tsx:12` | `https://slbyhammah.com` — domain does not resolve |
| Global title | Present | `src/app/layout.tsx:8` | `SL by Hammah` |
| Title template | Present (buggy) | `src/app/layout.tsx:9` | `%s \| SL by Hammah` — children also append the suffix → **double suffix live** |
| Meta description | Present (thin) | `src/app/layout.tsx:11` | Same generic string on every page without its own metadata |
| Canonical URLs | **Missing** | — | 0 matches for `alternates`/`canonical` repo-wide; 0 `<link rel="canonical">` live |
| Per-page metadata | **Incomplete** | — | Only 9 metadata exports total |
| Product metadata | **Incomplete** | `src/app/(public)/product/[slug]/page.tsx:29-37` | title + description only; no OG, no canonical, no image |
| Collection metadata | **Incomplete** | `src/app/(public)/collections/[slug]/page.tsx:31-39` | title + description only |
| Our Story metadata | **Missing** | `src/app/(public)/our-story/page.tsx` | `"use client"` → cannot export metadata |
| Legacy / Hamatee metadata | **Missing** | `src/app/(public)/legacy/page.tsx` | `"use client"` |
| Shop metadata | **Missing** | `src/app/(public)/shop/page.tsx` | Server Component — could export, does not |
| `robots` directive | **Partial** | `src/app/admin/layout.tsx:6` | Only `/admin/**` is `noindex, nofollow` |
| `robots.txt` | **Missing** | — | No `src/app/robots.ts`, no `public/robots.txt`; **404 live on all hosts** |
| `sitemap.xml` | **Missing** | — | No `src/app/sitemap.ts`, no `public/sitemap.xml`; **404 live on all hosts** |
| `manifest` | **Missing** | — | No `manifest.webmanifest` / `src/app/manifest.*` |
| Open Graph | Present globally, **Incorrect** | `src/app/layout.tsx:16-29` | Applies to every page unchanged; og:image resolves to a dead domain; no `og:url`; no `og:type: product` |
| Twitter cards | Present globally, **Incomplete** | `src/app/layout.tsx:30-35` | Same image/domain problem |
| Favicon / app icons | Partial | `src/app/layout.tsx:13-15` | `public/images/hammah/global/logo/favicon.png` exists; no `favicon.ico`, no `apple-touch-icon`, no `icon.tsx` |
| OG images | Present (site-level only) | `public/images/hammah/global/logo/og-image.png` | Exists, 1200×630; not used per-page |
| Structured data | **Missing** | — | 0 JSON-LD / schema.org hits |
| Verification | **Missing** | — | No `google-site-verification`, no `msvalidate.01`, no verification files in `public/` |
| Analytics | **Missing** | — | No Vercel Analytics, GA, GTM, `gtag`, `dataLayer`, `next/script` |
| Indexing | **Incorrect** | — | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/track`, `/saved`, `/dev/media` are all `index, follow` |

**Complete list of metadata exports in `src/app`**

| File:line | Export |
|---|---|
| `src/app/layout.tsx:6` | `export const metadata` (root) |
| `src/app/admin/layout.tsx:4` | `export const metadata` (`robots: { index: false, follow: false }` at `:6`) |
| `src/app/(public)/saved/page.tsx:8` | `export const metadata` (title only) |
| `src/app/(public)/account/layout.tsx:7` | `export const metadata` (title only) |
| `src/app/(public)/account/orders/page.tsx:5` | `export const metadata` (title only) |
| `src/app/(public)/account/saved/page.tsx:6` | `export const metadata` (title only) |
| `src/app/(public)/account/orders/[id]/page.tsx:5` | `generateMetadata` (title only) |
| `src/app/(public)/collections/[slug]/page.tsx:31` | `generateMetadata` (title + description) |
| `src/app/(public)/product/[slug]/page.tsx:29` | `generateMetadata` (title + description) |

**Live-confirmed title bug**

```
<title>Blue and White design | SL by Hammah | SL by Hammah</title>
<title>Collection 001 | SL by Hammah | SL by Hammah</title>
```

---

## F. Page SEO Audit

| Route | Title | Description | H1 | Canonical | OG | Indexability | Major gap |
|---|---|---|---|---|---|---|---|
| `/` | `SL by Hammah` (generic) | generic | `SL BY HAMMAH` (1, semantic) ✅ | ❌ | root only, broken image | index | No brand-specific title/description; no Organization/WebSite schema |
| `/shop` | **generic root** | generic | `Shop` (1) ✅ | ❌ | root only | index | No metadata export despite being a Server Component; `EditorialBreak` renders its heading as `<p>` → h1→h3 skip |
| `/collections` | **generic root** | generic | `The current release and what comes next.` (1) ✅ | ❌ | root only | index | No metadata export (Server Component) |
| `/collections/[slug]` | `X \| SL by Hammah \| SL by Hammah` ⚠️ | `collection.description` ✅ | `collection.name` (1) ✅ | ❌ | root only | index | Double title suffix; no OG / canonical / OG image |
| `/product/[slug]` | `X \| SL by Hammah \| SL by Hammah` ⚠️ | `product.description` (no fallback) | `product.name` (1) ✅ | ❌ | root only | index | Double suffix; no `og:image`, no `og:type: product`, no canonical |
| `/our-story` | **generic root** | generic | `Our Story` (1) ✅ | ❌ | root only | index | `"use client"` page → cannot export metadata; **duplicate h2 pairs** (`:298/:331`, `:465/:537`, `:599/:638`) rendered twice, CSS-hidden |
| `/legacy` | **generic root** | generic | `Stay close to what you love.` (1) ✅ | ❌ | root only | index | `"use client"` page → no metadata; H1 is not brand/topic descriptive |
| `/login` | generic | generic | `Welcome back.` | ❌ | root | **index** ⚠️ | Should be `noindex` |
| `/signup` | generic | generic | `Become a Hamatee.` | ❌ | root | **index** ⚠️ | Should be `noindex` |
| `/forgot-password` | generic | generic | `Forgot your password?` | ❌ | root | **index** ⚠️ | Should be `noindex` |
| `/reset-password` | generic | generic | `New password.` | ❌ | root | **index** ⚠️ | Should be `noindex` |
| `/track` | generic | generic | `Track your order.` (error state = **0 H1**) | ❌ | root | **index** ⚠️ | Demo text "Frontend demonstration only" is indexable |
| `/saved` | `Saved Pieces \| SL by Hammah \| SL by Hammah` ⚠️ | **none** | `Saved` | ❌ | root | **index** ⚠️ | Should be `noindex` |
| `/account/**` | per-layout (double-suffixed) | none | dynamic | ❌ | root | 307 → `/login` for anonymous ✅ | Not crawlable content; metadata is dead weight |
| `/admin/**` | `Admin \| SL by Hammah` | none | 1 per page ✅ | ❌ | root | **`noindex, nofollow`** ✅ | Correct |
| `/dev/media` | generic | generic | 1 ✅ | ❌ | root | **index** ⚠️ | Internal tool, no `noindex`, not middleware-covered |

**Heading structure**

- Every public page renders **exactly one H1**. Multi-H1 sources (`/track`, `/signup`, `/forgot-password`, `/reset-password`) are mutually exclusive state branches. ✅
- No visual headings implemented as `div`/`span` — `TextReveal` emits real elements (`src/components/motion/text-reveal.tsx:45`). ✅
- Issues:
  - h1 → footer-`<h3>` skip on `/shop`, `/saved`, `/account`, `/account/orders` (no intervening h2).
  - `EditorialBreak` heading rendered as `<p>` (`src/components/editorial/editorial-break.tsx:57-62`).
  - `/track` error state has zero H1 (`src/app/(public)/track/page.tsx:166-191`).
  - `/our-story` duplicates h2 + section copy for mobile/desktop (`:298/:331`, `:465/:537`, `:599/:638`) — crawlers see duplicated headings.
  - Footer injects an `<h3>` on every public page (`src/components/layout/site-footer.tsx:23`).
  - Duplicate `id="main-content"` (`(public)/layout.tsx:14` and `account/layout.tsx:46`).
  - Admin h1→h3 skips: `admin/size-guides/page.tsx:64→97`, `admin/collections/new/page.tsx:70→131`, `admin/collections/[id]/page.tsx:309→388`.

**Distinct public H1 texts**

| H1 | Where |
|---|---|
| `SL BY HAMMAH` | `src/components/home/home-editorial-hero.tsx:113-121` |
| `Shop` | `shop-client.tsx:34` → `collection-hero.tsx:134` |
| `The current release` / `and what comes next.` | `collections-client.tsx:29-36` |
| `{collection.name}` | `collection-slug-client.tsx:25-26` |
| `{product.name}` | `product-info-panel.tsx:38-40` |
| `Our Story` | `our-story/page.tsx:94-103` |
| `Stay close to what you love.` | `legacy/page.tsx:37-41` |
| `Welcome back.` | `login/page.tsx:111-113` |
| `Become a Hamatee.` | `signup/page.tsx:291-298` |
| `Forgot your password?` | `forgot-password/page.tsx:113-120` |
| `New password.` | `reset-password/page.tsx:156-163` |
| `Track your order.` | `track/page.tsx:65-72` |
| `Saved` | `saved/page.tsx:25-30` |
| `Terms & Conditions` / `Privacy Policy` / `Returns & Refunds` | `terms:30`, `privacy:30`, `returns:16` |
| `Delivery, arranged / around the order.` | `delivery/page.tsx:24-30` |
| `Size Guide` | `size-guide/page.tsx:48-51` |
| `Product not found` | `product/[slug]/not-found.tsx:9-10` |
| `Collection 001 — Media Contact Sheet` | `dev/media/page.tsx:108-110` |

---

## G. Product + Collection SEO

**Capability:** both routes already run `generateMetadata()` in **async Server Components** with the full record in hand.

- `src/app/(public)/product/[slug]/page.tsx:29-37` (product fetched at `:42-45`)
- `src/app/(public)/collections/[slug]/page.tsx:31-39` (collection fetched at `:44-47`)

**Gaps**

- No `alternates.canonical`, no `openGraph` (no `og:image`, no `og:type: product`), no `twitter` override, no `robots`.
- Product description fallback missing — `description: product.description` can be `undefined`.
- Product 404 page (`src/app/(public)/product/[slug]/not-found.tsx`) exports no metadata → shows the homepage title.
- **No SEO fields exist on the data model.** `src/types/products.ts:16-30` and `src/lib/catalogue/types.ts:3-32` have no `metaTitle`, `metaDescription`, `ogImage`, `seo`. `src/types/content.ts:22` has an unused `metaDescription` (only consumer `src/data/site-content.ts` is never imported anywhere).
- **DB has no SEO columns either** (`supabase/migrations/00001_initial_schema.sql`).
- `generateMetadata` and `page` each issue an **uncached** Supabase query → double DB read per request.

**Data available server-side today**

`name`, `description`, `slug`, `media` (image URLs), `availability`, `collection`, `category`, `variants`, `pricingMode`.
Not selected by public queries: `price_amount`, `currency`.

**Content model status**

- 8 products in DB, all `collection-001` / `trousers`, all `PRICE_ON_REQUEST` + `AVAILABLE` + `published`.
- 3 collections: `collection-001`, `kaftans`, `footwear`.
- All products currently share one placeholder-style description (`TEMP_DESCRIPTION`, `src/data/products.ts:7-8`).
- Fixtures in `src/data/products.ts`, `collections.ts`, `categories.ts` are **orphaned** — every public page reads Supabase via `src/lib/catalogue/queries.ts`.
- All catalogue queries correctly filter `.eq("status", "published")` (`queries.ts:19,43,66,82,103,137,153,182,210`) → **draft/archived rows cannot leak into pages or a future sitemap.**
- Note: TS `Collection.visibility` exists (`products.ts:41`) but is **dropped at query level** (`queries.ts:81` selects only `id, slug, name, description, sort_order`) and is never read anywhere.

---

## H. Structured Data

**Exists: nothing.** Zero hits repo-wide for `application/ld+json`, `schema.org`, `@type`, `Organization`, `WebSite`, `Product`, `BreadcrumbList`, `CollectionPage`, `offers`, `aggregateRating`, or any `<script>` tag in `src/`.

**What the data model can legitimately support**

| Schema | Supportable? | Basis |
|---|---|---|
| `Organization` | ✅ | Static brand info + logo (`public/images/hammah/global/logo/logo-primary-*.png`) |
| `WebSite` | ✅ | Static |
| `Product` — `name` | ✅ | `products.name` |
| `Product` — `description` | ✅ | `products.description` |
| `Product` — `image` | ✅ | `media_assets.public_url` via `mapProduct` (`src/lib/catalogue/queries.ts:220-266`) |
| `Product` — `url` | ✅ | `${origin}/product/${slug}` |
| `Product` — `brand` | ⚠️ constant only | **No `brand` field exists** (0 matches for `brand|vendor|manufacturer`) — must be a hard-coded brand node |
| `Product` — `availability` | ✅ | `availability` enum `AVAILABLE / COMING_SOON / SOLD_OUT` |
| `Product` — `price` / `offers` | ❌ **Do not emit** | `pricing_mode = 'PRICE_ON_REQUEST'` for all products; UI renders "Price on request"; `price_amount` never selected by public queries. **No valid `offers` schema can be produced.** |
| `CollectionPage` / `BreadcrumbList` | ✅ | Derivable from route + collection name (breadcrumbs do not exist in UI yet) |

---

## I. Search Engine Setup

| Item | State |
|---|---|
| Google Search Console | **Not configured** — no `google-site-verification` meta, no verification file in `public/` |
| Bing Webmaster Tools | **Not configured** — no `msvalidate.01`, no verification file |
| `robots.txt` | **Absent (404 on all hosts)** — nothing to submit |
| `sitemap.xml` | **Absent (404 on all hosts)** — nothing to submit |
| Sitemap submission readiness | ❌ Blocked until Phase 2 |
| Analytics to measure SEO | ❌ None installed |

---

## J. AI Search Discoverability

**No ranking guarantees are claimed or implied.** This section covers technical discoverability/attribution foundations only.

| Foundation | State |
|---|---|
| Stable production URL | ⚠️ `www.hammah.store` live, but apex→www 308 and old Vercel host still live |
| Indexable public pages | ✅ Most public pages render SSR HTML with real text |
| Descriptive titles | ❌ Generic or double-suffixed on nearly every page |
| Clear brand/entity info | ⚠️ Brand text present; no `Organization` schema to make the entity explicit |
| Crawlable internal links | ⚠️ Partial (see §N/internal linking notes below) |
| `robots.txt` | ❌ Missing |
| `sitemap.xml` | ❌ Missing |
| Canonical URLs | ❌ Missing entirely |
| Structured data | ❌ Missing entirely |
| Product/collection content | ⚠️ Thin — 8 products share one placeholder description |
| Attribution (OG / domain correctness) | ❌ og:image points at a non-resolving domain |
| Stable host | ⚠️ Two live hosts serve identical content with no canonical |

No experimental AI-search files or crawler directives were found — and none should be added during this investigation phase.

---

## K. Brand / Keyword Coverage

Based **only on actual live rendered page text** (case-insensitive occurrence counts):

| Page | African | trouser | print | Ghana | Accra | HAMMAH | SL by |
|---|---|---|---|---|---|---|---|
| `/` | 4 | 6 | 2 | **0** | 1 | 14 | 6 |
| `/shop` | 3 | 1 | 1 | 0 | 0 | 5 | 2 |
| `/collections` | 4 | 2 | 2 | 0 | 0 | 8 | 2 |
| `/our-story` | 2 | 3 | 4 | 0 | 0 | 18 | 8 |
| `/legacy` | 1 | 0 | 0 | 0 | 0 | 13 | 2 |
| `/product/[slug]` | 1 | 2 | 0 | 0 | 0 | 6 | 3 |

**Per-term verdict**

| Term | Verdict | Basis (actual content only) |
|---|---|---|
| **HAMMAH** | **Strong** | Dominant brand token everywhere; homepage H1 is `SL BY HAMMAH` |
| **SL by HAMMAH** | **Strong** | Root title, OG/Twitter, footer `© 2026 SL by Hammah`, nav; literal all-caps `SL BY HAMMAH` only in homepage H1 and Our Story marquee |
| **African trousers** | **Partial** | Homepage copy: "Contemporary trousers and elevated essentials"; "Eight African-print trouser designs". Exact two-word phrase not present as a unit |
| **African print trousers** | **Partial** | One exact phrase site-wide: `/collections` — "Eight African-print trouser designs form the first orderable Hammah collection." |
| **African fashion** | **Partial (meta only)** | Appears only in the root meta description (`src/app/layout.tsx:11`), not in visible page body copy |
| **African print fashion** | **Weak** | "print" appears 1–4×/page but never in the phrase "African print fashion" |
| **HAMMAH trousers** | **Partial** | Trousers content exists and is linked, but not in the exact combined phrase |
| **African fashion Ghana** | **Absent** | "Ghana" = **0 occurrences on every page inspected**; "Accra" appears once (homepage FAQ) |
| **men's / women's African trousers** | **Absent** | No gendered product language anywhere |
| **African print clothing** | **Weak** | Implied by Kaftans/footwear copy but never stated |
| **African fashion Ghana** positioning | **Absent from copy** | Not represented in current site content |

**Brand representation today (three-plus spellings coexist)**

| Form | Where |
|---|---|
| `SL by Hammah` (title case) | Metadata, most visible copy, footer, logo alt |
| `SL BY HAMMAH` (all caps) | Homepage H1, Our Story marquee |
| `HAMMAH` (all caps, sentence copy) | Legacy page, `home-legacy.tsx`, signup, WhatsApp message template (`whatsapp.ts:38 "Hello HAMMAH,"`) |
| `slbyhammah` | `metadataBase`, `media.slbyhammah.com` image host, `admin@slbyhammah.com` placeholder |
| `slhammah` | Actual deployment host `.env.local:12` |
| `sl-by-hammah` | `package.json:2` name |

Zero occurrences of `SL HAMMAH`. Do **not** mass-replace — decide coexistence rules for branded search later.

---

## L. Exact Fix Scope

> **Not implemented. Phases below are a proposed ordered scope only.**

### Phase 1 — Production Domain Migration

1. Set `NEXT_PUBLIC_SITE_URL = https://www.hammah.store` in Vercel **Production** (single definition; resolve the `.env.local` duplicate).
2. Set Preview value (preview host or unset) and Development value (`http://localhost:3000`).
3. Change `src/app/layout.tsx:12` `metadataBase` → `https://www.hammah.store`.
4. Add Vercel redirect `slhammah.vercel.app` → `https://www.hammah.store/:path*` (308).
5. Confirm apex→www 308 remains and matches `metadataBase`.
6. Supabase Dashboard: Site URL → `https://www.hammah.store`; add Redirect URLs allow-list (prod + localhost + preview pattern).
7. Rebuild/redeploy so the WhatsApp chunk re-inlines the new origin.
8. Smoke-test: forgot-password email, signup verification email, auth callback, WhatsApp product link.

### Phase 2 — Technical SEO Foundation

1. Fix title template double-suffix (either template **or** child suffix, not both) across `saved`, `account/*`, `collections/[slug]`, `product/[slug]`.
2. Add `alternates.canonical` on every public route.
3. Add per-page `metadata` / `generateMetadata` for `/`, `/shop`, `/collections`, `/our-story`, `/legacy`, `/terms`, `/delivery`, `/size-guide`, `/privacy`, `/returns`.
   - Requires splitting `"use client"` pages (`our-story`, `legacy`, `terms`, `delivery`, `size-guide`, `privacy`, `returns`) into server `page.tsx` + client child so metadata can be exported.
4. Extend product/collection `generateMetadata` with `openGraph` (incl. `og:image`, `og:type: product`), `twitter`, and description fallbacks.
5. Add `src/app/robots.ts` (allow public catalogue, disallow `/admin`, `/account`, `/dev`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/track`, `/saved`; declare sitemap).
6. Add `src/app/sitemap.ts` with homepage, `/shop`, `/collections`, each collection, each product, `/our-story`, `/legacy` (+ supporting pages), all using `https://www.hammah.store`, filtered to `status='published'`, with meaningful `lastModified`.
7. Add `noindex` to `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/track`, `/saved`, `/dev/media`.
8. Add `src/app/robots.ts` + JSON-LD: `Organization`, `WebSite`, `Product` (name/description/image/url/brand/availability — **no offers/price**), `CollectionPage`/`BreadcrumbList`.
9. Fix `/our-story` duplicate h2 pairs; convert `EditorialBreak` heading from `<p>` to a real heading; fix `/track` error-state missing H1.
10. Add `manifest`, `apple-touch-icon`, `favicon.ico` if desired.

### Phase 3 — Search Engine Registration

1. Verify `www.hammah.store` in Google Search Console (DNS or meta token).
2. Verify in Bing Webmaster Tools.
3. Submit `https://www.hammah.store/sitemap.xml`.
4. Submit `https://www.hammah.store/robots.txt` / request indexing of key routes.
5. Inspect duplicate-host status of `slhammah.vercel.app` in both consoles after the redirect lands.

### Phase 4 — Content / Keyword Strengthening

1. Replace placeholder product descriptions (`TEMP_DESCRIPTION`) with genuine per-product copy.
2. Strengthen `/shop` and `/collections` descriptive text with natural product-category language.
3. Add real descriptive copy to `/legacy` H1 area and `/` supporting sections.
4. Decide and document how `HAMMAH` vs `SL by HAMMAH` coexist in titles/OG.
5. Only introduce Ghana/Accra positioning **if** it is genuinely true of the business and represented in content.

---

## M. Risks

| # | Risk | Severity | Evidence |
|---|---|---|---|
| 1 | **`localhost:3000` in production output** | High | `.env.local` duplicate defines it last; local prod build chunk `3v0dqgabvh-8i.js` inlines `http://localhost:3000` into the WhatsApp message |
| 2 | **Old Vercel domain indexed as duplicate** | High | `slhammah.vercel.app` returns 200 with identical content, no redirect, no canonical |
| 3 | **Broken absolute URLs (og:image / twitter:image)** | High | `metadataBase = https://slbyhammah.com` — domain does not resolve (DNS failure) |
| 4 | **WhatsApp product links point at old domain** | High | Live chunk `1e7bpfu1es763.js` inlines `https://slhammah.vercel.app` |
| 5 | **Auth callback / reset-link breakage** | Medium | Reset emails currently resolve against the host the user is on; if Supabase Site URL is still localhost, verification/reset links break |
| 6 | **Signup verification target unknown** | Medium | No `emailRedirectTo` in code — 100% dashboard-controlled |
| 7 | **Duplicate canonicals** | High | No `<link rel="canonical">` anywhere; two live hosts |
| 8 | **Missing sitemap + robots** | High | 404 on all hosts |
| 9 | **Private/utility pages indexed** | Medium | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/track`, `/saved`, `/dev/media` all `index, follow` |
| 10 | **Product metadata gaps** | Medium | No OG image, no canonical, double-suffixed title, no description fallback |
| 11 | **Double DB read per product/collection request** | Low | `generateMetadata` + `page` both query uncached |
| 12 | **Media host mismatch** | Medium | `next.config.ts` allowlists `media.slbyhammah.com`; env points at `r2.dev`; live images are `images.pixieset.com` |
| 13 | **Preview hosts not noindexed** | Medium | Preview deployments inherit `index, follow` |
| 14 | **Thin product content** | Medium | 8 products share one placeholder description |
| 15 | **Dead `slbyhammah.com` brand domain** | High | Used as canonical/OG host but does not resolve |

---

## N. Files That Would Need Changes

**Phase 1 (domain migration)**

- `src/app/layout.tsx` (metadataBase)
- `.env.local` (remove duplicate `NEXT_PUBLIC_SITE_URL`)
- `.env.example` (per-environment guidance)
- Vercel dashboard env vars (not a repo file)
- Vercel domain/redirect config (not a repo file — no `vercel.json` exists)
- Supabase dashboard (not a repo file)

**Phase 2 (technical SEO)**

- `src/app/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/shop/page.tsx`
- `src/app/(public)/collections/page.tsx`
- `src/app/(public)/collections/[slug]/page.tsx`
- `src/app/(public)/product/[slug]/page.tsx`
- `src/app/(public)/product/[slug]/not-found.tsx`
- `src/app/(public)/our-story/page.tsx` (split server/client)
- `src/app/(public)/legacy/page.tsx` (split server/client)
- `src/app/(public)/terms/page.tsx` (split server/client)
- `src/app/(public)/delivery/page.tsx` (split server/client)
- `src/app/(public)/size-guide/page.tsx` (split server/client)
- `src/app/(public)/privacy/page.tsx` (split server/client)
- `src/app/(public)/returns/page.tsx` (split server/client)
- `src/app/(public)/login/page.tsx`
- `src/app/(public)/signup/page.tsx`
- `src/app/(public)/forgot-password/page.tsx`
- `src/app/(public)/reset-password/page.tsx`
- `src/app/(public)/track/page.tsx`
- `src/app/(public)/saved/page.tsx`
- `src/app/(public)/account/layout.tsx`
- `src/app/(public)/account/orders/page.tsx`
- `src/app/(public)/account/orders/[id]/page.tsx`
- `src/app/(public)/account/saved/page.tsx`
- `src/app/dev/media/page.tsx`
- **New:** `src/app/robots.ts`
- **New:** `src/app/sitemap.ts`
- **New:** structured-data component/util (e.g. `src/components/seo/`)
- `src/components/editorial/editorial-break.tsx` (heading element)
- `src/app/(public)/our-story/page.tsx` (duplicate h2 removal)
- `src/app/(public)/track/page.tsx` (error-state H1)
- `src/lib/catalogue/queries.ts` (if SEO fields / caching added)
- `src/types/products.ts`, `src/lib/catalogue/types.ts` (if SEO fields added)

**Phase 3 (registration)** — dashboard-only, no repo files.

**Phase 4 (content)** — `src/data/products.ts` fixtures (if reused), live DB product descriptions, `src/app/(public)/shop/*`, `src/app/(public)/collections/*`, `src/app/(public)/legacy/page.tsx`, homepage sections under `src/components/home/`.

---

## Appendix — Live Verification Log

| Probe | Result |
|---|---|
| `GET https://hammah.store/` | **308 → https://www.hammah.store/** |
| `GET https://www.hammah.store/` | 200, app served |
| `GET https://www.hammah.store/robots.txt` | **404** |
| `GET https://www.hammah.store/sitemap.xml` | **404** |
| `GET https://slhammah.vercel.app/` | **200, full site, no redirect** |
| `GET https://slhammah.vercel.app/robots.txt` | **404** |
| `GET https://slhammah.vercel.app/sitemap.xml` | **404** |
| `GET https://slhammah.vercel.app/product/blue-and-white-design` | 200, same double-suffixed title |
| `GET https://slbyhammah.com/` | **DNS: remote name could not be resolved** |
| Homepage `<head>` | `og:image = https://slbyhammah.com/...`, **no canonical**, no robots meta |
| Product `<head>` | `<title>Blue and White design \| SL by Hammah \| SL by Hammah</title>`, root og:*, **no canonical** |
| `GET https://www.hammah.store/admin` | 200, `<meta name="robots" content="noindex, nofollow"/>` ✅ |
| `GET https://www.hammah.store/dev/media` | 200, generic title, **no robots meta** ⚠️ |
| `GET https://www.hammah.store/account` | 307 → `/login` ✅ |
| `GET https://www.hammah.store/{login,signup,forgot-password,reset-password,track,saved}` | 200, **no robots meta** ⚠️ |
| Response headers | No `X-Robots-Tag` on any host |
| Live chunk `1e7bpfu1es763.js` | Inlines `"https://slhammah.vercel.app"` in WhatsApp message builder |
| Local build chunk `3v0dqgabvh-8i.js` | Inlines `"http://localhost:3000"` in same builder |
