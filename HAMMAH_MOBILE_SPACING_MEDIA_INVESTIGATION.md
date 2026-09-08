# HAMMAH — Mobile Spacing + "In the Details" Media Rotation Investigation

## 1. Executive Summary

**Mobile spacing** is excessive because every content section uses `py-24` (192px total vertical padding) on mobile with no smaller responsive prefix. Combined with large internal grid gaps (`gap-12` = 48px) and generous child margins (`mb-12` = 48px, `mt-12` = 48px), sections feel much taller than their content requires. The issue is systemic — a consistent pattern across all sections, not a single rogue margin.

**"In the Details" images are static** because the component (`home-craft.tsx`) reads two fixed entries from the media manifest via `getMediaBySection("detail-craft")`, which resolves to Pixieset images #6 and #7. There is no randomisation or rotation. However, a production-quality `RotatingDetailImages` component already exists in the codebase (used on the Collection 001 page) that implements client-side randomised pair selection, timed crossfade rotation, intersection-aware pausing, and reduced-motion support. This existing component can be directly adapted for the homepage.

---

## 2. Mobile Spacing Findings

### Systemic Pattern

Every homepage content section uses the same mobile vertical padding:

```
py-24  (= 96px top + 96px bottom = 192px total)
```

This applies at all breakpoints below `md` (768px). There are no `sm:` overrides. On a 375px-wide phone screen, 192px of section padding is substantial — roughly 25% of the viewport height dedicated solely to padding.

The `Section` UI component (`src/components/ui/section.tsx`) defines a smaller `py-16 md:py-24` but is **not used by any homepage section**. Every section duplicates its own spacing.

### Per-Section Breakdown

| Section | Component | Section py (mobile) | Internal gaps (mobile) | Key contributors |
|---|---|---|---|---|
| **Collection 001** | `home-collection.tsx` | `py-24` (192px) | `mb-14` (56px) header, `mt-12` (48px) CTA | Header gap + CTA margin stack on top of section padding |
| **HAMMAH World** | `home-world.tsx` | `py-24` (192px) | `mb-12` (48px) header, `gap-6` (24px) grid | Single-column stacked cards with 24px gaps |
| **In the Details** | `home-craft.tsx` | `py-24` (192px) | `gap-12` (48px) main grid, `mt-12` (48px) secondary image | 48px gap between image zone and copy zone on mobile |
| **Featured Pieces** | `home-featured.tsx` | `py-24` (192px) | `mb-12` (48px) header, `gap-4` (16px) grid, `mt-10` (40px) CTA | Header + CTA margins compound |
| **Point of View** | `home-pov.tsx` | `py-24` (192px) | `gap-12` (48px) main grid, `mt-8`/`mt-10` (32/40px) copy | 48px grid gap on stacked single-column layout |
| **Legacy** | `home-legacy.tsx` | `py-24` (192px) | `gap-10` (40px) main grid, `mt-8` (32px) benefits + CTA | Image-first on mobile, 40px gap to copy |
| **FAQ** | `home-faq.tsx` | `py-24` (192px) | `gap-12` (48px) main grid, `py-5` (40px) per question | 48px gap + generous accordion padding |
| **Closing** | `home-closing.tsx` | `h-[70svh]` min-h 480px | `mt-5`/`mt-8` (20/32px) | Viewport-height section, not padding-based |

### Specific High-Impact Causes

1. **Section padding (`py-24`)**: 192px per section × 7 sections = **1,344px** of pure vertical padding on mobile. This is the dominant contributor.

2. **Grid gaps on single-column layouts**: `gap-12` (48px) in Craft, POV, and FAQ creates a large visual break between the image and copy when they stack vertically on mobile. On desktop this 48px gap is between two side-by-side columns; on mobile it becomes vertical separation.

3. **`mt-12` on secondary image in `home-craft.tsx`** (line 46): This pushes the second detail image 48px below the first on mobile, creating excessive vertical space within the image zone.

4. **Header margins (`mb-12` to `mb-14`)**: 48–56px between the section header and content adds up across sections.

5. **CTA margins (`mt-10` to `mt-12`)**: 40–48px above calls-to-action at section bottoms.

### What Is Intentional vs Accidental

| Spacing | Verdict | Reasoning |
|---|---|---|
| `py-24` on desktop (`md:py-36`) | Intentional | Large screens need more breathing room |
| `py-24` on mobile | **Likely too large** | 192px is excessive on 375px screens; `py-16` (128px) or `py-12` (96px) would be more appropriate |
| `gap-12` on desktop | Intentional | Editorial spacing between side-by-side columns |
| `gap-12` on mobile | **Accidental** | Desktop gap inherited into single-column stacking; should be smaller on mobile |
| `mt-12` on secondary image | **Accidental** | Desktop vertical offset creates too much mobile separation |
| `mb-12`/`mb-14` headers | Borderline | Could reduce to `mb-8`/`mb-10` on mobile |

### Risk Assessment

Reducing mobile spacing is low-risk because:
- No images overlap or depend on large gaps for positioning
- The header is fixed and separated by a spacer div — not affected by section padding
- The footer sits below all sections — not affected by internal section spacing
- Content is not at risk of clipping since sections use `overflow-visible` (default)
- The only concern is maintaining sufficient editorial breathing room — the brand is premium/fashion and needs some negative space

Recommended mobile targets: `py-16` (128px) for standard sections, `gap-6`/`gap-8` (24–32px) for mobile grid gaps.

---

## 3. "In the Details" Current Architecture

### Component

**File:** `src/components/home/home-craft.tsx` (98 lines)
**Export:** `HomeDetailCraft`

### Image Resolution Chain

```
HomeDetailCraft
  └─ getMediaBySection("detail-craft")        [media-manifest.ts]
       └─ mediaManifest.filter(m => m.section === "detail-craft")
            ├─ { id: "home-craft-01", currentSrc: u(6), ... }
            └─ { id: "home-craft-02", currentSrc: u(7), ... }
                 └─ u(n) helper                [media-manifest.ts]
                      └─ COLLECTION_001_PIXIESET[n - 1]?.url  [pixieset-collection-001.ts]
```

### Current Images

| Slot | Pixieset # | URL | Alt text |
|---|---|---|---|
| Primary (col-span-3) | #6 | `https://images.pixieset.com/638827911/ee1f0f1ed7d0b579cdf95ff10ab0f88b-large.jpg` | "Detail — print close-up" |
| Secondary (col-span-2) | #7 | `https://images.pixieset.com/638827911/4d276016ae019f34e10cedfa4e2205f8-large.jpg` | "Detail — construction close-up" |

### Behaviour

- Images are **completely static** — the same two images for every visitor, every page load, forever
- No randomisation, no rotation, no variation
- Both images render simultaneously on page load
- No intersection observer — images load even if section is far below the fold
- The component is `"use client"` but has no state, no effects, no timers

### Layout Structure (mobile)

On mobile (`grid-cols-1`), the layout stacks:
1. Eyebrow "In the Details"
2. Primary image (aspect 3/4)
3. Secondary image (aspect 3/4, with `mt-12` = 48px offset)
4. Heading "Look closer."
5. Brand logo
6. Two paragraphs of copy

---

## 4. Existing Media Pool Architecture

### Pool Source

**File:** `src/data/pixieset-collection-001.ts`
**Pool size:** 160 images
**URL format:** `https://images.pixieset.com/638827911/{hash}-large.jpg`
**Domain configured in:** `next.config.ts` (`images.remotePatterns`)

### Media Manifest

**File:** `src/data/media-manifest.ts`
**Purpose:** Maps named media slots to specific Pixieset URLs for each page/section
**Query functions:** `getMediaById()`, `getMediaBySection()`, `getMediaByRoute()`, `getMediaByRouteAndSection()`

### Existing Rotation Component

**File:** `src/components/editorial/rotating-detail-images.tsx` (142 lines)
**Used on:** Collection 001 page only (`src/app/(public)/collections/collection-001/page.tsx`)
**NOT used on:** Homepage

This component already implements:
- Client-side random pair selection from the full 160-image pool (`pickPair()`)
- Collision avoidance (won't repeat either image from the previous pair)
- Timed crossfade rotation (configurable, default 5s after 2s initial delay)
- IntersectionObserver (pauses when section scrolls out of view, threshold 0.2)
- `prefers-reduced-motion` support (disables animation, uses instant swap)
- Preloading of next image pair during crossfade
- `AnimatePresence` crossfade with scale micro-animation

---

## 5. Recommended Dynamic Image Strategy

### Reuse `RotatingDetailImages`

The existing `RotatingDetailImages` component is production-quality and directly reusable. It needs only minor adaptation:

1. **Extract `pickPair()` to a shared utility** (or import directly) so the homepage component can use it
2. **Adapt the grid layout** — the homepage "In the Details" uses a 5-column asymmetric grid (col-span-3 + col-span-2) on desktop, not the 2-column grid in `RotatingDetailImages`
3. **Use `initialPair` prop** — pass two random starting images generated client-side after hydration

### Image Selection Pool

Use the full 160-image `COLLECTION_001_PIXIESET` pool. The `pickPair()` function already handles random selection from this pool with collision avoidance. No subset filtering is needed — the pool contains fashion photography suitable for detail/close-up contexts.

### Randomisation Approach

**Client-side after hydration** — this is the correct approach because:
- Avoids hydration mismatch (server renders a placeholder, client hydrates with random selection)
- No server-side seed needed
- Each visitor gets a different pair naturally
- Simple to implement with `useState` + `useEffect`

Implementation pattern:
```tsx
const [pair, setPair] = useState<[string, string]>(["", ""]);

useEffect(() => {
  setPair(pickPair(["", ""]));
}, []);
```

The empty-string initial state renders nothing until hydration, then the effect fires and sets random images. This is a single flash — the section is likely below the fold anyway.

### Rotation Interval

**Recommended: 7 seconds**

Rationale:
- 5 seconds feels too rapid for a detail/close-up section — viewers need time to study the photography
- 10 seconds is too slow — the section may scroll out of view before a rotation happens
- 7 seconds provides a comfortable viewing window while the section is visible
- The existing `RotatingDetailImages` uses 5s — increase to 7s for the homepage context where the section is further down the page

### Transition

Use the existing `AnimatePresence` crossfade from `RotatingDetailImages`:
- Duration: 0.6s
- Ease: `[0.25, 0.1, 0.25, 1]`
- Exit: opacity fade out
- Enter: opacity fade in + subtle scale 1.015 → 1

### Staggered Rotation

**Do not change both images simultaneously.** Alternate which slot rotates:
- Odd rotations: replace slot 0 (primary)
- Even rotations: replace slot 1 (secondary)

This requires tracking which slot to rotate next (`useState<number>` toggling 0/1).

### Performance

- **Preloading:** Use `new Image().src = url` to preload the incoming pair before the crossfade starts (already implemented in `RotatingDetailImages`)
- **No layout shift:** Both slots have fixed `aspect-[3/4]` containers — image swaps happen within pre-sized containers
- **Intersection-aware:** Only rotate when the section is visible (threshold 0.2) — already implemented
- **Lazy loading:** Only the initial pair needs `loading="eager"`; rotated images load lazily
- **URL data only:** The 160-entry `COLLECTION_001_PIXIESET` array is a small JSON-like structure (~12KB) — no performance concern loading the full pool

### Mobile/Desktop

- **Same image pair on both breakpoints** — the pool images are high-resolution and work with `object-cover` cropping at any aspect ratio
- **Mobile uses `object-cover`** within the same `aspect-[3/4]` containers — no portrait-specific selection needed
- **No horizontal overflow risk** — images are inside fixed-aspect containers with `overflow-hidden`

---

## 6. Files That Would Need Modification

### Mobile Spacing (Issue 1)

| File | Change |
|---|---|
| `src/components/home/home-collection.tsx` | Reduce `py-24` → `py-16` on mobile; reduce `mb-14` → `mb-10` |
| `src/components/home/home-world.tsx` | Reduce `py-24` → `py-16` on mobile; reduce `mb-12` → `mb-8` |
| `src/components/home/home-craft.tsx` | Reduce `py-24` → `py-16` on mobile; reduce `gap-12` → `gap-8`; remove `mt-12` on mobile for secondary image |
| `src/components/home/home-featured.tsx` | Reduce `py-24` → `py-16` on mobile; reduce `mb-12` → `mb-8` |
| `src/components/home/home-pov.tsx` | Reduce `py-24` → `py-16` on mobile; reduce `gap-12` → `gap-8` |
| `src/components/home/home-legacy.tsx` | Reduce `py-24` → `py-16` on mobile; reduce `gap-10` → `gap-8` |
| `src/components/home/home-faq.tsx` | Reduce `py-24` → `py-16` on mobile; reduce `gap-12` → `gap-8` |

### "In the Details" Rotation (Issue 2)

| File | Change |
|---|---|
| `src/components/home/home-craft.tsx` | Replace static `<img>` tags with rotation logic; add `useState`/`useEffect` for pair rotation; add `IntersectionObserver`; add `AnimatePresence` crossfade |
| `src/components/editorial/rotating-detail-images.tsx` | Extract `pickPair()` to a shared utility (or import as-is) |

No new files required. No new dependencies. No backend changes.

---

## 7. Fix Plan

### Phase 1: Mobile Spacing

For each affected homepage section component:

1. Add `max-md:` or responsive prefix to reduce `py-24` to `py-16` (or `py-12` for tighter sections)
2. Reduce mobile grid gaps: `gap-12` → `gap-8` with `md:gap-12` preserved
3. Reduce header margins on mobile: `mb-12`/`mb-14` → `mb-8`/`mb-10`
4. Remove or reduce `mt-12` on secondary image in `home-craft.tsx` for mobile
5. Preserve all `md:` breakpoint values unchanged

### Phase 2: "In the Details" Rotation

1. Copy `pickPair()` from `rotating-detail-images.tsx` into `home-craft.tsx` (or import it)
2. Add `useState` for the image pair (initialised to empty strings)
3. Add `useEffect` to set random pair on mount (client-side only)
4. Add rotation timer with 7s interval
5. Add `IntersectionObserver` to pause rotation when not visible
6. Wrap each `<img>` in `AnimatePresence` for crossfade
7. Stagger rotation between the two slots (alternate which one changes)
8. Respect `prefers-reduced-motion`
9. Preload incoming images before crossfade
10. Verify no layout shift (aspect-ratio containers handle this)

---

## 8. Risks / Regression Areas

| Risk | Severity | Mitigation |
|---|---|---|
| **Hydration mismatch** | Medium | Use `useState("")` + `useEffect` pattern — server renders empty, client hydrates with random selection. The section is typically below the fold so the flash is imperceptible. |
| **Layout shift** | Low | Both image slots use fixed `aspect-[3/4]` containers with `overflow-hidden`. Images swap within pre-sized boxes. |
| **Image loading** | Low | Preload incoming pair with `new Image()`. The pool URLs are on a CDN (Pixieset) with browser caching. |
| **Mobile spacing over-correction** | Medium | Reduce incrementally (py-24 → py-16, not → py-8). Check each section visually after changes. Maintain editorial breathing room — this is a premium fashion brand. |
| **Repeated images** | Low | `pickPair()` already checks against the previous pair. With 160 images and 2-slot selection, collision probability is ~1.3% per rotation. |
| **Remote image failures** | Low | Pixieset CDN is reliable. No fallback needed for prototype. Could add `onError` handler later. |
| **Accessibility / reduced motion** | Low | `RotatingDetailImages` already handles this. Port the same `useReducedMotion` check. |
| **Intersection observer edge cases** | Low | Use threshold 0.2 (20% visible) — same as existing implementation. |
| **Header/footer collision** | None | Section padding changes don't affect the fixed header spacer or footer positioning. |
| **Desktop regression** | None | All spacing changes use `max-md:` prefix — desktop values remain identical. |
