# SPRINT 0.9 — HANDOFF STATE
## Date: August 25, 2026
## Status: PARTIALLY COMPLETE — hand off for remaining work

---

# WHAT HAS BEEN DONE

## 1. Swiper Installed
- `swiper` package added via npm (`npm install swiper`)
- No other package changes made
- `package.json` now includes `swiper` in dependencies

## 2. Typography System Added to globals.css
Added reusable type classes at the bottom of `src/app/globals.css`:
- `.type-hero` — clamp(2.5rem, 6vw, 4.5rem) mobile / clamp(3.5rem, 7vw, 7.5rem) desktop
- `.type-statement` — clamp(1.5rem, 3vw, 2.5rem)
- `.type-headline` — clamp(2rem, 4.5vw, 4rem)
- `.type-eyebrow` — 0.75rem uppercase tracking
- `.type-body` — clamp(1rem, 1.25vw, 1.25rem)
- `.type-cta` — 1rem mobile / 1.125rem desktop
- Swiper custom styles (`.collection-swiper` — 82% slide width, styled pagination bullets)

**These are safe to use on other public pages if they improve quality.**

## 3. Redesigned Components (4 of 8 homepage sections)

### home-hero.tsx ✅ FULLY REWRITTEN
- Larger headline via `.type-hero`
- Layered gradient overlay with radial vignette for depth
- Eyebrow uses `.type-eyebrow`
- Supporting copy uses `.type-body`
- CTAs increased to h-14 with px-8, hover shadow effects
- Scroll cue refined with gradient line
- Video architecture preserved (autoplay/muted/loop/playsInline)
- Reduced motion respected

### home-collection.tsx ✅ FULLY REWRITTEN
- Desktop: 12-col asymmetric grid (7-col large primary + 5-col stacked secondaries) instead of flat 4-col
- **Mobile: Uses CSS snap-scroll (NOT actual Swiper)** — 82% card width, snap-mandatory, peek effect
  - ⚠️ Sprint doc says "use Swiper properly" — this needs to be replaced with actual Swiper component
- Eyebrow, headline, body text elevated with type classes
- CTA changed to button style (h-12, accent bg, hover shadow)
- Mobile scroll indicator dots added

### home-craft.tsx ✅ FULLY REWRITTEN
- Desktop: 12-col layout with 7-col image zone (asymmetric 3/5 + 2/5 grid)
- Large primary image left, offset secondary image right with mt-12 offset
- "Look closer." now uses `.type-headline` (was text-3xl)
- Added supporting copy from HAMMAH_PUBLIC_CONTENT.txt
- Eyebrow added
- Body text elevated

### home-pov.tsx ✅ FULLY REWRITTEN
- "Made for the person wearing it..." now uses `.type-statement`
- Supporting copy uses `.type-body`, larger mt-8
- CTA changed from plain text link to styled button (border, backdrop-blur, hover shadow)
- Image gets hover scale effect

---

# WHAT HAS NOT BEEN DONE (picks up here)

## 4. Remaining Components NOT Touching typography

These 4 components have NOT been upgraded yet. They still use the old smaller text classes:

### home-world.tsx (The Hammah World — category cards)
- Still uses `text-3xl md:text-5xl` instead of type classes
- Category labels still `text-2xl md:text-4xl`
- Background is `bg-surface` — no rhythm change needed
- Recommended: Upgrade h2 to `.type-headline`, category labels to `.type-statement`
- **Low priority** — this section already has decent hierarchy from the card overlay treatment

### home-featured.tsx (Featured Pieces — product grid)
- Still uses `text-3xl md:text-5xl`
- Still uses plain text link CTA
- Recommended: Upgrade h2, change CTA to button style matching other sections
- **Low priority**

### home-legacy.tsx (Legacy — membership)
- Still uses `text-3xl md:text-5xl`
- CTA is already button-style (h-12, accent) — matches new style
- Recommended: Upgrade h2 to `.type-headline`, supporting text to `.type-body`
- **Low priority**

### home-closing.tsx (Closing campaign)
- Still uses `text-4xl md:text-6xl`
- CTA is already button-style
- Recommended: Upgrade h2 to `.type-hero` or `.type-headline`, supporting text to `.type-body`
- **Medium priority** — this is the last impression

## 5. Mobile Swiper — NOT ACTUALLY IMPLEMENTED

The sprint doc explicitly says:
> "On mobile, this section must use Swiper. Requirements: use Swiper properly; one main card visible; the next card should be slightly visible / peeking into the viewport"

**Current state:** home-collection.tsx uses CSS snap-scroll, not Swiper.

**What needs to happen:**
1. Import Swiper: `import { Swiper, SwiperSlide } from 'swiper/react'` and `import 'swiper/css'`
2. Replace the mobile div scroll section with a proper `<Swiper>` component
3. Set `slidesPerView: 1.15` or `spaceBetween` with `breakpoints` to show peeking
4. Add `pagination={{ clickable: true }}` styled to match Hammah
5. Wrap in dynamic import or ensure no SSR issues (Swiper needs `dynamic` or client-only)

**Example implementation:**
```tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// In the mobile section:
<Swiper
  modules={[Pagination]}
  slidesPerView={1.15}
  spaceBetween={12}
  pagination={{ clickable: true }}
  className="collection-swiper md:hidden"
>
  {media.map((slot) => (
    <SwiperSlide key={slot.id}>
      {/* card content */}
    </SwiperSlide>
  ))}
</Swiper>
```

The `.collection-swiper` CSS is already in globals.css.

## 6. Shared Typography Safety Pass — NOT DONE

After finishing homepage, check these routes for regressions:
- `/shop`
- `/collections/collection-001`
- `/our-story`
- `/legacy`
- `/login`
- `/signup`
- `/track`

The type classes are opt-in (new CSS classes, not changing existing Tailwind utilities), so regressions are unlikely but should be verified visually.

## 7. Homepage Rhythm/Spacing Audit — NOT DONE

After all sections are updated, review the full flow:
- Hero → Collection 001 → Hammah World → Detail/Craft → Featured → POV → Legacy → Closing
- Check for awkward spacing jumps, repeated patterns, uneven energy

## 8. CTA Treatment Pass — NOT DONE

Audit all CTAs across homepage:
- Should feel deliberate, not undersized
- Pattern established: h-12 to h-14 buttons with accent bg or bordered surface bg
- Plain text-arrow links should be upgraded to buttons where they're primary actions

## 9. Build Validation — NOT DONE

Run:
```bash
npx tsc --noEmit
npm run lint
npm run build
```
Fix any issues.

## 10. Documentation — NOT DONE

### HAMMAH_SPRINT_REPORT.md
Append a `## Sprint 0.9 — Homepage UI Redesign + Typography Elevation` section.

### SPRINT_LOG.md
Append Sprint 0.9 entry with date, objective, sections touched, validation, blockers, next phase.

---

# CRITICAL NOTES FOR NEXT INSTANCE

1. **Do NOT re-read or rewrite home-hero.tsx, home-collection.tsx, home-craft.tsx, or home-pov.tsx** — they are already done. Only touch home-world.tsx, home-featured.tsx, home-legacy.tsx, home-closing.tsx if upgrading their typography.

2. **Do NOT touch the hero video** — `/herovideo.mp4` with autoplay/muted/loop/playsInline is approved and working.

3. **Do NOT add Appwrite, backend, auth, admin routes, or Hamatee routes** — this sprint is pure UI polish.

4. **Do NOT create a new sprint report file** — only append to existing HAMMAH_SPRINT_REPORT.md and SPRINT_LOG.md.

5. **The type classes in globals.css are the typography system** — use them, don't create new ones. Apply them intentionally, not blindly.

6. **Swiper is installed but NOT integrated** — the collection section mobile view needs the actual Swiper component, not CSS scroll-snap.

7. **All Pixieset images are remote URLs** — no next/image optimization, use plain `<img>` tags with lazy loading (existing pattern).

8. **Existing project conventions:** "use client" on all interactive components, motion from "motion/react", Reveal/MediaReveal/TextReveal/Stagger for animations, Container for max-width, all sections use Container + py-24 md:py-36 (updated from py-20 md:py-32).

9. **Files changed so far:**
   - `src/app/globals.css` — typography system + Swiper styles added
   - `src/components/home/home-hero.tsx` — full rewrite
   - `src/components/home/home-collection.tsx` — full rewrite (mobile needs Swiper swap)
   - `src/components/home/home-craft.tsx` — full rewrite
   - `src/components/home/home-pov.tsx` — full rewrite
   - `src/components/home/home-detail-craft.tsx` — was created by mistake, DELETED

10. **No files were deleted or renamed from the original structure.** Import paths in page.tsx remain valid.
