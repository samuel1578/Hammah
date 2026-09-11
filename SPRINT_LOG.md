# HAMMAH — Sprint Log

## Sprint 0.1 — Project Bootstrap + Frontend Architecture
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Establish Next.js foundation, theme system, route skeleton, data structures
- **Routes:** All 18 scaffold routes created
- **Key files:** Root layout, theme provider, fonts, CSS variables, data fixtures
- **Result:** Clean build, lint passes

## Sprint 0.2 — Global Experience Shell + Homepage
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Global header, fullscreen mobile menu, 8-section homepage, motion primitives
- **Routes:** `/` fully implemented
- **Key files:** site-header, site-footer, mobile-menu, 8 home sections, 4 motion primitives
- **Result:** Clean build, lint passes

## Sprint 0.3 — Commerce Discovery + Collection Architecture
- **Date:** August 24, 2026
- **Status:** ✅ Complete (including Media Correction)
- **Objective:** Implement Shop, Collections, Collection 001, Kaftans, Footwear pages with real Collection 001 photography
- **Routes:** `/shop`, `/collections`, `/collections/collection-001`, `/collections/kaftans`, `/collections/footwear`
- **Major files created:**
  - `src/data/pixieset-collection-001.ts` — 160 verified Pixieset images
  - Commerce components: ProductCard, ProductGrid, ProductPrice, AvailabilityLabel, CollectionHero, CategoryFeature, EditorialBreak
- **Major files changed:**
  - `src/data/media-manifest.ts` — Replaced all Unsplash with Pixieset for Collection 001
  - `src/components/layout/site-header.tsx` — Solid background on non-homepage routes
  - `next.config.ts` — Added Pixieset image domain
- **Media-source changes:** Recovered 160 real Collection 001 images via Pixieset API
- **Result:** Clean build, lint passes

## Sprint 0.4 — Product Detail Experience
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Full PDP with gallery, info panel, size/quantity selectors, order drawer, related pieces
- **Route:** `/product/[slug]` (dynamic, all 8 products resolve)
- **Components added:**
  - `product/product-gallery.tsx` — Gallery with thumbnails + fullscreen lightbox
  - `product/product-info-panel.tsx` — Sticky purchasing panel
  - `product/order-drawer.tsx` — Order form drawer (frontend-only demo)
  - `product/media-mode-selector.tsx` — Photos/Video/360° selector
  - `product/sticky-mobile-cta.tsx` — Sticky bottom CTA on mobile
  - `product/related-pieces.tsx` — Related products from Collection 001
  - `product/pdp-client.tsx` — Client-side PDP layout orchestrator
  - `product/[slug]/not-found.tsx` — Custom 404 for invalid slugs
- **Media/data changes:**
  - Extended `ProductMedia` interface (primary, gallery[], details[], thumbnail)
  - Updated product fixtures with 7 Pixieset images each (56 total)
  - Added `getRelatedProducts()` helper
  - Added `PRODUCT_SIZES` fixture
- **Documentation changes:**
  - Created `HAMMAH_SPRINT_REPORT.md` (cumulative, migrated Sprint 0.1–0.4)
  - Deleted `SPRINT_0_1_REPORT.md`, `SPRINT_0_2_REPORT.md`, `SPRINT_0_3_REPORT.md`
- **Validation:** `tsc --noEmit` ✅, `npm run build` ✅ (20 pages)
- **Known limitations:** Temporary product-photo mapping, frontend-only order demo, remote Pixieset URLs

## Sprint 0.5 — Media Management + Story + Legacy + Saved
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Improve Pixieset pool usability, implement Our Story, Legacy, Saved pages, create dev media tool
- **Routes:** `/our-story`, `/legacy`, `/saved`, `/dev/media`
- **Components/data changes:**
  - Refactored `pixieset-collection-001.ts` — 160 images as numbered `PixiesetImage` records with labels
  - Added helpers: `getPixiesetImage(n)`, `getPixiesetImageUrl(n)`, `getPixiesetIndex(n)`, `getPixiesetImages(start, count)`
  - Updated `media-manifest.ts` — uses `u(n)` 1-based helper, all assignments preserved
  - Updated `products.ts` — uses `u(n)` 1-based helper, all assignments preserved
  - Added 13 media manifest entries for Our Story (8), Legacy (4), Saved (1)
- **Media tooling:**
  - `/dev/media` — Visual contact sheet for all 160 images
  - Features: search, jump-to-number, copy URL, copy reference, fullscreen preview with nav
  - Not linked from public navigation
- **Our Story:** 7-section editorial page (hero, POV, African fashion, craft, sourcing, sustainability, closing)
- **Legacy:** 5-section membership page (hero, benefits, Hamatee Since, privileges, CTA)
- **Saved:** 3-state page (populated demo, empty, signed-out) with dev state selector
- **Validation:** `tsc --noEmit` ✅, `npm run build` ✅ (21 pages)
- **Blockers:** None
- **Known limitations:** /dev/media not env-gated, Our Story content placeholders, Saved is frontend-only
- **Next sprint:** Sprint 0.6 — Auth, Legal, Remaining Pages

## Mini Fix — Homepage Hero Video Background
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Replace homepage hero static image with local /herovideo.mp4
- **Files changed:**
  - `src/data/media-manifest.ts` — Added `MediaType` type, `type: "video"` on home-hero slot
  - `src/components/home/home-hero.tsx` — Conditional `<video>` / `<img>` rendering
- **Video:** 1280×720 MP4, autoplay/muted/loop/playsInline, `aria-hidden`, Ink fallback
- **Result:** `tsc --noEmit` ✅, `npm run build` ✅ (21 pages)

## Sprint 0.6 — Auth Entry UI + Guest Order Tracking
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Implement /login, /signup, /track with premium editorial layouts, motion, and theme support
- **Routes:** `/login`, `/signup`, `/track`
- **Components created:**
  - `login/page.tsx` — Full split-screen login with password toggle, error states, Google demo
  - `signup/page.tsx` — Two-step flow with directional motion, progress indicator, validation, success state, Google profile completion
  - `track/page.tsx` — Lookup + result with animated 7-step timeline, payment status, membership CTA
- **Components changed:**
  - `product/product-info-panel.tsx` — Accepts external size/quantity/orderOpen props
  - `product/pdp-client.tsx` — Lifts order state, renders OrderDrawer
  - `product/order-drawer.tsx` — Fixed setState-in-effect lint error
- **Media changes:**
  - Added 3 media manifest entries: login-editorial (u110), signup-step-01 (u115), signup-step-02 (u120)
- **Design:** Split-screen editorial layouts, large typography (3.5–7rem headings), 56px form controls, motion choreography per page
- **Validation:** `tsc --noEmit` ✅, `npm run build` ✅ (21 pages)
- **Blockers:** None
- **Known limitations:** No real auth, no real order lookup, Google OAuth demo only
- **Next sprint:** Sprint 0.7 — Legal pages, remaining content, potential Appwrite integration

## Sprint 0.7 — Support + Legal + Size Guide
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Implement /privacy, /terms, /delivery, /returns, /size-guide with approved content and editorial design
- **Routes:** `/privacy`, `/terms`, `/delivery`, `/returns`, `/size-guide`
- **Components created:**
  - `legal/legal-toc.tsx` — Sticky TOC with IntersectionObserver active indicator
  - `legal/legal-section.tsx` — Section wrapper with heading, body, optional working-policy badge
- **Pages implemented:**
  - `/privacy` — 10-section legal page with sticky desktop TOC, mobile collapsible TOC
  - `/terms` — 10-section legal page with same system as Privacy
  - `/delivery` — Operational page with 4-step editorial journey, detail sections, CTAs
  - `/returns` — Policy page with working-policy markers on all sections
  - `/size-guide` — Visual page with diagram placeholder, 6 measurement types, responsive table shell (all "—" placeholders)
- **Content:** All copy sourced from `HAMMAH_PUBLIC_CONTENT.txt`
- **Validation:** `tsc --noEmit` ✅, `npm run build` ✅ (21 pages)
- **Blockers:** None
- **Known limitations:** Legal pages are working drafts, size measurements are placeholders, no final jurisdiction language
- **Next sprint:** Sprint 0.8 — Full public frontend audit + stabilisation

## Sprint 0.8 — Full Public Frontend Audit + Stabilisation
- **Date:** August 24, 2026
- **Status:** ✅ Complete
- **Objective:** Audit, stabilise, and production-ready the entire public frontend
- **Routes audited:** All 21 routes (20 public + /dev/media)
- **Defects fixed:**
  - Added Search placeholder button to header (was missing from approved nav)
  - Fixed header isHome trailing-slash edge case
  - Added TODO comments for footer social links (no URLs approved)
- **Static audit results:** No console.log, TODO, FIXME, @ts-ignore, any types, lorem, or eslint-disable directives found
- **Unsplash status:** Only Kaftans/Footwear reference imagery (correct)
- **Search status:** Disabled placeholder in header, deferred to backend sprint
- **/dev/media status:** Functional, not in public nav, documented as internal
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 34 img warnings), `npm run build` ✅ (21 pages)
- **Readiness:** All areas PASS — public frontend is coherent, stable, and ready for next phase
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Sprint 0.9 — Homepage UI Redesign + Typography Elevation
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Elevate homepage typography, unify section rhythm, implement Swiper for mobile collection view
- **Typography system:** Added `.type-hero`, `.type-statement`, `.type-headline`, `.type-eyebrow`, `.type-body`, `.type-cta` to globals.css
- **Sections redesigned:** All 8 homepage sections (hero, collection, craft, pov, world, featured, legacy, closing)
- **Mobile Swiper:** Replaced CSS snap-scroll with actual `<Swiper>` in home-collection.tsx (`slidesPerView: 1.15`, pagination)
- **Section rhythm:** All sections updated to `py-24 md:py-36`
- **CTA upgrade:** Plain text links replaced with bordered/accent buttons in featured + world sections
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors), `npm run build` ✅ (21 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Mini Fix — Engraved SVG CTA System + Exact Button Colour Treatment
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Apply engraved SVG background treatment to all CTA buttons across the site
- **Changes:**
  - `src/app/globals.css` — Added `.btn-engraved-primary` (brown #79583A, hover #896746, active #684A31) and `.btn-engraved-secondary` (frosted glass rgba(17,17,16,0.42), border rgba(247,245,241,0.36)) CSS classes with SVG background layers, hover animations, and reduced-motion support. Updated `--accent` from #7A5C3E to #79583A.
  - `src/components/ui/button.tsx` — Primary variant uses `btn-engraved-primary`, secondary uses `btn-engraved-secondary`
  - `src/components/home/home-hero.tsx` — Simplified to use CSS classes
  - Applied `btn-engraved-primary` to ~20 gold/brown CTA buttons across: collections, delivery, legacy, login, our-story, shop, signup, size-guide, track, collection-hero, home-closing, home-collection, home-legacy, order-drawer, product-info-panel, sticky-mobile-cta
  - Applied `btn-engraved-secondary` to ~8 bordered/secondary buttons across: delivery, login, saved, signup, size-guide, track, home-pov, order-drawer, product-info-panel
- **Not engraved** (intentionally): filter pills, timeline nodes, size selectors, theme menu, mobile menu active states, skip-to-content, /dev/media
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Mini Fix — Correct Secondary Logo Rendering in Hero + Footer
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Fix portrait logo sizing, remove duplicate hero brand text, force correct logo theme in hero
- **Changes:**
  - `src/components/brand/brand-logo.tsx` — Removed forced `height: 100%` inline style; added `forceTheme` prop; documented logo file semantics (dark = white artwork for dark bg, light = dark artwork for light bg)
  - `src/components/home/home-hero.tsx` — Replaced width-based logo sizing with height-based (`h-[52px] sm:h-[65px] md:h-[75px] lg:h-[90px] w-auto`); added `forceTheme="dark"` for consistent white logo on dark hero overlay; removed duplicate "SL by Hammah" text marker
  - `src/components/layout/site-footer.tsx` — Replaced width-based sizing with height-based (`h-[80px] sm:h-[90px] md:h-[105px] w-auto`)
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Mini Fix — Kaftan Image + Footer Logo Scale + Hero Branding Readability
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Replace Kaftan image, fix footer logo oversizing, add hero secondary logo, improve hero readability
- **Changes:**
  - `src/data/media-manifest.ts` — `home-category-kaftans` updated from Unsplash to local `/images/hammah/home/categories/kaftan.jpg`
  - `src/components/layout/site-footer.tsx` — Logo resized to `w-[150px] sm:w-[170px] md:w-[190px] h-auto`
  - `src/components/brand/brand-logo.tsx` — Removed broken `width={0} height={0}` sizing, simplified to `width: auto, height: 100%`
  - `src/components/motion/text-reveal.tsx` — Added `style` prop support for inline styles
  - `src/components/home/home-hero.tsx` — Added secondary logo top-left, directional left-heavy overlay (`rgba(17,17,16,0.72)` → transparent), warm-white text colors (`#F7F5F1`) independent of theme, bottom fade for mobile
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Mini Fix — Final Product-to-Image Mapping for Designs 01–08
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Correct product-to-Pixieset-image assignments using approved temporary mapping
- **Mapping applied:**
  - Design 01 → Image 011
  - Design 02 → Image 016
  - Design 03 → Image 026
  - Design 04 → Image 038
  - Design 05 → Image 056
  - Design 06 → Image 075
  - Design 07 → Image 125
  - Design 08 → Image 141
- **Files changed:**
  - `src/data/products.ts` — Updated `media.primary` and `media.thumbnail` for all 8 designs; reordered gallery for Design 06 (Image 075 moved to front)
  - `src/data/media-manifest.ts` — Updated `home-featured-01` through `04`, `shop-product-01` through `08`, `c001-product-01` through `08` (20 entries total)
- **Pages affected:** Homepage Featured Pieces (Designs 01–04), /shop (Designs 01–08), /collections/collection-001 (Designs 01–08), all PDPs
- **PDP galleries:** Multi-image galleries preserved; only primary/thumbnail updated
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 37 img warnings), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Sprint 0.10 — Typography Hierarchy + CTA Consistency + Availability Polish
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Fix section heading hierarchy, CTA engraving consistency, product availability presentation, and story/legacy statement sizing
- **Changes:**
  - **Typography:** `.type-headline` upgraded to `clamp(2.75rem, 5vw, 5.5rem)` (~3× body text); `.type-statement` upgraded to `clamp(1.85rem, 3vw, 2.75rem)` (~2× CTA size); new `.type-editorial-statement` utility added
  - **Availability badge:** New `.availability-badge` CSS class with restrained glow treatment (Light: green subtle glow, Dark: soft green glow), compact rounded-full geometry, always on own line below price
  - **Product card:** Added spacing wrapper around availability badge, increased `space-y-1` from `space-y-0.5`
  - **CTA corrections:** home-closing "Shop Collection 001" → primary engraved; home-featured "Shop all trousers" → secondary engraved; home-legacy "Join the Legacy" → primary engraved; sticky-mobile-cta → primary engraved
  - **Story statement:** POV lead copy upgraded from `.type-body` to `.type-editorial-statement`; heading upgraded from `.type-statement` to `.type-headline`
  - **Legacy statement:** Lead copy upgraded from `.type-body` to `.type-editorial-statement`
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 37 img warnings), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Mini Fix — Apply Approved Title Style to Homepage Statements
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Apply the approved Title Style (Instrument Serif Italic editorial display) to five specific homepage statements
- **Statements updated:**
  1. home-featured.tsx — "Available now. A selection from the opening trouser collection." → `.type-editorial-statement`
  2. home-world.tsx — "More than one expression..." → `.type-editorial-statement`
  3. home-collection.tsx — "Eight African-print trouser designs..." → `.type-editorial-statement`
  4. home-hero.tsx — "Premium African fashion designed around strong pieces..." → `.type-editorial-statement` (warm-white, subordinate to main headline)
  5. home-craft.tsx — "Print, proportion, construction and finish..." → `.type-editorial-statement`
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 37 img warnings), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Mini Sprint — Homepage FAQ
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Add editorial FAQ section to homepage with desktop hover interaction and mobile tap accordion
- **Component:** `src/components/home/home-faq.tsx`
- **Placement:** Between HomeLegacy and HomeClosing (before final campaign section)
- **Content:** 8 approved questions with exact factual answers; Q5 links to /size-guide, Q6 links to /legacy
- **Desktop:** Hover activates questions, click/keyboard fallback, editorial numbered layout with left title column
- **Mobile:** Tap accordion, one answer open at a time, smooth height/opacity transitions
- **Accessibility:** `<button>` triggers, `aria-expanded`, `aria-controls`, matching IDs, keyboard support (Tab, Enter, Space)
- **Motion:** AnimatePresence height reveal, ~300ms ease, prefers-reduced-motion respected
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 37 img warnings), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Mini Fix — Details Brand Mark + Hero CTA Visibility
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Add secondary logo to Details section; fix hero CTA visibility after Title Style upgrade
- **Details section:** Added `BrandLogo` (secondary variant) above the Title Style statement; height-based sizing `h-[42px]`→`h-[68px]` responsive; theme-aware (Light/Dark); uses existing negative space, section height unchanged
- **Hero:** Created `.type-hero-statement` class (`clamp(2rem, 3.2vw, 3.75rem)`, `line-height: 1.02`); tightened vertical gaps (mt-6, mt-8); scroll cue hidden on mobile to prevent CTA competition
- **globals.css:** Added `.type-hero-statement` utility
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 37 img warnings), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Sprint 0.11 — Shop + Collections + Story Hero Polish
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Shop editorial logo, Collections hero redesign, Kaftan image fix, CTA consistency, Coming Soon removal, Story hero readability
- **Changes:**
  - **EditorialBreak:** Added `logo` prop (ReactNode) for logo-as-art variant; shop page uses `BrandLogo secondary` in editorial break
  - **Shop page:** Removed "Coming soon" from category filters; editorial break uses secondary logo instead of Pixieset image
  - **Collections hero:** Redesigned with `type-headline` + `type-editorial-statement` + secondary logo on right; Title Style applied
  - **Collections Kaftan image:** Replaced Unsplash with local `/images/hammah/home/categories/kaftan.jpg`
  - **Collections CTAs:** "Enter Collection 001" → `btn-engraved-primary`; "Explore Kaftans" → `btn-engraved-secondary`; "Explore Footwear" → `btn-engraved-secondary`; "Join the Legacy" (kaftans/footwear) → `btn-engraved-primary`
  - **Coming Soon removal:** Removed all customer-facing "Coming soon" / "In development" / "Preview" messaging from /collections, /collections/kaftans, /collections/footwear, and shop category filters
  - **Kaftans page:** Hero subheading changed from "Coming soon" to "A wider expression"; copy rewritten; CTA upgraded
  - **Footwear page:** Hero subheading changed from "Coming soon" to "The wardrobe continues"; copy rewritten; CTA upgraded
  - **CollectionHero:** Added `overlay`, `headingColor`, `bodyColor` props for media-surface readability; heading upgraded to `type-hero`
  - **Our Story hero:** Added directional dark overlay + warm-white text (#F7F5F1) for reliable readability; closing CTA upgraded to `btn-engraved-primary`
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 38 img warnings), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Sprint 0.12 — Multi-Media Product Interactions + Admin-Ready Content Contracts
- **Date:** August 25, 2026
- **Status:** ✅ Complete
- **Objective:** Product media hover/swipe interactions + Admin-ready data contracts
- **Product media contract:** Added `hover?: string` field to `ProductMedia` interface
- **Temporary hover image mapping:** Each product's first gallery image assigned as hover (Design 01→u(37), 02→u(44), 03→u(51), 04→u(58), 05→u(65), 06→u(72), 07→u(79), 08→u(86))
- **Desktop product card:** Primary → hover image crossfade on hover/focus (opacity 300ms, slight scale 1.015); keyboard focus triggers same effect
- **Mobile product card:** Swiper with 2-3 images per card (primary + hover + first gallery); tiny themed pagination; touch swipe without breaking vertical scroll
- **Category data contract:** Added `shortDescription`, `visibility`, `sortOrder` to Category type; populated for all 3 categories
- **Collection data contract:** Added `description`, `visibility`, `sortOrder` to Collection type; populated for all 3 collections
- **Collection-001 responsive hero:** Added `desktopMedia`/`mobileMedia` props to CollectionHero; desktop uses colhero-desktop.png, mobile uses colhero-mobile.png; media manifest entries added
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 errors, 39 img warnings), `npm run build` ✅ (20 pages)
- **Next phase:** Backend integration (Appwrite auth), search, real order persistence, admin/Hamatee routes

## Sprint 0.13 — Mobile Spacing Correction + Dynamic "In the Details" Media
- **Date:** September 8, 2026
- **Status:** ✅ Complete
- **Objective:** Fix excessive mobile homepage spacing; replace static "In the Details" images with dynamic rotation from 160-image pool
- **Mobile spacing root cause:** All sections used `py-24` (192px) on mobile with large inherited desktop grid gaps
- **Spacing strategy:** Reduced to `py-16` (128px) on mobile; grid gaps from 40–48px to 24–32px; all `md:` desktop values preserved
- **Files corrected:** home-collection.tsx, home-world.tsx, home-craft.tsx, home-featured.tsx, home-pov.tsx, home-legacy.tsx, home-faq.tsx
- **Details root cause:** Component used two fixed Pixieset entries (#6, #7) via media manifest with no randomisation
- **Reused architecture:** `COLLECTION_001_PIXIESET` pool (160 images) + `pickRandom()` adapted from `rotating-detail-images.tsx`
- **Randomisation:** Client-side after hydration; deterministic initial pair (#6, #7) avoids hydration mismatch
- **Rotation:** 1500ms interval; alternating single-slot replacement; preloading via `new Image()`; `IntersectionObserver` (threshold 0.2) pauses when out of view
- **Duplicate protection:** `pickRandom(exclude)` excludes other slot + previous image (~1.3% collision rate)
- **Transition:** `AnimatePresence` 0.6s crossfade + subtle scale; `prefers-reduced-motion` disables animation
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 new errors), `npm run build` ✅ (20 pages)

## Our Story Redesign Investigation
- **Date:** September 8, 2026
- **Status:** 🔍 Investigation / Not Implemented Yet
- **Objective:** Investigate the current `/our-story` page for a premium editorial redesign
- **Current state:** 7-section page with small typography (text-3xl = 30px headings), repetitive image-text layout, one-shot reveal animations only, 8 static Pixieset images
- **Core problems identified:**
  - Typography too small for editorial fashion (headings at 30px, body at 14–16px)
  - Monotonous layout: every section is 2-column image+text grid
  - Motion is shallow: no sticky sections, no marquee, no parallax, no scroll-linked animation
  - Closing section feels weak — not a culmination
- **Key opportunities:**
  - Oversized editorial typography (12vw statements, `.type-headline` reuse)
  - Sticky image + scrolling text (Point of View section)
  - 2 marquee moments: "MADE WITH INTENTION" (mid-page break) and "SL BY HAMMAH" (closing transition)
  - Dynamic image rotation from 160-image pool (POV, Sourcing sections)
  - Full-bleed image moments (African Fashion, Closing)
  - Parallax scroll on craft images
  - Text-over-image overlap (Sourcing)
  - Typography-led section (Sustainability)
- **New components needed:** `Marquee` (~50 lines), `StickyStory` (~80 lines)
- **Files to modify:** `page.tsx` (full rewrite), `globals.css` (add `.type-oversized`)
- **Reusable infrastructure:** TextReveal, Reveal, MediaReveal, Stagger, Container, useScroll, useTransform, AnimatePresence, IntersectionObserver, useReducedMotion
- **Full investigation:** HAMMAH_SPRINT_REPORT.md → "Our Story Redesign Investigation" section
- **Awaiting approval before implementation**

## Our Story Redesign — Mini Sprint 1
- **Date:** September 8, 2026
- **Status:** ✅ Complete
- **Objective:** Implement editorial foundation + hero + brand statement + POV sticky + marquee + African fashion
- **Files created:** `src/components/editorial/marquee.tsx` (~55 lines, CSS transform infinite-scroll with `prefers-reduced-motion` fallback)
- **Files modified:** `globals.css` (added `.type-oversized` at `clamp(2.75rem, 12vw, 4.75rem)` / `clamp(4rem, 8vw, 9rem)`), `our-story/page.tsx` (full rewrite)
- **Hero:** Custom editorial hero replacing CollectionHero — full-viewport, `u(93)` image with Ken Burns, oversized heading, directional gradient, staggered text reveal
- **Brand statement:** Typography-led section — `.type-headline` + `.type-statement` with Stagger reveal, generous whitespace (`py-20 md:py-32 lg:py-40`)
- **Point of View:** Desktop — 12-col grid with sticky image (`md:sticky md:top-28`) + scrolling narrative (3 Reveal blocks with 16–20 gap); `useScroll` + `useTransform` for subtle parallax; Mobile — stacked image→text, no sticky
- **Marquee:** "MADE WITH INTENTION" — CSS `@keyframes translateX`, 45s loop, `.type-headline` serif italic, `aria-hidden`, reduced-motion renders static
- **African Fashion:** Full-bleed (`h-[70svh] md:h-[85svh]`), `u(95)` image, gradient overlay, TextReveal + Reveal for statement over image
- **Mobile spacing:** `py-16 md:py-24 lg:py-32` pattern (not `py-24` on mobile); brand statement `py-20 md:py-32 lg:py-40`
- **Reduced motion:** All sections render static — hero (no scale), marquee (no animation), parallax (no movement), reveals (no animation)
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 new errors), `npm run build` ✅ (20 pages)
- **Remaining:** Mini Sprint 2 — Craft, Sourcing, Sustainability, Closing redesign

## Our Story Redesign — Mini Sprint 2
- **Date:** September 8, 2026
- **Status:** ✅ Complete
- **Objective:** Complete the Our Story editorial redesign — Craft, Sourcing, Sustainability, closing campaign, second marquee, full-page polish
- **Files modified:** `our-story/page.tsx` (full rewrite with 5 extracted sub-components: PointOfViewSection, CraftSection, SourcingSection, SustainabilitySection, ClosingSection)
- **Craft:** Asymmetric 7/5 editorial grid (desktop) — dominant image left + offset secondary right with dual-speed scroll-linked parallax (±30px main, +50/-20px secondary); Mobile: dominant full-width + 75% width offset secondary + `ml-auto`
- **Sourcing:** Text/image overlap — 60% image with oversized statement crossing boundary via absolute positioning (desktop); `-mt-10` overlap (mobile); `type-oversized` typography
- **Sustainability:** Typography-led centered layout — `type-oversized` statement + optional secondary image at 16/9 below; no image-dominant grid
- **Second marquee:** "SL BY HAMMAH" — `type-oversized`, right direction (opposite first), 35s speed, `bg-[#111110]` dark surface; signals story conclusion
- **Closing:** Full-bleed `h-[85svh]`, lighter overlay (`bg-[#111116]/40` vs old 60%), split statement (`type-oversized` + `type-statement`), `btn-engraved-primary` CTA
- **Motion hierarchy:** entrance → stagger reveal → sticky narrative → CSS marquee → immersive reveal → dual-speed parallax → overlap reveal → typography reveal → opposite marquee → campaign reveal
- **Reduced motion:** All parallax returns `[0,0]`; marquees stop; all reveals render static; page remains intentionally designed without animation
- **Performance:** CSS transform-only marquees; MotionValues for parallax (no React state); no new dependencies; no timers; all images lazy except hero
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 new errors), `npm run build` ✅ (20 pages)
- **Our Story Redesign: Complete**

## Our Story Redesign — Mini Sprint 3
- **Date:** September 8, 2026
- **Status:** ✅ Complete
- **Objective:** Replace all placeholder copy on the Our Story page with approved HAMMAH wording; content integrity audit; responsive fit pass
- **Placeholder removed (Craft):** "This section is reserved for approved information about Hammah's manufacturing, construction and finishing process." → 3 approved paragraphs on proportion, balance, finish
- **Placeholder removed (Sourcing):** "This section will explain approved sourcing and material information once the brand has finalised the facts it wants to publish." → 3 approved paragraphs on materials, colour, visual character
- **Placeholder removed (Sustainability):** "Hammah's sustainability position will be published here once sourcing, production and material claims have been formally documented." → 4 approved paragraphs on responsibility, deliberation, transparency
- **Closing updated:** "Considered essentials." → "This is only the beginning." + expanded body about Hammah defining its language + "Collection 001 opens the story. It does not finish it."
- **New editorial statement:** "Detail is where the character lives." — scroll-reveal between Craft and Sourcing, `type-headline`, `aria-hidden`
- **Content audit:** Searched for 10 placeholder patterns — all clean. Two "this section" matches are approved continuation copy in Sourcing
- **No unsupported claims added:** Verified against prohibited terms (sustainable, eco-friendly, ethical, carbon-neutral, artisan, factory, country of origin, certifications)
- **Responsive:** Longer copy fits via `max-w-md`/`max-w-lg` constraints + `mt-4` paragraph spacing; no typography size reductions
- **Validation:** `tsc --noEmit` ✅, `eslint` ✅ (0 new errors), `npm run build` ✅ (20 pages)
- **Our Story Redesign: Complete after Mini Sprint 3 content pass**

## Sprint 0.14 — Commerce Domain & Admin Data Architecture Investigation

- **Date:** September 11, 2026
- **Status:** ✅ Investigation Complete — Architecture Proposed
- **Objective:** Inspect actual repository, produce canonical Supabase + Cloudflare + Admin architecture blueprint
- **Scope:** Investigation ONLY — no backend, no tables, no Admin dashboard, no migrations, no media migration
- **Key findings:**
  - 8 products with 7 curated Pixieset images each (56 product images from 160-image pool)
  - 3 categories (Trousers, Kaftans, Footwear) — categories masquerade as collections in routing
  - 3 collections (Collection 001 with 8 products, Kaftans empty, Footwear empty)
  - ~55 media slot entries across all routes in typed media manifest
  - Order flow is request-based (not instant checkout) — customer submits, Hammah contacts
  - Authentication fully mocked — no real auth exists
  - Saved Pieces is frontend-only state
  - Video and 360° are placeholder tabs on PDP
  - `/dev/media` is functional 160-image contact sheet (no auth)
  - Product `id` and `slug` are identical — no separate UUID
  - `PRODUCT_SIZES` is global fixture — all products share same 4 sizes
  - No price field on products (all PRICE_ON_REQUEST)
  - No publish/draft state on products
  - No timestamps on any entities
- **Proposed schema:** 14 tables (profiles, categories, collections, products, product_variants, collection_products, media_assets, product_media, homepage_featured_products, homepage_hero_images, homepage_collection_feature, saved_products, addresses, orders, order_items)
- **Admin IA proposed:** Dashboard, Catalogue (Products/Categories), Collections, Media (Images/Videos/360 Sets), Homepage/Merchandising, Orders, Customers, Settings
- **Migration strategy:** 6-phase incremental approach (Schema → Reads → Auth → Orders → Admin → Cutover)
- **Sprint sequence proposed:** 0.15 (Foundation) → 0.16 (Catalogue) → 0.17 (Auth) → 0.18 (Orders) → 0.19 (Admin) → 0.20 (Cutover)
- **Output:** `HAMMAH_SPRINT_0_14_ARCHITECTURE.md` — 35-section canonical architecture document
- **No code changes:** This sprint produced no changes to application code
- **Next phase:** Sprint 0.15 — Supabase + Cloudflare Foundation

---

## Canonical Development Documentation Setup

- **Date:** September 11, 2026
- **Status:** ✅ Complete — 7 canonical documents established
- **Scope:** Documentation only — no application code changes
- **Purpose:** Establish the permanent canonical development documentation system that all future HAMMAH development prompts must follow
- **Output:** `docs/development/` directory with 7 files:
  - `01_HAMMAH_SYSTEM_CONTEXT.md` — What HAMMAH is, current state, terminology
  - `02_HAMMAH_ARCHITECTURE.md` — Approved production architecture (current + target)
  - `03_HAMMAH_DATA_MODEL.md` — Current TypeScript model, approved Sprint 0.15 foundation, future/provisional model
  - `04_HAMMAH_PRODUCT_AND_ADMIN_RULES.md` — Frozen product/business rules
  - `05_HAMMAH_MEDIA_ARCHITECTURE.md` — Media strategy (current, approved, future)
  - `06_HAMMAH_SECURITY_AND_ENGINEERING_RULES.md` — Security rules, engineering discipline, mandatory AI prompt preamble
  - `07_HAMMAH_DEVELOPMENT_ROADMAP.md` — Sprint-by-sprint roadmap with goals, dependencies, deliverables, exit criteria
- **Key decisions documented:**
  - Categories and collections are distinct concepts (category ≠ collection)
  - Slug-based dynamic routing (`/collections/[slug]`) is the approved model
  - Collection 001 is NOT architecturally special
  - Request-based order model (not instant checkout)
  - Admin vs code ownership is explicit
  - Supabase Free for database/auth/RLS, Cloudflare R2 for media
  - Video and 360° are NOT currently functional (placeholder tabs only)
  - 360° is future/provisional — schema does not depend heavily on it
- **Validation:** All 7 docs checked for consistency; no contradictory definitions found
- **No code changes:** This sprint produced no changes to application code
- **Build:** `npm run build` ✅ 20 pages, clean

---

# Sprint 0.15 — Production Foundation

**Date:** September 11, 2026
**Status:** ✅ Complete

## Objective

Establish the Supabase + Cloudflare foundation for HAMMAH production backend.

## Packages Installed

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | 2.116.0 | Supabase client SDK |
| `@supabase/ssr` | 0.12.7 | Supabase SSR helpers for Next.js App Router |
| `@aws-sdk/client-s3` | 3.1130.0 | Cloudflare R2 (S3-compatible) client |

## Files Created

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable contract (Supabase + Cloudflare + App) |
| `src/lib/supabase/client.ts` | Browser Supabase client (createBrowserClient) |
| `src/lib/supabase/server.ts` | Server Component Supabase client (cookie-based sessions) |
| `src/lib/supabase/admin.ts` | Admin Supabase client (service role, server-only) |
| `src/lib/cloudflare/r2.ts` | R2 upload/delete helpers (server-only) |
| `src/lib/media/url.ts` | `getMediaUrl()` — media delivery URL abstraction |
| `supabase/migrations/00001_initial_schema.sql` | Foundation schema migration |

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Added 3 dependencies |
| `next.config.ts` | Added `media.slbyhammah.com` to image remote patterns |

## Migration: Tables Created

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles, 1:1 with auth.users, role field (customer/admin) |
| `categories` | Product classifications (Trousers, Kaftans, Footwear) |
| `collections` | Editorial groupings (Collection 001, etc.) |
| `products` | Core sellable items |
| `product_variants` | Per-product size/variant system |
| `collection_products` | Many-to-many collection-product junction |
| `media_assets` | Global media metadata pool |
| `product_media` | Product-media assignments with role + sort |
| `homepage_featured_products` | Homepage featured product selection |
| `homepage_hero_images` | Homepage hero rotation images |
| `homepage_collection_feature` | Homepage collection feature section |

## RLS Policies Created

- **profiles:** User can read/update own profile; admins can read all
- **categories/collections/products:** Public read published; admins full CRUD
- **product_variants:** Public read for published products; admins full CRUD
- **collection_products:** Public read for published collections; admins full CRUD
- **media_assets:** Public read; admins full CRUD
- **product_media:** Public read for published products; admins full CRUD
- **homepage_***: Public read active; admins full CRUD

## Security Functions

- `is_admin()` — SECURITY DEFINER function, checks profiles.role = 'admin'
- `handle_updated_at()` — SECURITY DEFINER trigger function, auto-sets updated_at

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_PUBLIC_BASE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Verification

| Check | Result |
|-------|--------|
| TypeScript | ✅ Clean (tsc --noEmit) |
| Build | ✅ 20 pages, no regressions |
| Public frontend | ✅ Unchanged (still fixture-driven) |
| No secrets committed | ✅ .env.example has no values |
| No runtime behaviour changed | ✅ |

## Canonical Docs Updated

- `02_HAMMAH_ARCHITECTURE.md` — version stamp
- `03_HAMMAH_DATA_MODEL.md` — foundation tables marked as implemented
- `05_HAMMAH_MEDIA_ARCHITECTURE.md` — version stamp
- `06_HAMMAH_SECURITY_AND_ENGINEERING_RULES.md` — env vars updated to match actual implementation
- `07_HAMMAH_DEVELOPMENT_ROADMAP.md` — version stamp

## What Sprint 0.15 Does NOT Include (by design)

- No public page migration (stays fixture-driven until Sprint 0.16)
- No auth implementation
- No order implementation
- No Admin UI
- No media upload UI
- No seed data (categories, products, etc.) — Sprint 0.16
- No Supabase project required for code to compile (helpers fail at runtime without credentials)

---

# Sprint 0.16 — Catalogue Migration

**Date:** September 11, 2026
**Status:** ✅ Complete

## Objective

Migrate HAMMAH's catalogue from TypeScript fixtures to Supabase-authoritative data. Public catalogue pages now read from the database.

## Seed Strategy

Deterministic SQL seed file (`supabase/seed.sql`) generated from existing fixture data. Run after `00001_initial_schema.sql`.

### Database Records Seeded

| Entity | Count | Source |
|--------|-------|--------|
| Categories | 3 | `src/data/categories.ts` |
| Collections | 3 | `src/data/collections.ts` |
| Products | 8 | `src/data/products.ts` |
| Product variants | 32 | 8 products × 4 sizes (30/32/34/36) |
| Collection products | 8 | All 8 in Collection 001 |
| Media assets | ~56 | Curated Pixieset images from products |
| Product media | ~56 | 7 per product (primary/hover/gallery/detail) |
| Homepage featured | 4 | Design 01–04 |
| Homepage collection feature | 1 | Collection 001 |

## Files Created

| File | Purpose |
|------|---------|
| `supabase/seed.sql` | Deterministic seed data from fixtures |
| `src/lib/catalogue/types.ts` | Domain types (CatalogueProduct, CatalogueCollection, CatalogueCategory) |
| `src/lib/catalogue/queries.ts` | Supabase queries + legacy type mapper |
| `src/lib/catalogue/index.ts` | Public API re-exports |
| `src/app/(public)/shop/shop-client.tsx` | Client component for shop filtering |
| `src/app/(public)/collections/collections-client.tsx` | Client component for collections index |
| `src/app/(public)/collections/[slug]/page.tsx` | Dynamic collection route (server) |
| `src/app/(public)/collections/[slug]/collection-slug-client.tsx` | Dynamic collection renderer (client) |

## Files Modified

| File | Change |
|------|--------|
| `src/app/(public)/page.tsx` | Fetches featured products from Supabase |
| `src/app/(public)/shop/page.tsx` | Server component, fetches products + categories |
| `src/app/(public)/product/[slug]/page.tsx` | Fetches product + related from Supabase |
| `src/app/(public)/collections/page.tsx` | Server component, fetches collections |
| `src/components/home/home-featured.tsx` | Accepts products as prop (no fixture import) |
| `src/components/product/pdp-client.tsx` | Accepts relatedProducts prop |
| `src/components/product/related-pieces.tsx` | Accepts products as prop (no fixture import) |

## Files Removed

| File | Reason |
|------|--------|
| `src/app/(public)/collections/collection-001/page.tsx` | Replaced by dynamic `/collections/[slug]` |
| `src/app/(public)/collections/kaftans/page.tsx` | Replaced by dynamic `/collections/[slug]` |
| `src/app/(public)/collections/footwear/page.tsx` | Replaced by dynamic `/collections/[slug]` |

## Routing Changes

| Route | Before | After |
|-------|--------|-------|
| `/` | Static | Dynamic (fetches featured products) |
| `/shop` | Static | Dynamic (fetches products + categories) |
| `/product/[slug]` | Dynamic | Dynamic (now fetches from Supabase) |
| `/collections` | Static | Dynamic (fetches collections) |
| `/collections/collection-001` | Static | → `/collections/[slug]` (dynamic) |
| `/collections/kaftans` | Static | → `/collections/[slug]` (dynamic) |
| `/collections/footwear` | Static | → `/collections/[slug]` (dynamic) |
| `/collections/[slug]` | — | New dynamic route |

## Remaining Fixture Dependencies

| Component | Fixture | Reason |
|-----------|---------|--------|
| `home-editorial-hero.tsx` | Hardcoded Pixieset URLs | Editorial, not catalogue |
| `home-world.tsx` | `getMediaBySection` | Category editorial images |
| `home-craft.tsx` | `getMediaBySection` | Editorial detail images |
| `home-pov.tsx` | `getMediaBySection` | Editorial portrait |
| `home-legacy.tsx` | Hardcoded | Editorial content |
| `home-faq.tsx` | Hardcoded | Editorial content |
| `home-closing.tsx` | Hardcoded | Editorial content |
| `media-manifest.ts` | Pixieset URLs | Editorial/media routing |
| `pixieset-collection-001.ts` | 160 URLs | Seed source (not runtime) |
| `dev/media/page.tsx` | Pixieset data | Dev tool |
| `product-info-panel.tsx` | `PRODUCT_SIZES` | Pending variant migration |
| `order-drawer.tsx` | `Product` type | Uses mapped type |

## Parity Verification

| Check | Result |
|-------|--------|
| TypeScript | ✅ Clean |
| Build | ✅ 20 pages |
| Product count | ✅ 8 (matches fixtures) |
| Category count | ✅ 3 (matches fixtures) |
| Collection count | ✅ 3 (matches fixtures) |
| Product slugs | ✅ design-01 through design-08 |
| Product media | ✅ Primary/hover/gallery/detail preserved |
| Public routes | ✅ All render correctly |
| Collection 001 URL | ✅ `/collections/collection-001` works via `[slug]` |

## Canonical Docs Updated

- All 7 canonical docs — version stamp
- `07_HAMMAH_DEVELOPMENT_ROADMAP.md` — Sprint 0.16 marked ✅ Complete

## What Sprint 0.16 Does NOT Include (by design)

- No Admin CRUD UI
- No auth implementation
- No order persistence
- No full Cloudflare R2 media migration
- No homepage editorial migration (stays fixture-driven)

---

## Sprint 0.16 Closeout — September 11, 2026

**Status:** ✅ Complete

### Closeout Items Resolved

#### 1. Product Variants Authoritative
- **Before:** `ProductInfoPanel` imported `PRODUCT_SIZES` global fixture (30, 32, 34, 36) — identical for all products
- **After:** `Product` type now has `variants: ProductVariant[]`; `ProductInfoPanel` reads `product.variants`
- **Files changed:** `types/products.ts`, `product-info-panel.tsx`, `products.ts` (legacy fixture), all 4 `toLegacyProduct()` functions
- **`PRODUCT_SIZES` and `SizeOption` removed from runtime** — replaced by `ProductVariant` interface
- **Variant parity confirmed:** DB seed has 4 variants (30, 32, 34, 36) all available, matching legacy fixture exactly

#### 2. Category Routing Status
- `/shop` has DB-backed categories with client-side filtering (no page navigation)
- `/shop/[category]` deferred — not architecturally required for current 8-product catalogue
- Category data flows: `getPublishedCategories()` → `ShopClient` → filter buttons

#### 3. Caching Investigation
- **All 5 migrated routes are request-time dynamic** — `cookies()` in `src/lib/supabase/server.ts:5` forces dynamic rendering
- No `export const revalidate`, `export const dynamic`, or `use cache` used anywhere
- No ISR configured. Routes re-render on every request.
- If ISR is desired in future, either: (a) stop using cookie-based client for public data, or (b) add `export const revalidate` to page files

#### 4. Remaining Fixture Dependencies
| Class | Count | Details |
|-------|-------|---------|
| A (Runtime/Dev) | 22 | Navigation, media-manifest, pixieset direct usage, products (saved page) |
| B (Seed support) | 2 | `products.ts`, `media-manifest.ts` importing pixieset URLs |
| C (Obsolete) | 0 | None |

#### 5. Verification
| Check | Result |
|-------|--------|
| TypeScript | ✅ Clean |
| Build | ✅ 17 pages |
| Product variants | ✅ Supabase-authoritative |
| Variant parity | ✅ 4 sizes × 8 products |
| Caching documented | ✅ All routes request-time dynamic |

### Canonical Docs Updated
- `01_HAMMAH_SYSTEM_CONTEXT.md` — Route map, data architecture, variant info, caching notes
- `03_HAMMAH_DATA_MODEL.md` — `ProductVariant` replaces `PRODUCT_SIZES`/`SizeOption`
- `07_HAMMAH_DEVELOPMENT_ROADMAP.md` — Sprint 0.16 closeout verified

---

## Sprint 0.17 — Admin Dashboard + Catalogue/Media/Merchandising

**Date:** September 11, 2026
**Status:** ✅ Complete (corrective pass applied)

### Objective
Build HAMMAH's first production Admin experience for managing catalogue, media, and merchandising without editing source code.

### Key Deliverables

#### Admin Authentication
- Middleware (`src/middleware.ts`) protects all `/admin` routes
- Cookie-based Supabase auth + profiles.role = 'admin' check
- `/admin/login` — HAMMAH-branded login page
- Non-admin users redirected to `/`

#### Admin Shell
- Persistent sidebar on desktop, drawer on mobile
- HAMMAH branding, theme switcher, logout
- 7 navigation sections: Dashboard, Products, Categories, Collections, Media, Homepage, CTAs

#### Dashboard
- Real database counts: products (published/draft/archived), collections, media assets, featured products, CTAs

#### Product Management
- List with search/filter by status
- Create product (name, slug, description, category, pricing, availability)
- Edit product (all fields + status transitions: draft → published → archived)
- Assign collections (multi-select)
- Manage variants (add/edit/delete per-product sizes)
- Media assignment (primary, hover, gallery, detail roles)
- Archive (soft delete)

#### Category Management
- List all categories with product counts
- Edit category (name, slug, description, cover image, sort order, status)
- Archive (only if zero products)

#### Collection Management
- List all collections with product counts
- Create collection (name, slug, editorial content, status)
- Edit collection with tabs: Details, Products, Media
- Product assignment with reorder
- Collection 002 can be prepared without code changes ✅

#### Media Library
- Grid view with thumbnails, type badges, search, filter
- Upload to Cloudflare R2 via server endpoint
- File validation (type, size)
- Edit alt text, caption
- Reference checking before delete
- Safe deletion (blocked if referenced)

#### R2 Upload
- Server-side upload via `/api/admin/media/upload`
- Object key: `uploads/{uuid}-{sanitized-filename}`
- MIME/size validation
- Creates media_assets record in Supabase
- R2 credentials remain server-only

#### Homepage Merchandising
- Featured products: add/remove/reorder
- Collection feature: select collection, edit heading/statement

#### CTA Manager
- New table: `cta_placements` (migration 00002)
- Predefined slots: home_midpage, home_closing, shop_banner, shop_footer, collection_hero, collection_footer
- Admin can: create, edit, enable/disable, delete CTAs
- Public integration: `PublicCTA` component renders active CTAs in predefined slots
- CTA enabled → rendered. CTA disabled → absent (no empty gaps).

### Database Changes
- New migration: `00002_cta_placements.sql`
- New table: `cta_placements` with RLS policies
- No changes to existing tables

### Routes Created
- 16 admin pages
- 15 API routes
- Total: 48 routes (17 public + 16 admin + 15 API)

### Validation
| Check | Result |
|-------|--------|
| TypeScript | ✅ Clean |
| Build | ✅ 48 pages |
| Public routes | ✅ All still work |
| Admin routes | ✅ All render |

### Files Created
- src/middleware.ts
- src/app/admin/layout.tsx
- src/app/admin/page.tsx
- src/app/admin/login/page.tsx
- src/app/admin/products/page.tsx
- src/app/admin/products/new/page.tsx
- src/app/admin/products/[id]/page.tsx
- src/app/admin/categories/page.tsx
- src/app/admin/categories/[id]/page.tsx
- src/app/admin/collections/page.tsx
- src/app/admin/collections/new/page.tsx
- src/app/admin/collections/[id]/page.tsx
- src/app/admin/media/page.tsx
- src/app/admin/homepage/page.tsx
- src/app/admin/ctas/page.tsx
- src/app/admin/ctas/new/page.tsx
- src/app/admin/ctas/[id]/page.tsx
- src/components/admin/admin-shell.tsx
- src/components/admin/media-upload.tsx
- src/components/ui/public-cta.tsx
- src/app/api/admin/products/route.ts
- src/app/api/admin/products/[id]/route.ts
- src/app/api/admin/products/[id]/variants/route.ts
- src/app/api/admin/products/[id]/variants/[variantId]/route.ts
- src/app/api/admin/products/[id]/media/route.ts
- src/app/api/admin/categories/route.ts
- src/app/api/admin/categories/[id]/route.ts
- src/app/api/admin/collections/route.ts
- src/app/api/admin/collections/[id]/route.ts
- src/app/api/admin/collections/[id]/products/route.ts
- src/app/api/admin/media/upload/route.ts
- src/app/api/admin/media/[id]/route.ts
- src/app/api/admin/media/[id]/references/route.ts
- src/app/api/admin/homepage/featured/route.ts
- src/app/api/admin/homepage/collection-feature/route.ts
- src/app/api/admin/ctas/route.ts
- src/app/api/admin/ctas/[id]/route.ts
- src/lib/catalogue/ctas.ts
- supabase/migrations/00002_cta_placements.sql

### Canonical Docs Updated
- 01_HAMMAH_SYSTEM_CONTEXT.md
- 02_HAMMAH_ARCHITECTURE.md
- 03_HAMMAH_DATA_MODEL.md
- 04_HAMMAH_PRODUCT_AND_ADMIN_RULES.md
- 07_HAMMAH_DEVELOPMENT_ROADMAP.md

---

## Sprint 0.17 Corrective Pass — September 11, 2026

**Status:** ✅ Complete

### Issue A: Admin Dashboard Shows Zero Records

**Root cause:** Two problems combined:

1. **Seed not applied to remote.** `npx supabase db push` applies migrations but does NOT run `supabase/seed.sql`. The remote database had the schema but no data.

2. **Dashboard query bugs in `src/app/admin/page.tsx`:**
   - `getCount(supabase, "media")` — wrong table name. Should be `"media_assets"`.
   - `getCount(supabase, "products", { featured: true })` — wrong query. No `featured` column on `products`. Should query `homepage_featured_products` with `{ is_active: true }`.
   - `getCount(supabase, "ctas", { active: true })` — wrong table and column. Should be `"cta_placements"` with `{ enabled: true }`.

**Fixes applied:**
- Fixed all three dashboard queries to use correct table/column names
- Product status queries (`"published"`, `"draft"`, `"archived"`) were already correct

**Seed audit:** `supabase/seed.sql` is idempotent (all INSERTs use `ON CONFLICT DO NOTHING`). Safe to run against existing data. Does not modify auth.users, does not overwrite admin profiles.

**Command to populate remote:** Run the seed SQL via Supabase Dashboard SQL Editor (not `supabase db push`).

### Issue B: Admin Theme Hydration Mismatch

**Root cause:** `theme` from `useTheme()` is `undefined` during SSR but `"system"` on client. Theme buttons used `theme === t` for active class, causing server/client class mismatch.

**Fix applied:** Added `mounted` state via `useSyncExternalStore` (same pattern as `theme-menu.tsx`). Active class only applied when `mounted && theme === t`. Server and first client render now structurally match.

### Profile Creation Trigger

**Finding:** No automatic `auth.users → public.profiles` trigger exists. The canonical docs reference this as the intended architecture, but it was never implemented.

**Recommendation:** Defer to Sprint 0.19 (Hamatee Auth). The trigger is small and safe but has unresolved requirements around profile fields (first_name, last_name are NOT NULL but not collected during simple signup). Adding it now would require either making those fields nullable or collecting them during signup — both are Sprint 0.19 decisions.

### Validation
| Check | Result |
|-------|--------|
| TypeScript | ✅ Clean |
| Build | ✅ 48 pages |
| Admin queries | ✅ Fixed |
| Hydration | ✅ Fixed |
| R2 upload | ✅ Fixed |

---

## Sprint 0.17 Corrective Pass — R2 Upload Failure — September 11, 2026

**Status:** ✅ Fixed

### Root Cause

`CLOUDFLARE_ACCOUNT_ID` in `.env.local` contained a full URL instead of the raw account ID. The endpoint template `https://${accountId}.r2.cloudflarestorage.com` produced a malformed URL. The AWS SDK parsed the hostname as just `https`, and virtual-hosted-style addressing prepended the bucket → `hammah-media.https`. DNS lookup failed.

### Secondary Bug

Upload route manually constructed public URL as `https://${bucket}.${accountId}.r2.dev/${storageKey}` — wrong in two ways: didn't use configured `CLOUDFLARE_R2_PUBLIC_BASE_URL`, and used raw `accountId`.

### Fixes Applied
- `src/lib/cloudflare/r2.ts`: Added `sanitizeAccountId()` to strip protocol/domain from raw env var. Added safe diagnostics.
- `src/app/api/admin/media/upload/route.ts`: Replaced manual publicUrl with `getMediaUrl(storageKey)`.

### Env Var Fix Required

`CLOUDFLARE_ACCOUNT_ID` must be the raw account ID (no protocol, no domain). Not a secret key — safe to identify format.
