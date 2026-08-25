# HAMMAH DESIGN SYSTEM AND EXPERIENCE SPECIFICATION

**Brand:** SL by Hammah  
**Platform:** HAMMAH  
**Member Experience:** The Hammah Legacy  
**Registered Member:** Hamatee  
**Document Type:** Design System, UX and Interaction Specification  
**Version:** 1.0  
**Status:** Approved Design Baseline  
**Date:** 20 August 2026

---

# 1. PURPOSE OF THIS DOCUMENT

This document defines how the HAMMAH digital platform should look, feel and behave across:

- the public storefront;
- product discovery;
- product detail experiences;
- guest ordering;
- authentication;
- The Hammah Legacy;
- order tracking;
- administrative interfaces;
- responsive layouts;
- motion;
- Three.js/WebGL experiences;
- loading, empty and error states;
- accessibility;
- performance-sensitive visual behaviour.

The objective is not simply to create an attractive ecommerce interface.

HAMMAH must feel like a digital extension of **SL by Hammah**: deliberate, premium, editorial, culturally confident and contemporary.

The system should create memorable moments without allowing those moments to interfere with product discovery, ordering or mobile usability.

---

# 2. CORE DESIGN IDEA

The design direction is:

> **Editorial commerce with controlled spatial interaction.**

HAMMAH should combine three qualities:

1. **Editorial restraint**  
   Strong photography, typography, spacing and composition.

2. **Commerce clarity**  
   Products, prices, options and ordering must remain immediately understandable.

3. **Selective digital spectacle**  
   Motion, depth, 3D and cinematic sequences should appear at specific moments where they meaningfully elevate the brand.

The website must not feel like:

- a Shopify template with animations;
- a generic luxury-fashion clone;
- a WebGL experiment with products attached;
- a corporate dashboard;
- an AI-generated design system;
- an interface filled with unnecessary gradients, glass effects or decorative cards.

---

# 3. EXPERIENCE PRINCIPLES

## 3.1 The product remains the hero

Photography and garments should dominate.

Interface decoration must never compete with the product.

---

## 3.2 Restraint creates premium perception

HAMMAH should use:

- large visual breathing space;
- confident typography;
- deliberate scale;
- limited colour;
- controlled animation;
- strong photographic framing.

The system should not need excessive decoration to communicate quality.

---

## 3.3 Motion must have a reason

Every significant animation should achieve at least one of the following:

- explain spatial hierarchy;
- guide attention;
- reveal content;
- communicate a state change;
- create continuity between pages;
- make product discovery feel tactile;
- reinforce brand personality.

If an animation has no functional or emotional purpose, it should not exist.

---

## 3.4 Mobile is not reduced desktop

Mobile should be designed intentionally.

Desktop may receive richer:

- parallax;
- cursor interactions;
- multi-column editorial layouts;
- large-format motion;
- 3D treatments.

Mobile should receive equivalent brand quality through:

- strong image sequencing;
- touch interaction;
- carefully composed typography;
- restrained animation;
- vertical storytelling;
- fast product access.

---

## 3.5 Commerce flows should become progressively simpler

The closer the user gets to ordering, the less visually experimental the interface should become.

Example:

```text
Homepage
High expression

↓
Collection
Moderate expression

↓
Product
Product-led expression

↓
Order configuration
High clarity

↓
Order confirmation
Maximum clarity
```

---

# 4. BRAND DESIGN FOUNDATION

HAMMAH must build upon the existing SL by Hammah identity rather than replacing it.

---

# 5. COLOUR SYSTEM

## 5.1 Primary colours

### Ink

```css
--hammah-ink: #111110;
```

Primary uses:

- primary text;
- logo;
- dark backgrounds;
- navigation;
- borders on dark surfaces;
- important controls.

Pure black should not replace Ink unless technically necessary.

---

### Warm White

```css
--hammah-warm-white: #F7F5F1;
```

Primary uses:

- default site background;
- large editorial surfaces;
- product information backgrounds;
- content areas.

---

### Accent Brown

```css
--hammah-accent: #7A5C3E;
```

Primary uses:

- selected links;
- subtle active states;
- privilege details;
- stitching-inspired visual motifs;
- small badges;
- carefully chosen callouts.

The accent must remain secondary.

It should not become:

- a full-page default background;
- a large gradient treatment;
- the universal CTA colour;
- the dominant logo colour.

---

# 6. SUPPORTING COLOUR TOKENS

Secondary UI colours may be introduced for system communication, but they should remain muted and compatible with the core brand.

Conceptual tokens:

```css
--hammah-surface: #F7F5F1;
--hammah-surface-elevated: #FFFFFF;

--hammah-text-primary: #111110;
--hammah-text-secondary: rgba(17, 17, 16, 0.68);
--hammah-text-muted: rgba(17, 17, 16, 0.48);

--hammah-border-soft: rgba(17, 17, 16, 0.12);
--hammah-border-strong: rgba(17, 17, 16, 0.28);

--hammah-overlay-dark: rgba(17, 17, 16, 0.65);
```

Functional colours such as error, success and warning colours may be introduced where necessary but should not become general decorative colours.

---

# 7. COLOUR USAGE RULE

A useful design rule:

> If a composition appears to require another decorative colour, first improve hierarchy, typography, spacing or imagery.

This keeps HAMMAH visually disciplined.

---

# 8. TYPOGRAPHY

## 8.1 Display typography

**Instrument Serif Italic**

Used selectively for:

- campaign headlines;
- positioning statements;
- hero phrases;
- major editorial moments;
- section introductions;
- selected Legacy moments.

It should feel intentional and special.

It must not be used for:

- navigation;
- buttons;
- form labels;
- product specifications;
- body paragraphs;
- small captions;
- admin UI.

---

## 8.2 Interface and heading typography

**DM Sans**

Primary digital typeface.

### Bold / Semibold

Used for:

- headings;
- product names;
- prices;
- selected navigation;
- buttons;
- critical labels.

### Regular

Used for:

- body text;
- navigation;
- controls;
- descriptions;
- order information.

### Light

May be used for:

- large supporting copy;
- selected editorial passages.

Light weights must not compromise readability.

---

# 9. TYPOGRAPHIC HIERARCHY

Illustrative desktop hierarchy:

```text
Display Hero
56–96px+

Editorial H1
48–72px

Page H1
40–56px

Section H2
28–40px

Product Name
22–32px

Card Heading
18–24px

Body Large
18–20px

Body
15–18px

Label
12–14px

Micro
11–12px
```

Mobile typography should scale deliberately rather than simply shrinking desktop values.

A mobile hero should remain expressive without causing:

- three-word-per-line wrapping;
- clipped typography;
- excessive vertical height;
- unreadable overlays.

---

# 10. TYPOGRAPHY AND MOTION

Text reveal effects should favour:

- opacity;
- translation;
- clipping;
- line masking;
- controlled stagger.

Avoid:

- random letter scrambling;
- overused typewriter effects;
- aggressive character rotation;
- excessive bouncing;
- continuous text animation.

Typography should feel composed rather than animated for novelty.

---

# 11. SPACING SYSTEM

HAMMAH should use a consistent spacing scale.

Suggested baseline:

```text
4
8
12
16
24
32
40
48
64
80
96
128
160
```

Large editorial sections may intentionally exceed this scale.

Spacing should create visible hierarchy between:

- global sections;
- content groups;
- product information;
- controls;
- cards;
- metadata.

---

# 12. LAYOUT PHILOSOPHY

The public website should combine:

- asymmetric editorial compositions;
- controlled full-bleed imagery;
- conventional product grids;
- large negative space;
- occasional overlapping compositions;
- responsive reflow.

The experience should not be based entirely on cards.

Use cards only when they improve:

- grouping;
- scanning;
- product comparison;
- actions;
- information separation.

---

# 13. RESPONSIVE BREAKPOINT PHILOSOPHY

Exact breakpoints may follow Tailwind defaults or project-specific refinements.

Conceptually:

```text
Mobile
320–767px

Tablet
768–1023px

Desktop
1024px+

Large Editorial Desktop
1440px+
```

The design should be evaluated at:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- 1024px;
- 1280px;
- 1440px;
- 1920px.

---

# 14. PUBLIC SITE INFORMATION ARCHITECTURE

Recommended initial top-level navigation:

```text
Home
Shop
Collections
Our Story
The Legacy
```

Supporting utilities:

```text
Search
Saved
Account
Bag / Order Intent
```

A conventional ecommerce cart may not be required in V1.

If multiple pieces can be submitted together, the interface may use terminology such as:

- Selection;
- Order;
- Your Pieces;

rather than forcing traditional cart language.

Final terminology should remain intuitive.

---

# 15. GLOBAL HEADER

The public header should be visually restrained.

Desktop may include:

- logo;
- principal navigation;
- search;
- saved;
- account;
- optional order indicator.

Mobile should prioritise:

- logo;
- menu trigger;
- account;
- relevant commerce action.

The header may transition between:

- transparent over hero;
- solid warm-white;
- dark state over imagery.

Transitions must remain readable.

---

# 16. HEADER BEHAVIOUR

Sticky behaviour is recommended where it improves navigation.

The header should:

- minimise vertical footprint after scroll;
- avoid constant animation;
- maintain contrast;
- avoid obstructing product photography;
- provide reliable mobile access.

---

# 17. MOBILE MENU

The mobile menu should feel integrated with the brand.

It may use:

- full-screen overlay;
- large navigation typography;
- subtle imagery;
- restrained reveal motion.

It should not use:

- excessive nested accordions;
- tiny text;
- visually noisy icon grids.

Primary navigation should remain immediately visible.

---

# 18. HOMEPAGE STRUCTURE

The homepage should not be designed as a stack of unrelated marketing modules.

Recommended narrative:

```text
01 — Campaign / Arrival
02 — Current Collection
03 — Product Discovery
04 — Material / Detail
05 — Brand Point of View
06 — Selected Products
07 — Legacy Invitation
08 — Supporting Story
09 — Footer
```

Exact structure may change according to available campaign assets.

---

# 19. HOMEPAGE HERO

The hero is one of the primary opportunities for a signature HAMMAH interaction.

It should combine:

- professional campaign imagery or video;
- restrained typography;
- brand positioning;
- one clear discovery action.

Potential CTA:

```text
Explore Collection
```

Secondary action:

```text
Join the Legacy
```

The hero should not contain five competing buttons.

---

# 20. HERO MOTION

Desktop may include:

- controlled scale;
- layered parallax;
- image masking;
- cursor-responsive depth;
- progressive image reveal;
- subtle 3D treatment.

Mobile may replace expensive effects with:

- cinematic video;
- controlled cross-fade;
- vertical image sequence;
- simple depth motion.

The mobile hero must become interactive quickly.

---

# 21. SCROLLYTELLING

Scrollytelling should be used selectively.

Good candidates include:

- fabric story;
- construction details;
- campaign narrative;
- African-print inspiration;
- brand philosophy.

Scrollytelling should not be used for:

- checkout/order forms;
- product options;
- authentication;
- order tracking;
- admin.

---

# 22. SCROLL BEHAVIOUR

Avoid aggressive scroll hijacking.

Do not prevent users from:

- scrolling naturally;
- navigating quickly;
- using keyboard controls;
- using browser navigation.

Pinned sections may be used sparingly.

---

# 23. SHOP EXPERIENCE

The Shop should prioritise product discovery over visual experimentation.

Recommended structure:

```text
Shop Header
Collection / Category Controls
Product Grid
Optional Editorial Break
More Products
```

Filters should appear only when product volume justifies them.

At launch with eight products, excessive filtering would be unnecessary.

---

# 24. PRODUCT GRID

Desktop:

- 2–4 columns depending on viewport and photography;
- generous image ratio;
- product information below or revealed subtly.

Mobile:

- generally 1–2 columns;
- large enough imagery to understand fabrics;
- comfortable tap targets.

Product cards should display only necessary information.

Typical card:

```text
Image
Product Name
Price / Price on Request
Availability state
Optional category/collection
```

---

# 25. PRODUCT CARD INTERACTION

Desktop hover may:

- transition between poses;
- reveal detail photography;
- subtly scale image;
- expose secondary information.

Mobile should support:

- swipeable image preview where appropriate;
- no hidden mandatory controls.

Hover must remain enhancement only.

---

# 26. PRODUCT DETAIL PAGE

The product page is the main commercial decision surface.

It should prioritise:

1. seeing the garment;
2. understanding the garment;
3. configuring it;
4. ordering it.

---

# 27. PRODUCT DETAIL DESKTOP LAYOUT

Recommended structure:

```text
LEFT / PRIMARY
Large media gallery

RIGHT / STICKY
Product Name
Price
Short Description
Availability
Options / Size
Quantity
Primary Order CTA
Save
Delivery note
Size guide
Additional information
```

The purchasing panel may remain sticky while the gallery scrolls where appropriate.

---

# 28. PRODUCT DETAIL MOBILE LAYOUT

Recommended:

```text
Media
↓
Product Name
Price
Description
Options
Size
Availability
Primary CTA
Delivery summary
Expandable details
Related products
```

The main CTA may use a sticky bottom action once the user has scrolled beyond the initial purchasing controls.

---

# 29. PRODUCT MEDIA GALLERY

Product pages should support:

- model photography;
- alternate poses;
- close-ups;
- garment details;
- campaign shots;
- video;
- optional 360/3D view.

The gallery should not force all media into identical aspect ratios.

---

# 30. IMAGE VIEWER

Users should be able to inspect high-resolution product media.

Desktop:

- click to enlarge;
- zoom;
- keyboard navigation.

Mobile:

- pinch/zoom where technically appropriate;
- swipe;
- fullscreen viewer.

---

# 31. PRODUCT VIDEO

Video should:

- remain muted by default;
- avoid autoplay audio;
- use compressed delivery formats;
- include poster imagery;
- lazy-load where appropriate.

Video should enhance fabric and fit perception.

---

# 32. 360 / 3D PRODUCT MODE

If implemented:

```text
Photos
Video
360°
```

should remain separate views.

3D must never replace real photography.

Users should immediately understand that 3D is an optional viewing mode.

---

# 33. PRODUCT OPTIONS

Product configuration controls must be explicit.

Example:

```text
Size
30  32  34  36
```

Unavailable options should be visually disabled rather than removed where possible.

Selected options need:

- visible state;
- accessible state;
- text indication beyond colour alone.

---

# 34. SIZE GUIDE

The size guide should open:

- as a responsive modal;
- drawer;
- bottom sheet on mobile.

It should not navigate users completely away from the product unless necessary.

---

# 35. PRIMARY ORDER CTA

HAMMAH should not use generic wording such as:

```text
Submit
```

for the primary commerce interaction.

Preferred wording may include:

```text
Order This Piece
Make This Yours
Request This Piece
```

Final copy should remain clear enough that users understand an order request is being created.

---

# 36. ORDER CONFIGURATION EXPERIENCE

The order flow should be clean and low-friction.

Recommended guest flow:

```text
Product
↓
Configuration
↓
Contact
↓
Delivery
↓
Review
↓
Order Created
↓
WhatsApp
```

This may use a modal, drawer or dedicated route depending on implementation.

For mobile, a dedicated full-screen flow may be more usable than a constrained modal.

---

# 37. ORDER PROGRESS INDICATOR

For multi-step ordering, show simple progress.

Example:

```text
1 Details
2 Delivery
3 Review
```

Avoid decorative multi-step diagrams.

---

# 38. GUEST CONTACT FORM

Required:

- Name
- Phone / WhatsApp

Optional:

- Email

Inputs should:

- have persistent labels;
- display errors close to the relevant field;
- maintain entered data after validation failure;
- support appropriate mobile keyboard types.

---

# 39. DELIVERY FORM

Fields:

- Region
- City / Town
- Area
- Landmark
- GhanaPost GPS / Digital Address
- Delivery Notes

Use progressive disclosure where possible.

Not every field needs equal visual prominence.

---

# 40. ORDER REVIEW

Before submission, users should see:

- product image;
- product;
- variant;
- size;
- quantity;
- displayed price or Price on Request;
- customer details;
- delivery summary.

Primary action:

```text
Place Order Request
```

The interface must communicate that payment is not necessarily being taken at this point.

---

# 41. ORDER CONFIRMATION

After successful creation:

```text
Your order request is in.
```

Show:

- reference;
- product summary;
- next step;
- tracking link;
- WhatsApp CTA.

WhatsApp should appear as the continuation of the process, not the place where the order begins.

---

# 42. WHATSAPP HANDOFF

The WhatsApp CTA should communicate:

> Continue with Hammah on WhatsApp

rather than a generic floating-chat action inside the order confirmation experience.

A separate persistent WhatsApp contact button may still exist where approved.

---

# 43. GUEST TRACKING PAGE

The page should present:

- order reference;
- current status;
- customer-visible update;
- product summary;
- latest relevant timestamp;
- payment status where appropriate;
- contact action.

It must not expose:

- private admin notes;
- unrelated user data;
- sensitive internal data.

---

# 44. ORDER TRACKING VISUAL LANGUAGE

Avoid excessive logistics graphics.

A restrained vertical or horizontal progression is sufficient:

```text
Requested
Confirmed
In Preparation
Ready
Out for Delivery
Delivered
```

Current state should be immediately visible.

---

# 45. AUTHENTICATION EXPERIENCE

Authentication should feel like entering the brand, not leaving the website for a generic SaaS form.

Use:

- warm-white/ink foundation;
- brand photography;
- minimal form width;
- controlled editorial typography.

---

# 46. JOIN THE LEGACY MODAL

Two-step signup:

## Step 1

```text
Join the Hammah Legacy
First Name
Last Name
Email
Phone / WhatsApp
Continue
```

## Step 2

```text
Create Your Account
Password
Terms
Privacy
Join the Legacy
```

Google signup should remain visible but not visually overpower the primary experience.

---

# 47. GOOGLE AUTH COMPLETION

If phone information is missing:

```text
One last thing.
Where can Hammah reach you?
```

Then request phone/WhatsApp.

This should feel like profile completion, not registration starting over.

---

# 48. EMAIL VERIFICATION STATE

Unverified users may enter The Hammah Legacy.

The interface should show a restrained persistent notice:

```text
Verify your email to place orders from your account.
Resend verification
```

Avoid alarming error styling.

It is an incomplete account state, not a security incident.

---

# 49. THE HAMMAH LEGACY

The Legacy should have a visual identity related to the public brand but noticeably more intimate.

Concept:

> **The storefront invites you in. The Legacy acknowledges that you stayed.**

---

# 50. LEGACY VISUAL CHARACTER

The Legacy may use:

- darker sections;
- more intimate photography;
- subtle member-specific typography;
- restrained motion;
- status information integrated into editorial compositions.

It must not become a neon gaming dashboard.

---

# 51. LEGACY HEADER

The header may identify membership directly.

Example:

```text
THE HAMMAH LEGACY
```

with:

```text
Hamatee since 2026
```

in selected contexts.

The member's name should be treated elegantly rather than as generic:

```text
Welcome, Samuel
```

Potential alternative:

```text
Samuel,
your place in the Legacy.
```

---

# 52. LEGACY INFORMATION ARCHITECTURE

Recommended initial structure:

```text
Home
My Pieces
Orders
Saved
Privileges
Profile
```

Mobile may use:

- compact bottom navigation for primary items;
- menu/drawer for secondary items;

provided it remains elegant and accessible.

---

# 53. LEGACY HOME

Suggested layout:

```text
Personalised Introduction

Active Order
Current Privilege

Hamatee Since
Pieces Collected

Saved Pieces

Latest Collection / Early Access

Brand Story / Editorial
```

The page should not primarily communicate:

- charts;
- graphs;
- analytics;
- KPI cards.

---

# 54. MEMBER-SINCE IDENTITY

Membership history may be shown as:

```text
HAMATEE SINCE
AUGUST 2026
```

This should feel permanent and understated.

---

# 55. PIECES COLLECTED

Display total completed purchases:

```text
PIECES COLLECTED
04
```

This is a record of relationship, not a competitive score.

Do not attach:

- leaderboards;
- points explosions;
- progress bars;

unless a future loyalty system explicitly requires them.

---

# 56. PRIVILEGES

Privileges should feel gifted rather than algorithmic.

Example:

```text
A LITTLE SOMETHING FROM HAMMAH

15% OFF
your next piece
```

Include:

- scope;
- expiry if relevant;
- availability state.

---

# 57. ORDERS IN THE LEGACY

Orders page should support:

- active;
- completed;
- cancelled.

Each order preview:

```text
Order Reference
Product Thumbnail
Date
Current Status
Payment Status
View Order
```

---

# 58. MY PIECES

“My Pieces” represents completed purchases.

It may evolve into an understated wardrobe archive.

Show:

- product image;
- name;
- date acquired;
- collection;
- optional reorder/contact action.

---

# 59. SAVED

Saved items should be visually driven.

Users should be able to:

- remove;
- open product;
- initiate order.

Do not overload the page with account metadata.

---

# 60. PROFILE

Profile sections may include:

```text
Personal Details
Contact
Saved Delivery Information
Sizing
Account & Security
Communication Preferences
```

Separate destructive actions such as account deletion from routine profile editing.

---

# 61. ADMIN DESIGN PHILOSOPHY

Admin UX serves a different purpose from the public brand experience.

It should be:

- fast;
- readable;
- operational;
- predictable;
- responsive;
- dense enough for management.

It does not need:

- WebGL;
- cinematic page transitions;
- decorative motion;
- complex editorial layouts.

Brand identity may remain through typography, neutral colours and restrained details.

---

# 62. ADMIN INFORMATION ARCHITECTURE

Recommended:

```text
Overview
Orders
Products
Categories
Collections
Members
Discounts
Enquiries
Analytics
```

Supporting:

```text
Account
Sign Out
```

---

# 63. ADMIN OVERVIEW

Prioritise real work.

Potential modules:

```text
New Orders
Orders Requiring Attention
In Preparation
Out for Delivery

Recent Guest Enquiries
Recent Members

Top Products
Recent Operational Activity
```

Avoid vanity metrics.

---

# 64. ADMIN TABLES

Tables should support:

- search;
- sort;
- filter;
- pagination where required;
- responsive fallback.

On mobile, large tables should transform into:

- stacked records;
- horizontally scrollable tables only where appropriate.

---

# 65. ADMIN PRODUCT EDITOR

Product management should be broken into logical areas:

```text
Basic Information
Pricing
Availability
Classification
Options & Variants
Media
Visibility
SEO
```

Do not create one unstructured page containing 40 fields.

---

# 66. MEDIA MANAGER

Admin should be able to:

- upload multiple files;
- reorder media;
- mark primary media;
- identify image/video;
- remove;
- preview.

Upload states:

```text
Queued
Uploading
Processing
Complete
Failed
```

---

# 67. ADMIN ORDER DETAIL

Recommended structure:

```text
Order Header
Customer
Items
Delivery
Payment
Fulfilment
Customer Update
Internal Notes
Timeline / Activity
```

Critical actions should remain visible.

---

# 68. ADMIN INTERNAL NOTES

Internal notes need an explicit visual distinction:

```text
PRIVATE — ADMIN ONLY
```

They must never look like customer-visible updates.

---

# 69. CUSTOMER UPDATE FIELD

Clearly label:

```text
Visible to Customer
```

Admins should understand which text appears in tracking/member interfaces.

---

# 70. DISCOUNT ASSIGNMENT UX

Admin chooses:

```text
Member
Discount Type
Amount
Scope
Expiry
Single-use
```

Before saving, display a plain-language summary.

Example:

```text
Ama will receive 15% off her next order.
Valid until 30 September 2026.
```

---

# 71. SEARCH

Public search may initially remain lightweight due to small product volume.

Future search should support:

- product names;
- categories;
- collections;
- relevant attributes.

Admin search should be significantly more capable.

---

# 72. EMPTY STATES

Empty states should explain what the user can do next.

Example — Saved:

```text
Nothing saved yet.

Keep the pieces you want to return to here.

Explore the collection
```

Example — Orders:

```text
No orders yet.

When you make a piece yours, its journey will appear here.
```

---

# 73. LOADING STATES

Prefer:

- skeleton placeholders;
- stable layout;
- progressive image loading.

Avoid:

- full-screen spinners for routine navigation;
- animated brand intros on every page;
- artificial waiting for animation completion.

---

# 74. ERROR STATES

Error messages should:

- explain what failed;
- preserve user data where possible;
- provide a next action;
- avoid exposing technical details.

Example:

```text
We couldn't place your order request.

Your details are still here. Try again, or contact Hammah directly.
```

---

# 75. SUCCESS STATES

Success feedback should be confident but restrained.

Avoid:

- confetti;
- excessive bouncing;
- game-like animations.

A well-composed confirmation transition is sufficient.

---

# 76. FORM DESIGN

Forms should use:

- persistent labels;
- generous vertical spacing;
- clear focus states;
- inline validation;
- appropriate autocomplete;
- proper input modes.

Placeholders must not replace labels.

---

# 77. BUTTON HIERARCHY

Recommended button classes:

## Primary

High-priority action.

Examples:

- Order This Piece
- Place Order Request
- Join the Legacy

## Secondary

Supporting action.

Examples:

- View Size Guide
- Save Piece
- Continue on WhatsApp

## Tertiary

Text-based lower-priority action.

---

# 78. BUTTON VISUAL STYLE

Buttons should avoid excessive pill usage.

Shapes should feel intentional and editorial.

Recommended:

- moderate radius or squared-soft forms;
- strong typography;
- restrained border;
- no gratuitous glow.

---

# 79. LINKS

Text links may use:

- underline;
- subtle accent;
- directional arrow;
- controlled hover transition.

Links must remain visibly distinguishable without relying entirely on colour.

---

# 80. ICONOGRAPHY

Use a restrained icon system.

Icons should:

- communicate functionality;
- remain stylistically consistent;
- avoid unnecessary decoration.

Potential libraries should be used selectively rather than exposing the entire generic icon aesthetic.

---

# 81. CURSOR INTERACTIONS

Custom cursor behaviour may appear in high-value desktop editorial sections.

Examples:

```text
View
Drag
Explore
```

Do not replace the normal cursor globally.

Custom cursors must not interfere with:

- links;
- buttons;
- text selection;
- accessibility.

---

# 82. PAGE TRANSITIONS

Page transitions may use:

- brief fade;
- mask;
- shared image transition;
- controlled vertical movement.

Transitions should generally stay below approximately 600–800ms unless part of a dedicated editorial sequence.

Commerce actions should feel faster.

---

# 83. SHARED ELEMENT TRANSITIONS

Where technically stable, product imagery may visually persist between:

```text
Product Card
→ Product Detail
```

This can produce premium continuity without introducing excessive animation.

It must not block navigation if unsupported.

---

# 84. MOTION TOKENS

Conceptual durations:

```text
Instant Feedback
100–150ms

Control Transition
150–250ms

UI Entrance
250–400ms

Editorial Reveal
400–700ms

Signature Sequence
700–1400ms
```

Longer motion should be extremely rare.

---

# 85. EASING

Motion should favour natural, controlled easing.

Avoid:

- excessive bounce;
- elastic behaviour;
- overshoot for serious commerce interactions.

Spring motion may be used for:

- drawers;
- drag behaviour;
- selected tactile interactions.

---

# 86. REDUCED MOTION

Respect:

```css
prefers-reduced-motion: reduce
```

When active:

- remove parallax;
- disable large transforms;
- remove automatic motion where unnecessary;
- replace complex transitions with simple fades;
- provide static alternatives for optional 3D sequences.

No functionality may be lost.

---

# 87. THREE.JS DESIGN RULES

Three.js should only be introduced where it provides visible brand value.

Every Three.js feature requires answers to:

1. What does this improve?
2. What is the mobile fallback?
3. What is the reduced-motion fallback?
4. What happens if WebGL fails?
5. When is the asset loaded?
6. Can the section exist without it?

If these cannot be answered, Three.js should not be used.

---

# 88. THREE.JS PERFORMANCE RULES

Use:

- lazy loading;
- dynamic imports;
- compressed textures;
- limited scene complexity;
- sensible DPR limits;
- efficient geometry;
- limited post-processing;
- lifecycle cleanup.

Avoid running expensive rendering loops when scenes are:

- off-screen;
- hidden;
- no longer mounted.

---

# 89. VIDEO / CINEMATIC MEDIA

Generated campaign video may be used when appropriate.

However, AI-generated media should be treated as:

- campaign storytelling;
- mood;
- cinematic enhancement;

not authoritative product representation when generated details differ from the real garment.

---

# 90. PHOTOGRAPHY DIRECTION

Photography should remain the primary visual material.

Use:

- full-body model images;
- movement;
- fabric close-ups;
- tailoring details;
- portrait crops;
- landscape crops;
- controlled negative space.

The design should adapt to the photography rather than forcing every photograph into an identical card.

---

# 91. IMAGE CROPPING

Critical body and garment details should not be accidentally cropped.

Design templates should support media focal positioning where required.

Admin product media may eventually support:

```text
Focal X
Focal Y
```

or equivalent cropping controls.

---

# 92. MEDIA RESPONSIVENESS

Provide appropriate variants for:

- mobile;
- tablet;
- desktop.

Where the same photograph cannot compose effectively across ratios, dedicated mobile crops should be allowed.

---

# 93. ACCESSIBILITY BASELINE

HAMMAH should target WCAG 2.2 AA where practical for applicable interface requirements.

Design considerations include:

- semantic hierarchy;
- keyboard access;
- visible focus;
- sufficient colour contrast;
- labelled forms;
- accessible modals;
- accessible drawers;
- reduced motion;
- non-hover access;
- status announcements;
- alt text;
- logical tab order.

---

# 94. FOCUS DESIGN

Keyboard focus should be visible and intentional.

Do not remove browser focus outlines without providing a replacement.

Focus treatment should work on:

- warm-white;
- dark;
- photography backgrounds.

---

# 95. MODALS AND DRAWERS

Modal behaviour must include:

- focus trapping;
- Escape dismissal where appropriate;
- labelled close action;
- background interaction prevention;
- restored focus after close.

Mobile may favour bottom sheets or full-screen flows.

---

# 96. IMAGE ALT TEXT

Product imagery should describe relevant garment information.

Avoid meaningless:

```text
Image 1
Image 2
```

Decorative campaign imagery may use empty alt attributes where appropriate.

---

# 97. TOUCH TARGETS

Interactive targets should generally meet modern mobile accessibility expectations.

Avoid:

- tiny icons;
- closely packed text links;
- small product swatches without adequate hit area.

---

# 98. PERFORMANCE DESIGN BUDGET

The visual design must support strong Core Web Vitals.

Design should not assume:

- every image loads immediately;
- autoplay video everywhere;
- multiple WebGL scenes;
- massive animation bundles.

Priority hierarchy:

```text
Critical interface
↓
Primary product media
↓
Supporting content
↓
Editorial enhancement
↓
Experimental media
```

---

# 99. MOBILE PERFORMANCE MODE

Certain advanced effects may intentionally reduce or disable on:

- low-power devices;
- reduced-data contexts;
- very small screens;
- reduced-motion preferences.

This is considered successful responsive design, not a compromised version.

---

# 100. SEO-AWARE DESIGN

Important textual content must remain actual HTML rather than being embedded exclusively in:

- images;
- canvas;
- WebGL;
- video.

Product names, descriptions, categories and essential content must be indexable.

---

# 101. DESIGN TOKENS

Implementation should centralise tokens for:

```text
Colour
Typography
Spacing
Radius
Shadow
Motion
Container Width
Z-index
Breakpoints
```

Do not hardcode arbitrary values repeatedly across components.

---

# 102. CONTAINER SYSTEM

Recommended conceptual widths:

```text
Reading Container
~720px

Standard Content
~1200–1360px

Wide Editorial
~1440–1600px

Full Bleed
100vw
```

Exact values should be refined during implementation.

---

# 103. BORDER RADIUS

Do not use the same large rounded rectangle everywhere.

Suggested hierarchy:

```text
Small UI
4–8px

Cards
6–12px

Media
0–12px depending composition

Pills
Only where semantically appropriate
```

---

# 104. SHADOWS

HAMMAH should rely primarily on:

- spacing;
- borders;
- surface contrast;
- layering.

Shadows should remain subtle.

Avoid heavy SaaS-style floating cards.

---

# 105. GLASSMORPHISM

Glass effects should not become a system-wide aesthetic.

They may be used for isolated overlays where photography requires readable floating controls.

---

# 106. GRADIENTS

Gradients may be used functionally:

- image readability;
- subtle overlays;
- cinematic transitions.

They should not introduce arbitrary new brand colours.

---

# 107. ANIMATION LIBRARY RESPONSIBILITY

Recommended division:

## CSS

Use for:

- simple hover;
- colour;
- focus;
- minor transforms.

## Motion / Framer Motion

Use for:

- layout transitions;
- page reveals;
- modal/drawer animation;
- shared elements;
- scroll-linked effects of moderate complexity.

## GSAP

Use only where a sequence genuinely requires:

- advanced timelines;
- complex scroll choreography;
- precise animation control.

## Three.js / React Three Fiber

Use only for true 3D/WebGL.

Do not use four animation systems for the same effect.

---

# 108. COMPONENT PHILOSOPHY

Components should be:

- reusable;
- accessible;
- composable;
- visually restrained.

Core components may include:

```text
Button
Link
Input
Select
Modal
Drawer
BottomSheet
ProductCard
ProductMedia
Price
AvailabilityBadge
OptionSelector
OrderStatus
PaymentStatus
PrivilegeCard
EmptyState
Notice
AdminTable
AdminFormSection
MediaUploader
```

---

# 109. PUBLIC VS ADMIN COMPONENTS

Do not force every public component and admin component into one identical visual abstraction.

They may share:

- tokens;
- primitives;
- forms;
- accessibility foundations.

They should differ where their usage context differs.

---

# 110. DESIGN STATES REQUIRED FOR EVERY MAJOR FEATURE

Before a feature is considered designed, it must account for relevant states:

```text
Default
Hover
Focus
Active
Disabled
Loading
Empty
Success
Error
Partial Data
Unavailable
```

---

# 111. PRODUCT STATES

Products may appear as:

```text
Available
Limited
Unavailable
Coming Soon
```

Each must have a visual treatment.

Do not communicate availability using colour alone.

---

# 112. PRICE ON REQUEST

Price-on-request products should still feel complete.

Use:

```text
Price on request
```

rather than:

```text
N/A
```

The primary CTA remains available where appropriate.

---

# 113. OFFLINE / NETWORK FAILURE

Order and account flows should consider unstable mobile connections.

Design should preserve entered information when possible.

Users should understand whether:

- a request was submitted;
- it failed;
- retry is safe.

Prevent duplicate submission through clear interaction states.

---

# 114. TOASTS

Use toast notifications for brief secondary confirmation.

Do not use toast messages as the only place for:

- critical errors;
- form validation;
- order confirmation.

---

# 115. SECURITY-AWARE UX

Sensitive actions should require intentional confirmation.

Examples:

- account deletion;
- destructive admin actions;
- order cancellation after confirmation;
- product deletion/archive;
- revoking privileges.

Confirmation copy should state consequences clearly.

---

# 116. ADMIN DESTRUCTIVE ACTIONS

Prefer:

```text
Archive Product
```

over irreversible deletion where operational history requires the product to remain referenced.

Use destructive red styling only where appropriate.

---

# 117. DESIGN FOR FUTURE PRODUCT EXPANSION

No visual pattern should assume all products are trousers.

The catalogue must handle:

- menswear;
- womenswear;
- unisex;
- accessories;
- different option structures;
- different media ratios.

---

# 118. DESIGN FOR COLLECTION GROWTH

With eight launch designs, simple discovery is sufficient.

The design must nevertheless support future:

- filters;
- search;
- collection pages;
- sorting;
- larger catalogues.

Do not expose controls before they become useful.

---

# 119. DESIGN FOR INTERNATIONAL EXPANSION

V1 is Ghana-focused, but layouts should not rely on:

- fixed-length addresses;
- fixed currency formatting;
- short product names;
- single-region assumptions.

Future internationalisation should remain possible.

---

# 120. DESIGN FOR TRUST

Because HAMMAH uses assisted commerce rather than automated checkout, customers must understand the process.

Trust signals should come from:

- professional photography;
- clear ordering flow;
- visible order reference;
- tracking;
- clear contact information;
- transparent delivery messaging;
- policies;
- consistent design.

Avoid fake urgency or artificial scarcity.

---

# 121. POLICY PAGES

Required public policy surfaces:

- Privacy Policy;
- Terms and Conditions;
- Returns / Refunds;
- Delivery Policy;
- Size Guide.

These pages should remain readable and visually consistent without unnecessary motion.

---

# 122. FOOTER

Recommended footer content:

```text
SL by Hammah
Short positioning line

Shop
Collections
Our Story
Join the Legacy

Delivery
Returns
Size Guide
Privacy
Terms

Instagram
WhatsApp
Other approved social platforms
```

The footer may also include a restrained campaign image or statement.

---

# 123. SOCIAL LINKS

Social icons should remain secondary.

Do not create oversized social sections unless editorially justified.

---

# 124. ANALYTICS-AWARE DESIGN

Design should create measurable interaction points without becoming analytics-driven.

Important interactions include:

- view product;
- change variant;
- save product;
- initiate order;
- complete order request;
- open WhatsApp;
- create account;
- verify email;
- use privilege.

---

# 125. DESIGN QA REQUIREMENTS

Visual QA must be performed across:

- mobile Safari;
- mobile Chrome;
- desktop Chrome;
- desktop Edge;
- desktop Safari where available;
- Firefox where applicable.

Test:

- motion;
- responsive layout;
- media;
- forms;
- keyboard navigation;
- reduced motion;
- 3D fallbacks.

---

# 126. DEVICE QA

At minimum verify realistic experiences at:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px
```

Do not approve layouts based only on desktop browser resizing.

---

# 127. VISUAL REGRESSION RISK AREAS

Pay particular attention to:

- typography wrapping;
- sticky product panels;
- media cropping;
- modal heights;
- mobile menu;
- long product names;
- Price on Request;
- unavailable options;
- order tracking;
- admin tables;
- Legacy header;
- dynamic uploaded media.

---

# 128. V0.APP USAGE RULES

v0.app may be used to accelerate:

- page skeletons;
- component foundations;
- responsive layouts;
- product card structures;
- form foundations;
- admin UI scaffolding.

v0 output must not be treated as final design simply because it compiles.

---

# 129. V0 DESIGN REVIEW

Every generated section must be reviewed for:

- adherence to typography;
- colour;
- spacing;
- brand tone;
- accessibility;
- responsive behaviour;
- unnecessary rounded cards;
- generic gradient use;
- excessive icon usage;
- redundant components;
- performance.

Generated UI that looks generic should be replaced.

---

# 130. V0 SHOULD NOT DEFINE

v0 should not independently determine:

- HAMMAH brand direction;
- order architecture;
- auth architecture;
- database schema;
- admin permissions;
- WebGL strategy;
- complex motion logic;
- security rules;
- state machines.

These belong to the implementation and technical specifications.

---

# 131. PUBLIC DESIGN DEFINITION OF DONE

The public experience is design-complete when:

- navigation hierarchy is clear;
- homepage has a defined narrative;
- shop works across viewport sizes;
- product pages prioritise purchase decisions;
- guest ordering is understandable;
- WhatsApp continuation is clear;
- tracking is legible;
- all important states exist;
- mobile is intentionally composed;
- accessibility requirements are represented;
- advanced motion has fallbacks.

---

# 132. LEGACY DESIGN DEFINITION OF DONE

The Hammah Legacy is design-complete when:

- membership feels visually distinct;
- onboarding is clear;
- verification states exist;
- active orders are prominent;
- privileges feel branded;
- order history is usable;
- saved pieces work;
- profile editing is clear;
- membership history is represented without excessive gamification;
- mobile navigation is practical.

---

# 133. ADMIN DESIGN DEFINITION OF DONE

Admin is design-complete when:

- daily operational priorities are obvious;
- products can be configured efficiently;
- media management is usable;
- guest and Hamatee orders are distinguishable;
- payment and fulfilment states are separate;
- internal notes cannot be confused with customer updates;
- discounts are understandable;
- analytics are actionable;
- responsive usage is acceptable.

---

# 134. DESIGN NON-GOALS

HAMMAH V1 should not attempt to become:

- a social network;
- an NFT/crypto experience;
- a gaming interface;
- a WebGL showcase;
- an enterprise ERP;
- a generic marketplace;
- an over-customised CMS;
- a loyalty-points platform;
- an app-like dashboard full of meaningless statistics.

---

# 135. DESIGN NORTH STAR

Every public-facing design decision should be evaluated against the following question:

> **Does this make the garment, the brand or the act of becoming part of Hammah feel more considered?**

If the answer is no, the design element should be reconsidered.

---

# 136. FINAL EXPERIENCE MODEL

HAMMAH should create three progressively deeper experiences.

## EXPERIENCE 1 — DISCOVER

```text
Campaign
Story
Collection
Product
```

Goal:

**Captivate.**

---

## EXPERIENCE 2 — ACQUIRE

```text
Configure
Request
WhatsApp
Track
Delivery
```

Goal:

**Convert without friction.**

---

## EXPERIENCE 3 — BELONG

```text
Join
Legacy
Privileges
Pieces
History
Future Access
```

Goal:

**Build a durable relationship with SL by Hammah.**

---

# 137. DESIGN APPROVAL BASELINE

The following are considered locked design principles unless explicitly revised:

- SL by Hammah remains the public brand;
- the authenticated member environment is The Hammah Legacy;
- registered members are Hamatees;
- Warm White, Ink and Accent Brown remain the core palette;
- Instrument Serif Italic remains display typography;
- DM Sans remains primary interface typography;
- photography remains the visual authority;
- mobile is a primary design environment;
- motion is selective and functional;
- 3D/WebGL is progressively enhanced;
- advanced public storytelling remains developer-controlled;
- commerce flows become simpler closer to order submission;
- WhatsApp is continuation, not system of record;
- The Legacy is not a conventional SaaS dashboard;
- admin prioritises operations over visual spectacle;
- accessibility and reduced-motion behaviour are part of design;
- no key interaction may depend exclusively on hover;
- HAMMAH should avoid generic ecommerce and AI-generated visual conventions.

---

# 138. NEXT DOCUMENT

This document defines **how HAMMAH should look, feel and behave**.

The next specification should be:

```text
HAMMAH_SRS.md
```

The SRS will convert the approved PRD and this design specification into the formal technical requirements for:

- authentication;
- permissions;
- data modelling;
- catalogue architecture;
- product variants;
- guest ordering;
- Hamatee ordering;
- tracking;
- payment states;
- discounts;
- admin operations;
- notifications;
- integrations;
- storage;
- security;
- performance;
- accessibility;
- analytics;
- error handling;
- acceptance testing.

---

**End of HAMMAH Design System and Experience Specification**