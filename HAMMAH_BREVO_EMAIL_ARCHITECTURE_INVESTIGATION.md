# HAMMAH Brevo Email Architecture Investigation

> Investigation only. No Brevo integration, templates, credentials, migrations, Supabase Auth changes, order-behaviour changes, or tracking work were performed. Every claim below is cited to actual repository code.

Canonical production origin: `https://www.hammah.store`

---

## 1. Executive Summary

| Area | State today |
|---|---|
| **Current email architecture** | The application sends **no email at all**. All email is emitted by **Supabase Auth (GoTrue)** for two flows only: signup verification and password reset. There is no mail library, no SMTP code, no transactional wrapper, no template IDs, no HTML templates anywhere in the repo (`package.json:11-23`; repo-wide grep for `brevo\|sendinblue\|smtp\|nodemailer\|resend\|mailer\|sendTransacEmail\|templateId` → single prose hit in `src/app/(public)/privacy/privacy-client.tsx:123`). |
| **Brevo readiness** | **Zero.** No Brevo SDK, no SMTP config, no `BREVO_*` env var names in `.env.example` / `.env.local`, no `supabase/config.toml`, no `supabase/functions`. Docs explicitly record it as deferred: `HAMMAH_SPRINT_REPORT.md:3417-3425`, `SPRINT_LOG.md:1529-1532`, `docs/development/07_HAMMAH_DEVELOPMENT_ROADMAP.md:211` ("Brevo SMTP deferred to Sprint 0.20"). Readiness = greenfield: a single central module can be introduced without untangling anything. |
| **Order notification readiness** | **Ready to wire.** `POST /api/orders` has one clean, single persistence point (`src/app/api/orders/route.ts:77-147`). The order + immutable `order_items` snapshot contain every field an admin/customer email needs. The existing precedent — "enrolment failure never rolls back the order" (`src/app/api/orders/route.ts:128-141`, `src/lib/hamatee/enrolment.ts:32-40`) — is exactly the pattern email must copy. |
| **Birthday readiness** | **Data yes, scheduler no.** `profiles.date_of_birth` exists and is **required** at signup (`signup/page.tsx:65`, `00007_signup_birthday_profile.sql:34`), and guest DOB lives in `hamatee_enrolments.date_of_birth`. But there is **no cron, no `vercel.json`, no recurring job infrastructure, no timezone handling, and no delivery log** to guarantee once-per-year idempotency. |
| **Hamatee activation readiness** | **Partial.** The enrolment lifecycle enum exists (`pending / invited / activated / existing_account / failed / cancelled`, `00006_hamatee_orders_enrolment.sql:22-23`) but **only `pending` and `existing_account` are ever written**. No invitation email exists, no activation code path exists, and guest birthday enrolments **remain `pending` indefinitely** (confirmed in `HAMMAH_SPRINT_REPORT.md:3421`, `:3425`). |
| **Order-tracking/status readiness** | **No.** See §8. A 7-value status column exists in the DB, but **no code anywhere ever writes anything other than `pending`**: no admin orders UI, no status API, no trigger, no webhook, no realtime. `/track` is an explicitly labelled frontend demo. WhatsApp is the real operational channel. **Templates 5 and 6 must stay RESERVED.** |

---

## 2. Current Email Systems

| System | Current Behaviour | Owner |
|---|---|---|
| **Signup verification** | `supabase.auth.signUp({ email, password, options.data })` at `src/app/(public)/signup/page.tsx:93-104`; metadata carries `first_name, last_name, phone, date_of_birth` (`:97-102`). UI switches to a "check your email" state (`:129-172`). Login blocks unconfirmed users (`login/page.tsx:45-46`). **No `emailRedirectTo` anywhere in the repo** — the verification link target is controlled entirely by Supabase Dashboard Site URL / Redirect URLs. | **Supabase Auth (GoTrue)** — dashboard-configured template |
| **Password reset** | `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` })` at `src/app/(public)/forgot-password/page.tsx:26-28`. Link lands on `src/app/auth/callback/route.ts:11` → `exchangeCodeForSession(code)` → redirect to `/reset-password`. Password is then changed **in-session** via `supabase.auth.updateUser({ password })` (`reset-password/page.tsx:48`) after a `getSession()` prerequisite (`:22-29`). No `verifyOtp`/`token_hash` handling exists. | **Supabase Auth (GoTrue)** — dashboard-configured template |
| **Application transactional email** | **None.** No `sendEmail`, no outbound `fetch` to any email API (all 41 `fetch()` calls in `src/` target same-origin `/api/*`), no edge functions, no `pg_net`. The only "email" the app produces is on-screen copy (`signup`, `forgot-password`) and the WhatsApp message body. | **N/A — does not exist** |
| **Brevo** | **Not installed, not referenced, not configured.** No SDK in `package.json`/`package-lock.json`, no `templateId`/`sendTransacEmail`, no `BREVO_*` variables in `.env.example` or `.env.local` (variable names only were inspected). Only prose mentions exist in docs. | **N/A — deferred** |
| **SMTP** | **No SMTP anywhere in the repo.** No transporter code, no `supabase/config.toml`, no mail env vars. Supabase Auth email templates are referenced only as a dashboard deployment dependency (`SPRINT_LOG.md:1279-1280`, `HAMMAH_SPRINT_REPORT.md:3202-3203`, `docs/development/HAMMAH_SPRINT_0_19_INVESTIGATION.md:1136`). Whether custom SMTP is currently configured in the Supabase Dashboard **cannot be determined from this repository** — it is dashboard-side only. | **Supabase Dashboard (out-of-repo)** |

**Overlap check:** there is currently **zero** overlap between application email and auth email, because the application sends no email. The split described in §11 therefore fits cleanly.

---

## 3. Order Email Integration Point

### Actual flow today

```text
Product order drawer (client)
  src/components/product/order-drawer.tsx
  handleSubmit()                                  order-drawer.tsx:261
    validate identity / delivery / DOB            :274-312
    fetch("/api/orders", { method: "POST" })      :318-337
        │
        ▼
POST /api/orders (server)  src/app/api/orders/route.ts:33
  OrderSchema.parse(body)                         route.ts:36
  birthday⇒email rule (400 if violated)           route.ts:39-44
  DOB sanity check                                route.ts:47-55
  createAdminClient()                             route.ts:57
  session probe → userId / isAuthUser             route.ts:63-72   (source = hamatee | website_guest)
  supabase.rpc("create_order", …)                 route.ts:77-94
        │  ← atomic persistence: orders row + order_items snapshot
        │    + HAM-YYYY-NNNN reference           00009_enforce_size_required.sql:149-186
        ▼
  error → 400 (nothing persisted)                 route.ts:96-120
  result = data[0]  → { order_id, order_number }  route.ts:122-126
        │
        │   ┌──────────────────────────────────────────────────────┐
        │   │  ★ SAFE EMAIL INTEGRATION POINT ★                   │
        │   │  after line 126 (result exists = persistence        │
        │   │  succeeded), before/alongside the 201 response      │
        │   │  (ideally via after() from "next/server",           │
        │   │  exported by installed Next 16.3.2)                 │
        │   └──────────────────────────────────────────────────────┘
        ▼
  createHamateeEnrolment(...)   route.ts:131-141   (guest + DOB + email only)
    never throws / never rolls back order          enrolment.ts:63-70, 84-87
        ▼
  NextResponse.json 201 { order_id, order_number } route.ts:143-147
        │
        ▼
Client success state                              order-drawer.tsx:347-349
  buildWhatsAppMessage(...)                       order-drawer.tsx:369-387
  buildWhatsAppUrl(...) → wa.me deep link         whatsapp.ts:91-95
  <a href={whatsappUrl}>Continue on WhatsApp</a>  order-drawer.tsx:464-474 (auto-focused :132-137)
```

### Why this is the correct point

1. **Persistence has provably succeeded** — `create_order` is a single atomic `SECURITY DEFINER` RPC that either returns `{order_id, order_number}` or raises (`00009_enforce_size_required.sql`). There is no later step that can invalidate the reference.
2. **The response body does not carry email content** — only `order_id` and `order_number` (`route.ts:143-147`). The email implementation must therefore **re-read persisted data server-side** (service client: `orders` + `order_items` join), never trust client state.
3. **It sits before WhatsApp, but must not gate it.** The WhatsApp link is built client-side from `order_number` (`order-drawer.tsx:369-389`), so as long as the route returns 201, WhatsApp continues regardless of what email does.
4. **There is an exact in-repo precedent** for non-blocking side effects: `createHamateeEnrolment` runs after persistence, catches its own errors, returns a safe status, and is documented as "Order success is never rolled back if enrolment fails" (`route.ts:128-129`, `enrolment.ts:32-40`). Email must adopt the identical contract.
5. **`after()` is available** — `node_modules/next/server.d.ts:21` exports `after`, so the send can run after the 201 is flushed, adding no latency to the drawer and removing any possibility that a slow/failing SMTP call delays or breaks the WhatsApp handoff.

### Failure contract (must hold)

| Email failure must NOT | Why it is safe today |
|---|---|
| Roll back the order | RPC already committed; nothing after `route.ts:122` touches the DB write path |
| Invalidate the `HAM-YYYY-NNNN` reference | Generated inside the RPC before insert (`00009:149`) |
| Block WhatsApp | Client only needs the 201 + `order_number` (`order-drawer.tsx:347`) |
| Create a duplicate order | `idempotency_key` (client `crypto.randomUUID()` per drawer session, `order-drawer.tsx:112-114`) makes `create_order` return the **existing** order (`00009:117-126`) — which is precisely why email needs its own dedupe (see §12) |

---

## 4. Admin Notification Recipients

### Existing settings architecture: **none**

- No `settings`, `site_settings`, `admin_settings`, `notification`, or `configuration` table in any migration (all 11 migrations enumerated; `CREATE TABLE` inventory = `profiles, categories, collections, products, product_variants, collection_products, media_assets, product_media, homepage_featured_products, homepage_hero_images, homepage_collection_feature, cta_placements, orders, order_items, hamatee_enrolments, saved_products, size_guides, size_guide_rows`).
- No `.from("settings")` / settings query anywhere in `src/`.
- No generic key/value store. The closest existing "admin-managed configuration" precedent is **`cta_placements`** (`00002_cta_placements.sql`) — a dedicated table with `is_admin()` RLS for SELECT/INSERT/UPDATE/DELETE (`:44-79`), an admin CRUD API under `src/app/api/admin/ctas/`, and an admin page at `src/app/admin/ctas/`.

### Best storage approach

**A new dedicated table** — there is nothing to extend. Recommended shape (do not implement now):

```text
notification_recipients
  id           uuid pk
  email        text not null          -- one row per address
  label        text                    -- e.g. "Owner", "Orders"
  enabled      boolean not null default true
  created_at / updated_at
  + is_admin() RLS: admin SELECT/INSERT/UPDATE/DELETE   (mirrors cta_placements)
```

Why row-per-address rather than a JSON/array column:
- matches the repo's established admin-CRUD pattern (`cta_placements`, `products`, …);
- enables independent enable/disable without array editing;
- trivially read server-side as `.select("email").eq("enabled", true)` → `["admin@hammah.store","orders@hammah.store","owner@example.com"]`;
- every enabled recipient receives every new-order notification (loop send, one Brevo call per recipient or one call with multiple `to` entries).

A single-row `site_settings` table with a `jsonb`/`text[]` column is the smaller alternative, but it introduces upsert semantics the repo does not currently use anywhere.

### Migration required?

**Yes** — a new migration (next number `00012_*`) is unavoidable, since no settings storage exists. This investigation does **not** create it.

### Admin UI location

There is **no Settings area today**. Admin nav is fixed at 8 entries — Dashboard, Products, Categories, Collections, Size Guides, Media, Homepage, CTAs (`src/components/admin/admin-shell.tsx:23-32`), and `src/app/admin/` contains only those sections. A future Phase B needs:

- `src/app/admin/settings/page.tsx` (new)
- a 9th nav entry in `src/components/admin/admin-shell.tsx`
- `src/app/api/admin/settings/notification-recipients/...` (new), guarded by the existing `requireAdmin()` pattern (`src/lib/supabase/require-admin.ts:13-46`)

---

## 5. Order Email Data Available

Everything below is read from **persisted** rows (`public.orders` + `public.order_items`), i.e. available to a server-side send after `route.ts:122`.

| Field | Available? | Source (exact column / derivation) |
|---|---|---|
| Order reference | ✅ | `orders.order_number` (`00009:149`, format `HAM-YYYY-NNNN`) |
| Order id | ✅ | `orders.id` |
| Product name | ✅ | `order_items.product_name_snapshot` (`00009:196`) |
| Product URL | ⚠️ derived | `https://www.hammah.store/product/{order_items.product_slug_snapshot}` — **not stored**; build with `absoluteUrl()` (`src/lib/seo/site.ts:23-26`) |
| Product image | ✅ | `order_items.media_url_snapshot` (R2/public URL, `00009:185-193`) |
| Size | ✅ | `order_items.variant_value` + `order_items.variant_label` (`00009:197-198`) |
| Quantity | ✅ | `order_items.quantity` (`00009:202`) |
| Pricing mode | ✅ | `order_items.pricing_mode_snapshot` — values `FIXED` \| `PRICE_ON_REQUEST` (`src/app/admin/products/[id]/page.tsx:63`) |
| Price | ✅ nullable | `order_items.price_amount_snapshot` — `NULL` when `PRICE_ON_REQUEST` |
| Currency | ✅ | `order_items.currency`, default `'GHS'` (`00009:203`) |
| Price display | ✅ helper | `formatPrice(amount, currency)` → `GHS 300.00`, whole-unit convention (`src/lib/currency.ts:4-9`) |
| Customer name | ✅ | `orders.customer_name` (`00009:175`) |
| Customer phone | ✅ | `orders.customer_phone` |
| Customer email | ⚠️ nullable | `orders.customer_email` (`00009:176`) — `NULL` for email-less guests |
| Hamatee vs Guest | ✅ | `orders.source` ∈ `website_guest` / `hamatee` + `orders.user_id` (`00009:169-178`) |
| Delivery region | ✅ | `orders.delivery_region` |
| Delivery city/town | ✅ | `orders.delivery_city` |
| Delivery area | ⚠️ nullable | `orders.delivery_area` |
| Delivery landmark | ⚠️ nullable | `orders.delivery_landmark` |
| GhanaPost GPS | ⚠️ nullable | `orders.delivery_gps` |
| Delivery notes | ⚠️ nullable | `orders.delivery_notes` |
| Customer note | ⚠️ nullable | `orders.customer_note` |
| Admin notes | ⚠️ nullable | `orders.admin_notes` (never written by app code) |
| Created timestamp | ✅ | `orders.created_at` |
| Status | ✅ inert | `orders.status` — **always `'pending'`** at insert (`00009:150`) |
| Channel | ✅ | `orders.communication_channel` = `'whatsapp'` |

Client-only state (product object, drawer form values, WhatsApp payload) is **not** needed and must not be used.

---

## 6. Hamatee Email Lifecycle

### A. Direct Hamatee signup (real, automated)

```text
/signup form (first, last, email, phone, BIRTHDAY required, password)
  src/app/(public)/signup/page.tsx:53-71, :65  ← "Your birthday is required"
  → supabase.auth.signUp({ email, password, options.data{ first_name, last_name, phone, date_of_birth } })
      signup/page.tsx:93-104
  → DB trigger handle_new_user() on auth.users INSERT
      00004_customer_auth_foundation.sql:13-40, replaced by 00007_signup_birthday_profile.sql:12-49
      → inserts public.profiles (first_name, last_name, phone, date_of_birth, role='customer')
  → Supabase sends verification email (dashboard template)
  → login blocked until confirmed (login/page.tsx:45-46)
```

- Account exists **immediately** (verification gates login, not creation).
- `profiles.date_of_birth` is populated for every direct signup (`00007:34-44`), and is user-editable later at `/account/profile` (`account/profile/page.tsx:204-214`).
- **Statuses:** this path has no enrolment status at all — the user is simply an active `auth.users` + `profiles` row.

### B. Guest birthday enrolment (real, but terminal)

```text
Guest order drawer with DOB
  order-drawer.tsx:335  date_of_birth: isAuth ? null : dateOfBirth
→ POST /api/orders validates birthday ⇒ email required  route.ts:39-44
→ after order persistence: createHamateeEnrolment(...)  route.ts:131-141
→ RPC create_hamatee_enrolment                          00006:234-290
     email matches auth.users ?  status = 'existing_account'
     else                          status = 'pending'
→ returned to client as enrolment_status                route.ts:146
```

### Actual status lifecycle — declared vs real

| Status | Declared in schema? | Ever written by code? |
|---|---|---|
| `pending` | ✅ `00006:22-23` | ✅ `00006:260` (default + RPC) |
| `existing_account` | ✅ | ✅ `00006:257` |
| `invited` | ✅ | ❌ **never** — zero writes repo-wide (`src/lib/hamatee/enrolment.ts:5` is type-only) |
| `activated` | ✅ | ❌ **never** |
| `failed` | ✅ | ✅ only as a client-side fallback when the RPC errors (`enrolment.ts:69,86`) |
| `cancelled` | ✅ | ❌ never |

### Gaps (explicit)

- **No invitation email is implemented.** No code path sends anything to `hamatee_enrolments.email`.
- **Activation is not automated.** Nothing transitions `pending → invited → activated`; nothing creates an auth user from an enrolment; no `supabase.auth.admin.*` call exists anywhere.
- **Guest birthday enrolments remain `pending` indefinitely** — stated in the repo itself: "Enrolment status stays `pending` until email delivery is production-ready" / "Brevo SMTP deferred — enrolment status is `pending` only" (`HAMMAH_SPRINT_REPORT.md:3421`, `:3425`; `SPRINT_LOG.md:1533`).
- **Enrolment DOB never reaches `profiles`** — no code links an enrolment to a future user record. Guest DOB lives only in `hamatee_enrolments.date_of_birth`.
- **No admin enrolments UI** — `src/app/admin/` has no enrolments/orders section (RLS is admin-only read/update, `00006:51-65`).

**Conclusion for Template 3:** a genuine, always-available trigger exists **only** for *direct signup* (client-observable at `signUp` success; a true server-side event would need a Supabase webhook/DB trigger, neither of which exists). A genuine trigger for *enrolment invitation/activation* does **not** exist. Phase D must be scoped accordingly (see §9, §14).

---

## 7. Birthday Automation Readiness

| Question | Finding |
|---|---|
| **DOB source — direct Hamatee** | ✅ `profiles.date_of_birth` (`00005:15`), always set at signup (`signup/page.tsx:65` → `00007:34`), editable at `/account/profile` (`account/profile/page.tsx:92,204-214`) |
| **DOB source — guest enrolment** | ✅ `hamatee_enrolments.date_of_birth` (`00006:21`, `NOT NULL`) — **never copied to `profiles`** |
| **Overlap/duplication risk** | ⚠️ `existing_account` enrolments duplicate an existing `profiles` row keyed by email; a birthday job must dedupe by email/user to avoid double sends |
| **Cron / scheduler availability** | ❌ **None.** No `vercel.json`, no `supabase/config.toml`, no `supabase/functions`, no `pg_cron`, no `node-cron`, no `cron`/`schedule` string anywhere in `src/` (verified) |
| **Vercel Cron configured** | ❌ Not present in repo (Vercel Cron would require a `vercel.json` or dashboard config — nothing exists in-repo) |
| **Timezone handling** | ❌ **None.** Zero `timeZone`/`timezone` matches in `src/`. Dates are plain `date` columns; client formatting uses `toLocaleDateString("en-GB")` (`account/page.tsx:86`). Ghana is UTC+0, which conveniently makes "calendar day in Ghana" == UTC day, but this is an unstated assumption, not code |
| **Delivery log / idempotency** | ❌ No outbound-message log of any kind (see §12) |

### Recommended trigger architecture (design only, not implemented)

```text
Vercel Cron (daily, ~00:05 UTC)  →  GET/POST /api/cron/birthdays   (Bearer CRON_SECRET protected)
    →  query profiles where date_of_birth month/day = today (UTC)
    →  query hamatee_enrolments where date_of_birth month/day = today
         and email not present in profiles (dedupe existing_account)
    →  for each candidate: INSERT email_delivery_log (template_key='birthday',
         user_id/email, sent_year) with UNIQUE constraint → skip if already sent
    →  send via Brevo Transactional API
```

- **Idempotency anchor:** unique `(template_key, recipient_email_or_user_id, extract(year from sent_at))` — see §12.
- **Failure:** log, never retry-bomb; a missed day is recoverable by re-running the route for a date window.
- No scheduling is implemented in this investigation.

---

## 8. Order Tracking / Status Reality

### **Does a real operational order-tracking system exist today? → NO**

(Only a partial, inert database foundation exists; nothing operational reads or writes status.)

**A. Statuses in the database**
✅ Seven values exist, unchanged by any later migration: `pending, contacted, confirmed, preparing, shipped, delivered, cancelled` with `DEFAULT 'pending'` (`supabase/migrations/00003_orders.sql:26`). Index on status (`:49`). No subsequent migration alters the constraint (the only `ALTER TABLE` on `orders` is `ENABLE ROW LEVEL SECURITY`, `00003:226`). Note the spec/doc status `ready` (`docs/development/04_HAMMAH_PRODUCT_AND_ADMIN_RULES.md:213`) and the `/track` labels "Ready"/"Out for Delivery" (`src/app/(public)/track/track-client.tsx:15-16`) are **not valid DB values**.

**B. Editable in Admin?**
❌ **No.** `src/app/admin/` contains only `categories, collections, ctas, homepage, login, media, products, size-guides` — **no orders section**. `src/app/api/admin/` likewise has no orders route. Admin nav has no Orders item (`src/components/admin/admin-shell.tsx:23-32`). Dashboard metrics are products/collections/media/featured/CTAs only (`src/app/admin/page.tsx:31-51`). The admin RLS UPDATE policy (`00003:244-249`) is **dead permission — no client exercises it**. The Admin Orders UI was explicitly deferred (`HAMMAH_SPRINT_REPORT.md:2876, :2999`) and Sprint 0.18.3 never happened (`07_HAMMAH_DEVELOPMENT_ROADMAP.md:137 → :203 → :233`).

**C. Status change triggers code/events?**
❌ **No.** Zero matches repo-wide for `UPDATE public.orders`, `set status =` on orders, `.from("orders").update(...)`. The only trigger on `orders` is `orders_set_updated_at` (`00003:43-45`). No `NOTIFY`/`pg_notify`, no webhooks (zero `webhook` matches), no realtime (zero `.subscribe(`/`.channel(` in `src`), no `vercel.json`, no Supabase edge functions. Every insert hardcodes `'pending'` (`00003:190`, `00006:198`, `00009:150`).

**D. `/track` real or demo?**
❌ **Demo.** `src/app/(public)/track/track-client.tsx` imports no Supabase client and performs no fetch; its lookup is `setTimeout(... 1000)` with success = "both inputs non-empty" (`:32-40`), a hardcoded timeline (`:10-18`), a hardcoded result "HAM-EXAMPLE-001" (`:220`) and a hardcoded progress bar (`:297`), plus the literal disclaimer "Frontend demonstration only. This is not a real order." (`:274`). Page is `noindex` (`track/page.tsx:5`).

**E. Customer account order history**
⚠️ **Real reads, inert status.** `/account/orders` queries the DB server-side for the signed-in user (`account/orders/page.tsx:12-25`) and `/account/orders/[order_number]` shows item snapshots and price (`[id]/page.tsx:19-32, 116-119`). Status is a single static badge from a label map (`page.tsx:48-56`, `:116`) — no timeline, no transitions, no polling, no realtime, no API call. Since nothing ever changes `pending`, customers will always see "Request received".

**F. WhatsApp as the real channel?**
✅ **Yes.** On 201 the drawer shows "Your request has been saved. Continue the conversation with HAMMAH on WhatsApp." and an auto-focused `wa.me` link (`order-drawer.tsx:458-474`, focus `:132-137`), with message assembly in `src/lib/orders/whatsapp.ts:36-95`. DB agrees: `communication_channel` default/insert `'whatsapp'` (`00003:25,190`).

### Consequence for Templates 5 and 6

**Template 5 — RESERVED.** No genuine event exists that means "order confirmed": no admin action, no status writer, no payment event, no webhook.
**Template 6 — RESERVED.** No genuine status/update event exists for the same reason.

Neither should be implemented, stubbed, or faked.

---

## 9. Template Recommendation

| # | Template | Recipient | Real Trigger Exists Today? | Recommendation |
|---|---|---|---|---|
| 1 | **New Order Notification (Admin)** | All enabled admin-configured addresses | ✅ **Yes** — successful `create_order` RPC in `POST /api/orders` (`route.ts:122`) | **Implement (Phase B).** Fire-and-forget after persistence, `after()` preferred, deduped per `order_id` |
| 2 | **Order Request Received (Customer)** | `orders.customer_email` when present | ✅ **Yes** — same trigger; conditionally skipped when email is NULL | **Implement (Phase C).** Skip silently for guests without email; never make email globally required |
| 3 | **Hamatee Welcome / Activation** | Hamatee customer | ⚠️ **Partial** — direct signup success is observable only client-side; enrolment invite/activation has **no** code path | **Implement narrowly (Phase D):** welcome after successful signup only if a non-client trigger (webhook/DB trigger) is accepted, otherwise send client-side post-`signUp` with a logged failure. **Do not** build an "activation/invite" email until an activation flow exists |
| 4 | **Happy Birthday** | Hamatee (profiles + guest enrolments) | ⚠️ **Data yes, event no** — requires a scheduler that does not exist | **Implement later (Phase E)** with Vercel Cron + delivery-log idempotency |
| 5 | **RESERVED** (Order Confirmed) | — | ❌ **No** — no status writer, no admin action, no payment event | **Leave unimplemented.** Revisit only after a real status architecture exists |
| 6 | **RESERVED** (Order Update) | — | ❌ **No** — no status model in operation | **Leave unimplemented.** Same precondition as #5 |

Cap respected: 4 actionable + 2 reserved = 6.

---

## 10. Email Design System

No email HTML exists in the repo (zero `*.html` / `*.eml` files under `src`, `public`, `supabase`). The system must be built from scratch. Recommended structure — **no final HTML in this investigation**:

| Part | Recommendation |
|---|---|
| **Standard header** | Slim branded band: primary logo left-aligned on light background, thin rule below. Used for Templates 1–3 and all routine mail. Single reusable partial, parameterised by `variant`. |
| **Special notice header** | Same geometry, stronger treatment (dark/brand-color background, reversed logo variant, optional eyebrow label such as "IMPORTANT NOTICE"). Intended for birthday and future important account/order communication. Implemented as a `variant: "standard" \| "notice"` switch inside **one** header partial — **not** a second full template (see §15) |
| **Body** | Single-column, ~600px, system-font stack, brand text colours; rows for order summary / greeting / status copy |
| **CTA** | One primary button per email (brand fill, high contrast, `padding`-based, no background-image dependency — Outlook-safe); secondary actions as plain links |
| **Footer** | Shared partial: brand line, `https://www.hammah.store` links (Account, Orders, Track Order, Delivery, Returns, Privacy, Terms — mirrors `src/data/navigation.ts:30-69`), physical/business identification, unsubscribe line where legally required |
| **Usable brand assets (stable public HTTPS)** | Served by the site itself from `/public`, therefore stable at the canonical origin: `https://www.hammah.store/images/hammah/global/logo/logo-primary-dark.png`, `…/logo-primary-light.png`, `…/logo-secondary-dark.png`, `…/logo-secondary-light.png`, `…/og-image.png`, `…/favicon.png`; plus `https://www.hammah.store/favicon.ico` and `https://www.hammah.store/apple-touch-icon.png`. Canonical constants already exist: `LOGO_PATH` and `OG_IMAGE_PATH` in `src/lib/seo/site.ts:13-14` |
| **Product imagery** | R2 public URLs (`media_assets.public_url`, base `CLOUDFLARE_R2_PUBLIC_BASE_URL`, allowed host `media.slbyhammah.com` in `next.config.ts:36`) and `order_items.media_url_snapshot` — absolute HTTPS, email-safe |
| **Do NOT use** | Relative paths, `next/image` optimised URLs (`/_next/image` — auth-gated/undeliverable in mail clients), localhost, `slhammah.vercel.app`, Vercel preview hosts |

---

## 11. Brevo Integration Architecture

### Recommended split

```text
┌────────────────────────────────────────────┐
│ Supabase Auth (GoTrue)                     │
│   → signup verification, password reset    │
│   → transport: Brevo SMTP                  │
│   → configured in Supabase Dashboard       │
│     (Authentication → SMTP Settings,       │
│      Email Templates) — out of repo        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ HAMMAH application (Next.js route handlers)│
│   → Templates 1–4                          │
│   → transport: Brevo Transactional API     │
│     (POST https://api.brevo.com/v3/smtp/   │
│      email, header `api-key`)              │
│   → single server-only module              │
│     src/lib/email/*  (never imported from  │
│     client components)                     │
└────────────────────────────────────────────┘
```

### Does the repo support this cleanly? — **Yes**

1. **Auth emails are already 100% Supabase-owned.** Every auth flow calls `supabase.auth.*` from the browser (`signup:93`, `forgot-password:26`, `reset-password:48`); the app never renders auth email content. Switching GoTrue's transport to Brevo SMTP requires **zero code changes** — dashboard only.
2. **No competing application email code exists** to untangle or migrate (§2).
3. **A server-only secret channel already exists:** `SUPABASE_SECRET_KEY` is read server-side only in `src/lib/supabase/admin.ts:4-5`, and admin APIs run behind `requireAdmin()` (`src/lib/supabase/require-admin.ts`). `BREVO_API_KEY` belongs in exactly the same layer.
4. **One natural home for all sends:** the only order-creation entry point is `src/app/api/orders/route.ts`, and the only side-effect precedent is `src/lib/hamatee/enrolment.ts`. A sibling `src/lib/email/` module follows the existing structure exactly.
5. **Responsibilities do not overlap:** Supabase Auth owns identity mail; the app owns order/lifecycle mail. Nothing in the app currently emulates auth emails.
6. **Guardrails already written into the project's own conventions:** `.env.example:6` — "Never use `NEXT_PUBLIC_` prefix for secret keys".

Caveats: the repo has no `supabase/config.toml`, so SMTP + redirect-URL configuration lives only in the dashboard and must be documented as a deployment dependency (as `SPRINT_LOG.md:1279-1280` already does).

---

## 12. Logging + Idempotency

### Current outbound-message logging: **none**

No log/audit/outbound table exists in any migration, and no send ever occurs, so there is nothing to log yet.

### Is a future delivery log justified? — **Yes, but keep it minimal**

It is the only mechanism that can support: failed-send debugging, duplicate prevention, Brevo message-id capture, per-order email history, birthday once-per-year guarantees, and future Admin diagnostics. Without it, birthday idempotency and admin-email dedupe have nowhere to anchor.

### Minimum useful schema (design only — do not implement)

```text
email_delivery_log
  id               uuid pk default gen_random_uuid()
  template_key     text not null          -- 'order_new_admin' | 'order_received_customer'
                                           -- | 'hamatee_welcome' | 'birthday'
  recipient        text not null          -- normalized lower-case email
  user_id          uuid null              -- FK auth.users where known
  order_id         uuid null              -- FK public.orders where applicable
  status           text not null          -- 'sent' | 'failed' | 'skipped'
  brevo_message_id text null              -- from Brevo response 'messageId'
  error            text null              -- truncated error message
  metadata         jsonb null             -- order_number, variant, etc.
  sent_at          timestamptz not null default now()
  + indexes: (template_key, recipient, sent_at desc), (order_id)
  + RLS: service-role only (no anon/authenticated read)
```

### Duplicate protection

| Email | Dedupe rule |
|---|---|
| **Template 1 (Admin)** | `UNIQUE (template_key, order_id, recipient)` — critical because `create_order` is idempotent (`00009:117-126`): a retried POST with the same `idempotency_key` (`order-drawer.tsx:112-114`) returns the **same** order and would otherwise re-send |
| **Template 2 (Customer)** | Same unique key per `(template_key, order_id, recipient)` |
| **Template 3 (Welcome)** | `(template_key, user_id)` unique, or (if signup) sent once per successful `signUp` with the log row written first |
| **Template 4 (Birthday)** | `UNIQUE (template_key, recipient, extract(year from sent_at))` — this is the exact "one birthday email per Hamatee per calendar year" guarantee. Pre-insert the row (`status='sent'` after success, or a `'pending'` claim row before send) and treat a unique-violation as "already sent → skip" |

`status='skipped'` rows are useful for guest-without-email and missing-recipient diagnostics.

---

## 13. Environment Variables

Recommended **server-side only** scheme (names are recommendations; exact naming open). **No secrets in this document.**

```dotenv
# ── Brevo (Transactional API) ────────────────
BREVO_API_KEY=              # server-only. NEVER NEXT_PUBLIC_*
BREVO_SENDER_EMAIL=         # e.g. orders@hammah.store (must be a verified Brevo sender)
BREVO_SENDER_NAME=          # e.g. "SL by HAMMAH"

# ── Brevo template IDs (server-only, see §18) ─
BREVO_TEMPLATE_ID_ORDER_ADMIN=
BREVO_TEMPLATE_ID_ORDER_CUSTOMER=
BREVO_TEMPLATE_ID_HAMATEE_WELCOME=
BREVO_TEMPLATE_ID_BIRTHDAY=

# ── Cron protection (Phase E only) ──────────
CRON_SECRET=                # Bearer token guarding /api/cron/*
```

Rules:
- **No `NEXT_PUBLIC_` prefix on any Brevo variable.** `.env.example:6` already mandates this; `SUPABASE_SECRET_KEY` sets the precedent for a server-only secret.
- **Sending origin for links must NOT come from `NEXT_PUBLIC_SITE_URL`** — that variable is `http://localhost:3000` by default (`.env.example:22`) and is read by `src/lib/orders/whatsapp.ts:2,12-17`. Emails must instead use the hardcoded production constant `SITE_ORIGIN = "https://www.hammah.store"` (`src/lib/seo/site.ts:3`) / `absoluteUrl()` (`:23-26`), which is already the app's canonical origin for `metadataBase` and canonical URLs (`src/app/layout.tsx:8`).
- Supabase Auth → Brevo SMTP credentials are configured in the **Supabase Dashboard**, not in this repo's env files.
- Future implementation must also add the new names to `.env.example` (documentation only, no values).

---

## 14. Template ID Management

**Recommendation: environment variables, read from a single server-only config module.**

| Option | Verdict |
|---|---|
| **Environment variables (recommended)** ✅ | Template IDs are deployment-stable secrets-adjacent config; env vars keep them out of git, match the existing `SUPABASE_SECRET_KEY` / R2 pattern (`.env.example`), and are trivially switched per environment (preview vs production) |
| Server-only config module reading env | ✅ **Do this too** — e.g. `src/lib/email/config.ts` that validates all four IDs at first use and throws a clear error if missing. Centralises access so no route ever touches `process.env.BREVO_*` directly |
| Database settings table | ❌ Adds a DB round-trip to every send and a second source of truth; also invites a UI that can silently break sends |
| Hardcoded constants in source | ❌ Deploy-requiring code change for an ID change; IDs would differ between environments |

This mirrors the PleasureDrome discipline: one config module → one transport module → one template registry, all server-side, with IDs resolvable in exactly one place.

---

## 15. Failure Handling (per email type)

| Email | On failure | Rationale from current architecture |
|---|---|---|
| **Template 1 — Admin new order** | Log to `email_delivery_log` (`status='failed'`, error) → **order remains valid, WhatsApp continues** | Order is already committed (`route.ts:122`); only side-effect precedent (`createHamateeEnrolment`) is non-throwing by design (`enrolment.ts:63-70,84-87`, `route.ts:128-129`) |
| **Template 2 — Customer received** | Same: log and continue. Guest-without-email → `status='skipped'`, not an error | Email is optional for guests (`route.ts:18`, `.optional().nullable()`); only becomes required when a birthday is supplied (`route.ts:39-44`) |
| **Template 3 — Hamatee welcome** | Log failure; if the send is tied to `signup`, the account is still created and verification email still sent by Supabase — app mail must never gate signup | Signup already succeeds independently (`signup/page.tsx:93-104`). If a future enrolment invite is added, the enrolment row must stay **retryable in its current status** (do not advance `pending → invited` unless the send is logged as successful) — otherwise the documented "pending until email is production-ready" contract (`HAMMAH_SPRINT_REPORT.md:3421`) is broken |
| **Template 4 — Birthday** | Log failure → retry on a later run is safe, because idempotency is anchored on a **successful** log row; a failure leaves no `sent` row, so the next run may retry | Required for the once-per-year guarantee (§12) |
| **Templates 5 / 6** | N/A | No trigger exists |

**Universal rule:** no Brevo call may ever run before persistence succeeds, and no Brevo call may ever be `await`ed in a way that can reject the request handler — prefer `after()` from `next/server` and an unconditional `try/catch` that only logs.

---

## 16. Exact Implementation Scope (future — none of it is implemented now)

| Phase | Scope | New/changed areas |
|---|---|---|
| **A — Brevo Core** | Server-only Brevo transport (`POST /v3/smtp/email` wrapper using `fetch` — no SDK required), config module with env validation + template-ID registry, sender identity, shared header/footer/variant rendering contract, `email_delivery_log` writes, failure logging, `.env.example` documentation | `src/lib/email/*` (new), migration for `email_delivery_log`, `.env.example` |
| **B — Admin Order Notifications** | Notification-recipient storage (new table + `is_admin()` RLS), admin CRUD API, Admin Settings page + nav entry, Template 1 send on successful order persistence with per-`order_id` dedupe | migration, `src/app/api/admin/settings/*` (new), `src/app/admin/settings/page.tsx` (new), `admin-shell.tsx` nav, `src/app/api/orders/route.ts` |
| **C — Customer Order Received** | Template 2 on the same trigger; recipient = `orders.customer_email`; explicit `skipped` state for NULL email; product/order link CTAs to production origin | `src/lib/email/*`, `src/app/api/orders/route.ts` |
| **D — Hamatee** | Template 3 scoped to what genuinely exists (welcome after direct signup). Enrolment invite/activation email **only after** an activation flow is actually built (none exists) | `signup` flow or a server-side trigger + `src/lib/hamatee/enrolment.ts` |
| **E — Birthday** | Template 4, daily scheduler (Vercel Cron → protected `/api/cron/birthdays`), UTC/Ghana day policy, dedupe across `profiles` + `hamatee_enrolments`, year-scoped idempotency, retry semantics | `src/app/api/cron/birthdays/route.ts` (new), `vercel.json` (new), `src/lib/email/*` |
| **F — Reserved: Templates 5/6** | **Blocked by precondition:** build only after a real order-status architecture exists (Admin orders UI + status writer + event source). Today: **leave reserved, unimplemented** | — |

**Not in scope now, explicitly:** installing any SDK, wrappers, migrations, email HTML, Admin settings UI, cron jobs, status-architecture changes, `/track` changes, test emails, Supabase dashboard changes, credential exposure, Templates 5/6.

---

## 17. Files Likely Requiring Changes

| Path | Phase | Nature |
|---|---|---|
| `src/app/api/orders/route.ts` | A, B, C | Insert non-blocking send after `route.ts:122` |
| `src/lib/email/brevo.ts` (new) | A | Transport wrapper (`fetch` → `api.brevo.com/v3/smtp/email`) |
| `src/lib/email/config.ts` (new) | A | Server-only env/template-ID config |
| `src/lib/email/templates.ts` (new) | A | Template keys + variable contracts |
| `src/lib/email/log.ts` (new) | A | Delivery-log read/write |
| `src/lib/hamatee/enrolment.ts` | D | Only if invite/activation flow is ever built |
| `src/app/api/admin/settings/notification-recipients/route.ts` (new) | B | Admin CRUD (via `requireAdmin()`) |
| `src/app/admin/settings/page.tsx` (new) | B | Recipients UI |
| `src/components/admin/admin-shell.tsx` | B | Add Settings nav entry (`:23-32`) |
| `supabase/migrations/00012_notification_recipients.sql` (new) | B | Recipients table + `is_admin()` RLS |
| `supabase/migrations/00013_email_delivery_log.sql` (new) | A | Delivery log + unique idempotency constraints |
| `src/app/api/cron/birthdays/route.ts` (new) | E | Scheduled birthday dispatch |
| `vercel.json` (new) | E | Cron schedule |
| `.env.example` | A, E | Document new variable **names** only |
| `src/lib/seo/site.ts` | A–E | Reuse `SITE_ORIGIN` / `absoluteUrl()` — no change expected |

**Never touched:** `supabase/migrations/00003_orders.sql`, `00009_enforce_size_required.sql` (order semantics), `src/app/(public)/track/*`, `src/app/auth/callback/route.ts`, Supabase Auth configuration.

---

## 18. Risks

| Risk | Why it is real here | Mitigation (design) |
|---|---|---|
| **Duplicate sends** | `create_order` is idempotent and the drawer reuses one `idempotency_key` per session (`order-drawer.tsx:112-114`, `00009:117-126`) — a retry returns the same order, so a naive "send on 201" fires twice | Unique `(template_key, order_id, recipient)` in `email_delivery_log`, checked before send |
| **Order blocked by email failure** | A `throw`/reject after `route.ts:122` would return 500 and leave the drawer in error state despite a persisted order | `after()` + unconditional `try/catch` that only logs; copy the enrolment non-throwing contract |
| **Guest without email** | Email is optional (`route.ts:18`); only birthday orders force it (`route.ts:39-44`) | Template 2 skips with `status='skipped'`; never add a global email requirement |
| **Birthday timezone mistakes** | No timezone handling exists anywhere; DOB is a bare `date` | Fix the policy explicitly (Ghana = UTC+0 ⇒ UTC day is correct) and encode it in the cron route; never use server-local time |
| **Birthday double-send across sources** | `existing_account` enrolments duplicate `profiles` rows by email | Dedupe candidates by email/user before sending; enforce the year-scoped unique constraint |
| **Stale template IDs** | Four IDs across env vars can drift from Brevo | Single config module with fail-fast validation; IDs in env, not in source |
| **Secret leakage** | `BREVO_API_KEY` must never reach the browser bundle | Server-only module (no `NEXT_PUBLIC_`), same discipline as `SUPABASE_SECRET_KEY` (`.env.example:6,11`); never import `src/lib/email/*` from client components |
| **Fake order-status automation** | The status column and RLS UPDATE policy look operational but nothing writes them (`00003:26,244-249`) | Templates 5/6 stay RESERVED; no "confirmed/shipped" copy may be generated from `orders.status` |
| **Preview/localhost CTA leakage** | `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` (`.env.example:22`) and is already used for WhatsApp links (`whatsapp.ts:2,12-17`) | All email links built from `SITE_ORIGIN` (`src/lib/seo/site.ts:3`) / `absoluteUrl()`; never from `window.location.origin` or `NEXT_PUBLIC_SITE_URL` |
| **Auth-link redirect drift** | Signup has no `emailRedirectTo` in code — the verification/reset target is dashboard-controlled | Handled outside the repo; document as a deployment dependency alongside Brevo SMTP (as `SPRINT_LOG.md:1279-1280` already does) |

---

**Investigation complete. No code, templates, credentials, migrations, or configuration were created or modified.**

HAMMAH BREVO EMAIL ARCHITECTURE INVESTIGATION COMPLETE
