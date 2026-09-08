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
