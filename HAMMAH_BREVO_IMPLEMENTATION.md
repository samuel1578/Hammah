# HAMMAH Brevo Sprint 1 — Core Result

> Authoritative implementation record for **Sprint 1 — Core Email Infrastructure + Database Foundations**.
> Source of truth for the architecture: `HAMMAH_BREVO_EMAIL_ARCHITECTURE_INVESTIGATION.md`.
> This sprint builds the reusable, server-only Brevo foundation. It intentionally sends **no** email.

Canonical production origin: `https://www.hammah.store`
Production sender: `SL by HAMMAH <hello@hammah.store>`

---

## 1. Executive Summary

**Sprint 1 status: COMPLETE.**

All eight required deliverables were implemented:

1. Brevo configuration module — done (`src/lib/email/config.ts` + `src/lib/email/guard.ts`)
2. Brevo transactional transport — done (`src/lib/email/brevo.ts`, native `fetch`, **no SDK added**)
3. Template registry — done (`src/lib/email/templates.ts`)
4. Email delivery logging — done (`src/lib/email/log.ts` + migration `00012`)
5. Email idempotency foundations — done (unique `dedupe_key` + claim/send/mark helper `src/lib/email/send.ts`)
6. Admin notification recipient storage — done (migration `00013` + `src/lib/email/recipients.ts`)
7. Environment-variable documentation — done (`.env.example`; see Observation 15.1)
8. Safe reusable helpers — done (config, templates, transport, logging, send orchestration, recipient reader)

Both migrations were **created and applied** to the linked Supabase project via the project's normal Supabase CLI workflow (`npx supabase db push`). No email was sent, no order/signup/birthday flow was touched, and Templates 5/6 remain absent.

TypeScript and production build pass. Lint is **unchanged** from the pre-existing baseline (see §17).

---

## 2. Pre-Implementation State

| Item | Finding |
|---|---|
| **Latest migration before Sprint 1** | `supabase/migrations/00011_product_video_media_picker.sql`. All 11 existing migrations (`00001`–`00011`) were confirmed **already applied** on the remote project (`Local | Remote` matched for every row). |
| **Next migration numbers** | The investigation expected `00012`/`00013`; this was confirmed correct — the next valid sequential numbers were `00012` and `00013`. |
| **Existing email-related files** | None. No `src/lib/email/*`, no Brevo references, no mail/SMTP code existed. Nothing changed since the investigation in this area. |
| **Server Supabase client used** | `src/lib/supabase/admin.ts` → `createAdminClient()` (reads `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SECRET_KEY`, service-role; used by the new log/recipient helpers). Admin route guard pattern is `src/lib/supabase/require-admin.ts` (`requireAdmin()`). |
| **Existing site-origin utility** | `src/lib/seo/site.ts` exports `SITE_ORIGIN = "https://www.hammah.store"` and `absoluteUrl()`. This is the canonical origin future email CTAs must use; it was **not modified** (reuse only). |
| **`order`/`order_items` shape** | Confirmed from `00003_orders.sql` / `00009_enforce_size_required.sql`: `orders.id`, `orders.order_number`, `orders.customer_email` (nullable), `orders.user_id`, `order_items` snapshots. FK targets for `email_delivery_log` are valid. |
| **Existing admin-CRUD RLS convention** | `public.cta_placements` (`00002`) is the precedent: dedicated table + `is_admin()` RLS for SELECT/INSERT/UPDATE/DELETE. `notification_recipients` copies it. |
| **`handle_updated_at()` / `is_admin()`** | Both exist from `00001_initial_schema.sql`; reused unchanged. |
| **Supabase project link** | Linked project ref `nclnuqqxiudnvuylhsbo` (`supabase/.temp/linked-project.json`). |
| **Deviation from investigation** | The investigation suggested `00012 = notification_recipients` and `00013 = email_delivery_log`. To follow the Sprint 1 brief's ordering (delivery log is deliverable 5, recipients is deliverable 8), the numbers were assigned as **`00012 = email_delivery_log`** and **`00013 = notification_recipients`**. Both are the correct next sequential numbers; ordering is cosmetic. |

---

## 3. Brevo Configuration Layer

**Files created:** `src/lib/email/config.ts`, `src/lib/email/guard.ts`

- **Environment variables consumed** (names only):
  - `BREVO_API_KEY`
  - `BREVO_SENDER_EMAIL`
  - `BREVO_SENDER_NAME`
  - `BREVO_TEMPLATE_ID_ORDER_ADMIN`
  - `BREVO_TEMPLATE_ID_ORDER_CUSTOMER`
  - `BREVO_TEMPLATE_ID_HAMATEE_WELCOME`
  - `BREVO_TEMPLATE_ID_BIRTHDAY`
- **Validation strategy:** lazy (read-at-send-time). `getBrevoApiKey()`, `getBrevoSender()`, `getBrevoTemplateId(key)` and `getBrevoConfig()` throw a typed `BrevoConfigError` with a clear message only when called with a missing/blank value. Importing the module never throws, so unrelated build paths and routes do not crash.
  - Template IDs are parsed to numbers and must be positive integers.
  - `getBrevoConfigProblems()` / `isBrevoConfigured()` provide a non-throwing probe (returns names of missing values, never values).
- **Server-only safeguards:** `src/lib/email/guard.ts` exposes `assertServerRuntime()`, which throws if any email module is reached while `typeof window !== "undefined"`. The `server-only` npm package is **not** installed in this project, so this runtime guard substitutes for it; import discipline remains the primary rule. No email module is imported from any client component.
- **Central config object:** `getBrevoConfig()` returns `{ apiKey, sender: { email, name }, templateIds }`. Send paths use the granular accessors so a missing birthday ID cannot block an order email.
- **Actual template IDs mapped (from registry, resolved from env):** `order_new_admin → BREVO_TEMPLATE_ID_ORDER_ADMIN`, `order_received_customer → BREVO_TEMPLATE_ID_ORDER_CUSTOMER`, `hamatee_welcome → BREVO_TEMPLATE_ID_HAMATEE_WELCOME`, `birthday → BREVO_TEMPLATE_ID_BIRTHDAY`.
- The **API key value is never present in source** and is never logged or returned in errors.

---

## 4. Template Registry

**File:** `src/lib/email/templates.ts`

| Brevo # | Template name | Registry key | Env var | Dedupe scope | Params contract |
|---|---|---|---|---|---|
| 1 | HAMMAH — New Order Notification — Admin | `order_new_admin` | `BREVO_TEMPLATE_ID_ORDER_ADMIN` | `order_recipient` | `order_number, order_url, customer_name, customer_phone, customer_email, delivery_*, customer_note, items, created_at` |
| 2 | HAMMAH — Order Request Received — Customer | `order_received_customer` | `BREVO_TEMPLATE_ID_ORDER_CUSTOMER` | `order_recipient` | `first_name, order_number, order_url, product_name, product_url, product_image_url, size, quantity, price_display, created_at` |
| 3 | HAMMAH — Hamatee Welcome | `hamatee_welcome` | `BREVO_TEMPLATE_ID_HAMATEE_WELCOME` | `user` | `first_name, account_url` |
| 4 | HAMMAH — Happy Birthday | `birthday` | `BREVO_TEMPLATE_ID_BIRTHDAY` | `year_recipient` | `first_name, shop_url` |

- **Templates 5 and 6 remain absent.** They appear only inside a header comment marked RESERVED; there is no key, no env var, no mapping, and no code reference.
- `EMAIL_TEMPLATES` is the single source of truth. `getTemplateId(key)`, `getTemplateDefinition(key)`, `isEmailTemplateKey(value)` and `getEmailTemplateKeys()` are the supported accessors.
- Parameter contracts are additionally expressed as TypeScript interfaces: `OrderNewAdminEmailParams`, `OrderReceivedCustomerEmailParams`, `HamateeWelcomeEmailParams`, `BirthdayEmailParams`, and `OrderEmailItem`.

---

## 5. Brevo Transport

**File:** `src/lib/email/brevo.ts`

- **Endpoint:** `POST https://api.brevo.com/v3/smtp/email`
- **Authentication:** `api-key: <BREVO_API_KEY>` request header (read from env at send time; never logged).
- **SDK:** None added. Native `fetch` is used, matching project style. `package.json` unchanged.
- **Request architecture:** body = `{ sender, to: [{ email[, name] }], templateId, params?, tags? }`. `sender` is the configured `SL by HAMMAH <hello@hammah.store>` (from `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME`).
- **Response handling:** response text is parsed as JSON when possible. Success → `messageId` extracted from the Brevo response (`messageId` field, else `null`).
- **Error handling:** the function **never throws**. All paths return a normalised `SendEmailResult = { success, messageId, error }`:
  - missing recipient → `error: "Missing recipient email."`
  - missing/invalid config → `BrevoConfigError` message (truncated)
  - network failure → `"Network error contacting Brevo: …"`
  - non-2xx → `"Brevo rejected the email (HTTP <status>): <Brevo message>"`
  - errors are truncated to 500 chars; no request body, header, or API key is included.
- **Message-ID handling:** returned to the caller; the logging layer stores it via `markSent` / `recordBrevoMessageId`.
- `isBrevoConfigured()` is re-exported for callers.

---

## 6. Email Delivery Log

**Migration:** `supabase/migrations/00012_email_delivery_log.sql` (applied — see §9)

**Table `public.email_delivery_log`:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `template_key` | `text not null` | registry key |
| `recipient` | `text not null` | stored lower-case (CHECK) |
| `user_id` | `uuid null` | → `auth.users(id) ON DELETE SET NULL` |
| `order_id` | `uuid null` | → `public.orders(id) ON DELETE SET NULL` |
| `status` | `text not null default 'pending'` | CHECK in `pending/sent/failed/skipped` |
| `dedupe_key` | `text null` | idempotency anchor |
| `brevo_message_id` | `text null` | Brevo response ID |
| `error` | `text null` | truncated failure reason |
| `metadata` | `jsonb null` | free-form context (order number, etc.) |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | maintained by `handle_updated_at()` trigger |
| `sent_at` | `timestamptz null` | set on successful send |

**Statuses:** `pending`, `sent`, `failed`, `skipped` (enforced by CHECK).

**Indexes / constraints:**
- `ux_email_delivery_log_dedupe_key` — **UNIQUE** on `dedupe_key WHERE dedupe_key IS NOT NULL` (idempotency).
- `idx_email_delivery_log_template_recipient` on `(template_key, recipient, created_at DESC)`.
- `idx_email_delivery_log_order` on `(order_id)`.
- `idx_email_delivery_log_user` on `(user_id)`.
- `idx_email_delivery_log_status` on `(status)`.
- `email_delivery_log_recipient_lowercase` CHECK (`recipient = lower(recipient)`).
- `email_delivery_log_dedupe_key_not_blank` CHECK.

**RLS:** Enabled. **No anon/authenticated write policy** and no public read policy. A single admin read policy `"Email delivery log: admins can read"` (`TO authenticated USING public.is_admin()`) was added for future diagnostic surfaces. Writes happen only through the service-role client. Verified remotely: anon INSERT is rejected (`42501`) and anon SELECT returns zero rows.

**Idempotency design — why a dedicated `dedupe_key`:**
A single unique column expresses three different dedupe rules without several awkward partial expression indexes or template-specific columns. Keys are built centrally in `src/lib/email/log.ts`:

| Template | `dedupe_key` format |
|---|---|
| `order_new_admin` | `order_new_admin:order:<order_id>:<recipient>` |
| `order_received_customer` | `order_received_customer:order:<order_id>:<recipient>` |
| `hamatee_welcome` | `hamatee_welcome:user:<user_id>:<recipient>` |
| `birthday` | `birthday:year:<year>:<recipient>` |

`claimDelivery()` inserts a `pending` row before any Brevo call; a unique violation (`23505`) is the duplicate signal. `sent`/`pending`/`skipped` existing rows are not re-claimed; a `failed` row is reset to `pending` so a later run can retry. This makes order-email dedupe correct even though `create_order` is idempotent (a retried POST returns the same order), and it supports future once-per-user welcome and once-per-calendar-year birthday guarantees.

**ON DELETE behaviour:** `user_id` and `order_id` use `ON DELETE SET NULL`, deliberately **not** CASCADE, so historical delivery records survive deletion of a related order/user.

---

## 7. Notification Recipients

**Migration:** `supabase/migrations/00013_notification_recipients.sql` (applied — see §9)

**Table `public.notification_recipients`:** one row per recipient (never a comma-separated string).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `email` | `text not null` | lower-case (CHECK); format CHECK via regex |
| `label` | `text null` | e.g. "Owner" |
| `enabled` | `boolean not null default true` | |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | `handle_updated_at()` trigger |

**Uniqueness rules:** `ux_notification_recipients_email` UNIQUE on `email` (emails normalised lower-case, so a plain unique index prevents obvious duplicates). CHECK constraints: `notification_recipients_email_lowercase`, `notification_recipients_email_format` (`^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$`). Also `idx_notification_recipients_enabled`.

**RLS:** Enabled. Admin-only `is_admin()` policies for SELECT, INSERT, UPDATE and DELETE (mirrors `cta_placements`). **No anon policy** — the storefront cannot read or modify the list. Verified remotely: anon INSERT rejected (`42501`); anon SELECT returns zero rows.

**Server-read strategy:** the service-role client (which bypasses RLS) reads enabled rows through `getEnabledOrderNotificationRecipients()`. The Admin CRUD UI/API is **not** built in this sprint (Sprint 2).

---

## 8. Email Helpers

All helper modules are server-only (guarded by `assertServerRuntime()`), never imported from client code, and never throw into request handlers.

| Module | Contract |
|---|---|
| `src/lib/email/guard.ts` | `assertServerRuntime(): void` — throws if executed in a browser context. |
| `src/lib/email/config.ts` | `BrevoConfigError`; `BREVO_TEMPLATE_ENV_VARS`; `getBrevoTemplateId(key): number`; `getBrevoApiKey(): string`; `getBrevoSender(): {email,name}`; `getBrevoConfig(): BrevoConfig`; `getBrevoConfigProblems(): string[]`; `isBrevoConfigured(): boolean`. |
| `src/lib/email/templates.ts` | `EMAIL_TEMPLATE_KEYS`; `EmailTemplateKey`; `EMAIL_TEMPLATES`; `getTemplateId(key): number`; `getTemplateDefinition(key)`; `isEmailTemplateKey(value)`; `getEmailTemplateKeys()`; param-contract interfaces. |
| `src/lib/email/brevo.ts` | `sendTemplateEmail({ templateKey, to, toName?, params?, tags? }): Promise<{ success, messageId, error }>`; re-exports `isBrevoConfigured`. |
| `src/lib/email/log.ts` | `claimDelivery(params): Promise<DeliveryClaim>`; `markSent(logId, messageId)`; `markFailed(logId, error)`; `markSkipped(logId, reason)`; `recordBrevoMessageId(logId, messageId)`; key builders `buildOrderDedupeKey`, `buildUserDedupeKey`, `buildYearlyDedupeKey`, `buildRecipientDedupeKey`; `normalizeEmail`. |
| `src/lib/email/send.ts` | `sendTrackedTemplateEmail(params): Promise<TrackedSendResult>` — orchestrates **claim → send → mark**; returns `status: sent \| failed \| duplicate \| skipped`. Skips (no DB row) when there is no recipient, avoiding logging noise for email-less guests. |
| `src/lib/email/recipients.ts` | `getEnabledOrderNotificationRecipients(): Promise<NotificationRecipient[]>` — normalised, deduped, returns `[]` on error. |

**Recommended usage in later sprints:** `sendTrackedTemplateEmail` for all four templates; pass an explicit `dedupeKey` (via `buildYearlyDedupeKey`) for `birthday`.

---

## 9. Migration Status

- **Created:**
  - `supabase/migrations/00012_email_delivery_log.sql`
  - `supabase/migrations/00013_notification_recipients.sql`
- **Applied:** **YES** — both applied with `npx supabase db push`.
- **Not applied:** none.
- **Supabase project used:** linked project ref `nclnuqqxiudnvuylhsbo` (from `supabase/.temp/linked-project.json`; no credentials exposed).
- **Verification:** `npx supabase migration list` shows `00012` and `00013` present in both Local and Remote columns. Remote constraint/RLS behaviour was additionally verified over the REST API (see §10 and §17).
- **Note:** `supabase` CLI was invoked via `npx` (transient install `2.119.0`); it transiently rewrote `supabase/.temp/cli-latest`, which was restored with `git checkout`. No project dependency was added.

---

## 10. Security Review

| Check | Result |
|---|---|
| API key is server-only | ✅ read only via `getBrevoApiKey()` inside `src/lib/email/*`; guard throws in browser. |
| No `NEXT_PUBLIC_` Brevo secrets | ✅ zero occurrences of `NEXT_PUBLIC_BREVO` anywhere. |
| No secret outside `src/lib/email` | ✅ `grep BREVO_` finds no usage outside `src/lib/email`. |
| Recipient table cannot be read publicly | ✅ no anon policy; anon SELECT returns zero rows; anon INSERT rejected `42501`. |
| Delivery log cannot be read publicly | ✅ only an admin SELECT policy; anon SELECT zero rows; anon INSERT rejected `42501`. |
| Errors do not leak sensitive payloads | ✅ errors are normalised, truncated (500 chars transport / 1000 chars log), and never include the API key, request body, or headers. |
| No real API keys committed | ✅ `.env.example` contains variable **names only**; no key material in source. |
| Transport never throws into request handlers | ✅ all paths return a normalised result. |

Remote verification performed via the REST API (no secrets printed): service-role reads succeeded; anon reads returned empty; anon inserts rejected with RLS `42501` on both tables.

---

## 11. Current System Behaviour After Sprint 1

| Question | Answer |
|---|---|
| Are order emails sending automatically? | **NO** — `src/app/api/orders/route.ts` was not modified. |
| Are signup welcomes sending automatically? | **NO** — no signup flow change. |
| Are birthday emails scheduled? | **NO** — no cron, no `vercel.json`, no scheduler. |
| Can Admin manage recipients yet? | **NO** — no Admin UI/API (Sprint 2). |

**What is now READY for later sprints:** a working server-only transport, a template registry, delivery logging with a race-safe claim, an idempotency foundation, a recipient table + reader, a tracked-send orchestrator, and documented env vars. The only things missing before a live send are: Brevo credentials in the deployment environment, and the trigger wiring owned by Sprints 2–5.

No Brevo API call was made in this sprint. `BREVO_*` variables are not present in the local `.env.local`; therefore the live transport was not exercised (see §17 limitations).

---

## 12. Files Created

- `src/lib/email/guard.ts`
- `src/lib/email/config.ts`
- `src/lib/email/templates.ts`
- `src/lib/email/brevo.ts`
- `src/lib/email/log.ts`
- `src/lib/email/send.ts`
- `src/lib/email/recipients.ts`
- `supabase/migrations/00012_email_delivery_log.sql`
- `supabase/migrations/00013_notification_recipients.sql`
- `HAMMAH_BREVO_SPRINT_1_CORE_RESULT.md` (this report)

## 13. Files Modified

- `.env.example` — appended Brevo variable **names only** (server-only section). ⚠️ Local-only edit: see Observation 15.1 (the file is git-ignored/untracked).
- (Verification tooling) `supabase/.temp/cli-latest` was transiently rewritten by the Supabase CLI and **restored** via `git checkout`; it is not part of this change set.

## 14. Files Intentionally Not Modified

- `src/app/api/orders/route.ts` (order creation / Templates 1–2 wiring — Sprint 3)
- `src/app/(public)/signup/page.tsx` and all signup logic (Template 3 — Sprint 4)
- `src/lib/hamatee/enrolment.ts` (Hamatee enrolment logic)
- WhatsApp handoff: `src/lib/orders/whatsapp.ts`, `src/components/product/order-drawer.tsx`
- `src/app/(public)/track/*` and `src/app/auth/callback/route.ts`
- Supabase Auth SMTP configuration (dashboard-side; out of repo)
- Order persistence / `create_order` RPC / `00003` / `00009` / gift snapshots
- Existing RLS unrelated to the new tables; guest email rules; product/order snapshots
- `src/lib/seo/site.ts` (reused, unchanged)
- Admin shell / Admin Orders / Admin Settings (Sprint 2)
- `vercel.json` / cron configuration (Sprint 5)

---

## 15. Observations / Unexpected Findings

**15.1 — `.env.example` is git-ignored and untracked.**
`.gitignore:34` contains `.env*`, which matches `.env.example`. `git ls-files .env.example` returns nothing, so the file exists on disk but is **not tracked**. The required Sprint 1 edit was made correctly (names only), but it will not propagate through git and cannot be committed as-is. Future sprints/developers should either intentionally un-ignore `.env.example` (e.g. `!.env.example`) or otherwise ensure the documented variable names are shared. This sprint did **not** change `.gitignore` (out of scope, and could risk exposing local env files).

**15.2 — Duplicate worktree `.kilo/worktrees/nova-flock` is scanned by ESLint.**
A full-repo `npx eslint .` scans `.kilo/worktrees/nova-flock/`, a second copy of the source tree, roughly doubling reported findings. `npx eslint src` reports the real source-tree baseline (57 errors / 78 warnings). Any future lint count comparison must account for this.

**15.3 — No Brevo credentials configured locally.**
`.env.local` contains no `BREVO_*` variables, so the transport could not be exercised against the live Brevo API, and no real email was (correctly) sent. Configuration is expected to be supplied via deployment environment variables.

**15.4 — No generated Supabase database types.**
The project does not use a generated `Database` type; queries are untyped. The new helpers therefore query `email_delivery_log` / `notification_recipients` without compile-time column typing, consistent with the rest of the codebase. The remote constraint/RLS verification compensates for this gap.

**15.5 — `email_delivery_log` admin-read policy added beyond the investigation.**
The investigation suggested "service-role only". A single admin `SELECT` policy was added (`is_admin()`), matching the `cta_placements` convention, for future Admin diagnostics. It exposes nothing publicly and adds no write access. Documented as an intentional, non-public extension.

**15.6 — `server-only` package is not installed.**
Next's `server-only` guard package is absent from `node_modules`. A runtime `assertServerRuntime()` guard was implemented instead, without adding a dependency.

**15.7 — `NEXT_PUBLIC_SITE_URL` risk remains for email CTAs.**
`src/lib/orders/whatsapp.ts` reads `NEXT_PUBLIC_SITE_URL` (defaults to `http://localhost:3000`). Email CTAs must **not** use it. Future sprints must build links from `SITE_ORIGIN` / `absoluteUrl()` in `src/lib/seo/site.ts` (documented in the registry/params contracts; no URL generation was added in Sprint 1).

---

## 16. Deferred Work

- **Sprint 2 — Admin Orders + Admin Notification Settings**
  - `src/app/api/admin/settings/notification-recipients/...` CRUD (via `requireAdmin()`)
  - `src/app/admin/settings/page.tsx` + a 9th Admin nav entry (`src/components/admin/admin-shell.tsx`)
  - Admin Orders surfaces; optional delivery-log diagnostics UI
- **Sprint 3 — Templates 1/2 Order Trigger Wiring**
  - non-blocking send after `create_order` succeeds in `src/app/api/orders/route.ts` (prefer `after()`), reading persisted `orders` + `order_items`
  - use `sendTrackedTemplateEmail` with `order` dedupe keys; Template 2 skips guests without email
- **Sprint 4 — Hamatee Welcome (Template 3)**
  - wire `hamatee_welcome` to the genuine signup trigger only; enrolment invite/activation remains blocked until an activation flow exists
- **Sprint 5 — Birthday Automation (Template 4)**
  - `/api/cron/birthdays` + `vercel.json` schedule; UTC/Ghana day policy; dedupe across `profiles` + `hamatee_enrolments`; yearly dedupe key
- **Templates 5/6** — remain RESERVED, blocked until a real order-status architecture exists.

---

## 17. Validation Results

**Baseline (before changes):**
- `npx tsc --noEmit` → **0 errors**.
- `npm run build` → not run pre-change; post-change passes (below).
- `npx eslint src` → **57 errors / 78 warnings** (pre-existing debt). Full `npx eslint .` = 114 errors / 156 warnings (includes the duplicate `.kilo` worktree).

**After changes:**
- `npx tsc --noEmit` → **PASS, 0 errors**.
- `npm run build` → **PASS** (all routes compiled; `/api/orders` unchanged).
- `npx eslint src/lib/email` → **0 errors, 0 warnings**.
- `npx eslint src` → **57 errors / 78 warnings**.
- **New errors introduced by Sprint 1: 0.**
- **Pre-existing/unrelated errors: 57 (src tree) / 114 (full scan incl. `.kilo` duplicate).** Not fixed, per instructions.
- Bandwidth/`no-img-element` warnings and `react-hooks/*` errors in existing components are unrelated to this sprint.

**Migration SQL inspection:**
- Constraints valid (`status` CHECK, lowercase CHECK, recipient format CHECK, dedupe non-blank CHECK); correct FK targets with `ON DELETE SET NULL` (no cascading deletion of history).
- Indexes present (unique dedupe index + order/user/template/status indexes).
- RLS enabled with admin-only policies and **no public access**.
- No destructive statements (`DROP`, `TRUNCATE`, `DELETE`, `ALTER ... DROP`); all statements are additive and use `IF NOT EXISTS` where applicable.

**Live database verification (post-apply):**
- `npx supabase migration list` → `00012` and `00013` applied.
- Service-role reads on both tables succeed; anon reads return zero rows.
- anon INSERT rejected on both tables (`42501`, RLS).
- Unique dedupe index on `email_delivery_log` rejects a second insert with the same `dedupe_key` (`23505`).
- Unique email index on `notification_recipients` rejects duplicates (`23505`); uppercase email rejected by CHECK (`23514`) on both tables.
- `pending → sent` update with `brevo_message_id` / `sent_at` succeeds.
- All probe rows were cleaned up; probe/anonymous RLS tests left no data.

**Limitations (not passed, not attempted):**
- Live Brevo send was **not** exercised (no `BREVO_API_KEY` locally) and was deliberately out of scope.
- Direct schema introspection via `supabase db dump` / `psql` was unavailable (no Docker/psql); verification used `migration list` + REST API assertions instead.

---

## 18. Sprint 2 Readiness

- [x] Brevo transport available — `sendTemplateEmail()` (`src/lib/email/brevo.ts`)
- [x] Template registry available — `EMAIL_TEMPLATES` + `getTemplateId()` (`src/lib/email/templates.ts`)
- [x] Delivery logging available — `claimDelivery` / `markSent` / `markFailed` / `markSkipped` (`src/lib/email/log.ts`)
- [x] Idempotency foundation available — unique `dedupe_key` + key builders + `sendTrackedTemplateEmail()` (`src/lib/email/send.ts`)
- [x] Notification recipient table available — `public.notification_recipients` (applied)
- [x] Recipient reader available — `getEnabledOrderNotificationRecipients()` (`src/lib/email/recipients.ts`)
- [x] Migrations applied — `00012`, `00013` live on project `nclnuqqxiudnvuylhsbo`; no pending action
- [x] Configuration layer available — `src/lib/email/config.ts` + `src/lib/email/guard.ts`

**Outstanding for a live send (not Sprint 1 scope):** supply `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` and the four template-ID variables in the deployment environment (local `.env.local` currently has none), and ensure `.env.example` documentation is actually shareable (Observation 15.1).

---

HAMMAH BREVO SPRINT 1 CORE COMPLETE
---

# Sprint 2 — Admin Orders + Admin Notification Settings

> Appended section. Sprint 1 content above is preserved exactly. This single file is the authoritative implementation history for the entire HAMMAH Brevo rollout; all future Brevo sprints append here.

## 2.1 Sprint Status

**COMPLETE.**

Both Sprint 2 objectives were delivered:

- **A. Admin Orders** — `/admin/orders` (list) and `/admin/orders/[order_number]` (detail) read real persisted `orders` + `order_items` data.
- **B. Admin Settings → Order Notification Recipients** — `/admin/settings` with full add / edit / enable-disable / delete management over `public.notification_recipients`, backed by Admin-only API routes.

No email was sent, no order/signup/birthday flow was touched, and no status automation was added. No new migrations were required (Sprint 1 tables are reused).

## 2.2 Starting State

Sprint 2 inherited the complete Sprint 1 foundation:

- Server-only email modules in `src/lib/email/` (`guard`, `config`, `templates`, `brevo`, `log`, `send`, `recipients`) — **not modified** in Sprint 2.
- Migrations `00012_email_delivery_log.sql` and `00013_notification_recipients.sql` — applied on the linked project.
- Reusable helpers `sendTemplateEmail()`, `sendTrackedTemplateEmail()`, `claimDelivery()`, `markSent()`, `markFailed()`, `markSkipped()`, `getEnabledOrderNotificationRecipients()`, `EMAIL_TEMPLATES`, `getTemplateId()`, `SITE_ORIGIN`, `absoluteUrl()`, `requireAdmin()`, `createAdminClient()`.

Existing Admin architecture discovered and reused:

- **App Router** under `src/app/admin/*`; all `/admin` pages share one layout/shell: `src/app/admin/layout.tsx` → `src/components/admin/admin-shell.tsx` (sidebar nav + mobile drawer).
- **Page auth**: `src/middleware.ts` matches `/admin/:path*`, requires a session and `profiles.role === 'admin'`, else redirects to `/admin/login`. Admin pages are therefore already gated server-side.
- **Admin API auth**: every `src/app/api/admin/**` route uses `requireAdmin()` (`src/lib/supabase/require-admin.ts`), returning 401/403 and a service-role client.
- **Existing page patterns**: Dashboard is a server component using `createClient()` + RLS; CTAs uses client components fetching `/api/admin/*`. Sprint 2 follows both conventions where appropriate.
- **RLS already supports Admin reads**: `orders` ("admins can read all") and `order_items` ("admins can read all") from `00003_orders.sql`; `notification_recipients` admin-only policies from `00013`.
- **Price convention**: `formatPrice()` in `src/lib/currency.ts` (whole units: `300` → `GHS 300.00`; never divide by 100).

## 2.3 Admin Navigation Changes

**File changed:** `src/components/admin/admin-shell.tsx`

- Added lucide icons `ShoppingBag` and `Settings` to the import list.
- `navItems` now: Dashboard, **Orders**, Products, Categories, Collections, Size Guides, Media, Homepage, CTAs, **Settings**.
- `Orders` was inserted directly after `Dashboard`; `Settings` was appended as the last item. No existing item was removed, and the existing items keep their original relative order.
- The `NavLink` component, active-state logic, mobile drawer and styling were not changed; both new entries appear in the desktop sidebar and the mobile drawer automatically because they are driven by `navItems`.
- No second Admin layout was created.

## 2.4 Admin Orders List

- **Route:** `/admin/orders` → `src/app/admin/orders/page.tsx` (server component).
- **Query (real data, no fixtures):** session-scoped `createClient()`; `orders` select `id, order_number, customer_name, source, user_id, status, communication_channel, created_at` plus nested `order_items (product_name_snapshot, quantity, pricing_mode_snapshot, price_amount_snapshot, currency)`.
- **Ordering:** `.order("created_at", { ascending: false })` — newest first.
- **Columns:** Order · Customer · Product · Source · Price · Status · Created.
  - **Source** cell shows the derived customer type badge (`Hamatee` / `Guest`) and the communication channel (`whatsapp`) beneath it.
  - **Product** cell shows the primary item name and `+N more` when the order has multiple units (hidden below `md`).
  - **Price** cell shows the primary item price via `itemPriceDisplay()` (`Price on request` for `PRICE_ON_REQUEST` / null amount); hidden below `lg`.
  - **Created** cell shows `en-GB` short date; hidden below `sm`.
- **Row linking:** each order number is a link to `/admin/orders/<order_number>` — uses `order_number`, never a UUID.
- **Auth protection:** middleware (session + admin role) plus the admin RLS SELECT policies (`is_admin()`). No service-role client is used for the list.
- **Empty state:** "No orders yet. Website orders will appear here as they are placed."
- **Error state:** a safe banner ("Failed to load orders. Please refresh the page.") — no raw DB error shown.

## 2.5 Admin Order Detail

- **Route:** `/admin/orders/[order_number]` → `src/app/admin/orders/[order_number]/page.tsx` (server component). `generateMetadata` sets the title to the order number.
- **Lookup strategy:** `createClient()`, `.from("orders").select(...).eq("order_number", order_number).maybeSingle()`; if no row → `notFound()`. Nested `order_items` are selected in the same query.
- **Fields displayed:**
  - **Order Summary:** Order number · Created (date + time) · Status · Customer type · Channel.
  - **Customer:** Name · Phone · Email · Customer type. Type derived from `orders.source` / `orders.user_id`.
  - **Items:** product image, product name, size (`variant_label` fallback `variant_value`), quantity, pricing mode, price, currency, and a **View product →** link.
  - **Delivery:** Region · City / Town · Area · Landmark · GhanaPost GPS · Delivery notes.
  - **Customer Note:** shown when present, otherwise "No customer note".
  - **Admin Notes:** shown read-only when present, otherwise "None. Editing is not available yet." (editing deferred).
- **Product snapshot handling:** all values read from persisted `order_items` snapshot columns (`product_name_snapshot`, `product_slug_snapshot`, `media_url_snapshot`, `variant_label/value`, `pricing_mode_snapshot`, `price_amount_snapshot`, `currency`).
- **Nullable-field handling:** `orNotProvided()` renders "Not provided" for blank/null delivery/customer/email values, so no blank rows are shown. Email null → "Not provided".
- **Product link:** `absoluteUrl('/product/<slug>')` → `https://www.hammah.store/product/<slug>` (built from `SITE_ORIGIN`; never `NEXT_PUBLIC_SITE_URL`, `window.location.origin`, localhost or preview hosts).
- **Price:** via `itemPriceDisplay()`; `PRICE_ON_REQUEST` → "Price on request"; whole-unit convention preserved.

## 2.6 Notification Settings

- **Route:** `/admin/settings` → `src/app/admin/settings/page.tsx` (server component) rendering `src/components/admin/notification-recipients-settings.tsx` (client component).
- **Page:** a single "Order Notifications" section (no generic settings framework).
- **Initial data:** the server page reads `notification_recipients` (`id, email, label, enabled, created_at, updated_at`, ordered by email) through the session client + admin RLS, and passes it to the client component. This avoids a client-fetch-on-mount effect (see §2.16).
- **Fields:** Label · Email · Status (Enabled / Disabled) · Actions.
- **Add:** email + optional label + enabled checkbox, submitted to the API; email normalised to lowercase server-side.
- **Edit:** inline row editing of label and email plus an enabled checkbox, saved via the API.
- **Enable / disable:** a toggle per row calls the update API; disabled rows remain stored and will be excluded by `getEnabledOrderNotificationRecipients()` in Sprint 3.
- **Delete:** with a confirmation; removes only the `notification_recipients` row.
- **Empty state (exact copy):**
  - "No order notification recipients configured."
  - "Add at least one email address before enabling Admin order notifications."
  - No fake/seed recipient is inserted automatically.

## 2.7 Notification Recipient API

All routes call `requireAdmin()` (401/403 on failure) and use the service-role client.

| Method + path | Purpose |
|---|---|
| `GET  /api/admin/settings/notification-recipients` | List all recipients (id, email, label, enabled, timestamps), ordered by email. |
| `POST /api/admin/settings/notification-recipients` | Create a recipient. |
| `PUT  /api/admin/settings/notification-recipients/[id]` | Update label / email / enabled (only provided fields). |
| `DELETE  /api/admin/settings/notification-recipients/[id]` | Delete a recipient. |

Behaviour:

- Email is trimmed and lowercased before persistence (`normalizeRecipientEmail`); labels trimmed and length-capped (`normalizeRecipientLabel`).
- Validation messages returned: "Email is required." · "Please enter a valid email address." · "Enabled must be true or false." · "Nothing to update." · "Recipient not found." · and duplicate → **409** "A recipient with this email already exists."
- Duplicate detection uses the DB unique constraint (`23505`); the raw Postgres message is not exposed.
- Unexpected DB errors log server-side and return a generic "Failed to add/update/delete recipient."
- `DELETE` only touches `notification_recipients` — no cascading effect on `email_delivery_log`, `orders` or users.

## 2.8 Security

- ✅ Every recipient API method uses `requireAdmin()` (read included) — no anonymous access.
- ✅ All `/admin` pages are protected by the existing middleware (session + `profiles.role = 'admin'`).
- ✅ RLS preserved; `notification_recipients` keeps admin-only SELECT/INSERT/UPDATE/DELETE with no anon policy.
- ✅ No public access to `notification_recipients` or `email_delivery_log` (Sprint 1 RLS unchanged).
- ✅ Orders list/detail read through the user-session client with existing admin RLS (`orders`, `order_items`) — no service-role exposure on the page layer.
- ✅ No secrets introduced; no `NEXT_PUBLIC_` Brevo variables.

## 2.9 Template #1 CTA Readiness

**Confirmed.** The Admin order detail route `/admin/orders/[order_number]` exists and resolves order numbers such as `/admin/orders/HAM-2026-0014`, matching the Brevo Template #1 CTA contract `https://www.hammah.store/admin/orders/{{ params.order_number }}`. The lookup is by `orders.order_number`, not UUID.

## 2.10 Template #2 CTA Observation

- The authenticated Hamatee order history URL is **`/account/orders/[order_number]`** (`src/app/(public)/account/orders/page.tsx` and `/[id]/page.tsx`), scoped to the signed-in user by `orders.user_id`. This route already exists and was **not modified**.
- **Guest-order CTA remains unresolved.** There is no public guest order-lookup route that resolves a real order by number, and `/track` is an explicitly labelled frontend demo (`track-client.tsx` uses a timeout + hardcoded `HAM-EXAMPLE-001`). Sprint 2 did **not** build fake guest tracking.
- **Sprint 3 must decide** the Template #2 `order_url` policy for guest orders (e.g. omit the CTA for guests, or introduce a real signed/tokenised lookup in a later sprint). This is recorded as an open item.

## 2.11 Status / Tracking Reality

- **Sprint 2 changed no status behaviour.** No status mutation, no status API, no triggers, no fake timeline, no `/track` change.
- The Admin detail page displays the **real stored** `orders.status` value via `orderStatusLabel()`; it does not imply workflow progress. In practice every order is still `pending` because nothing in the application writes another value.
- A manual status editor was considered and **deliberately deferred** — status mutation belongs to a later order-management sprint.
- WhatsApp remains the real operational channel (`communication_channel = 'whatsapp'`, displayed in list and detail). Email is not yet part of the order flow.

## 2.12 Environment Documentation

- **`.env.example` tracking was corrected.** `.gitignore` gained a negation line `!.env.example` immediately after the `.env*` rule, so `.env.example` is now trackable again (`git status` shows it as untracked/new rather than ignored).
- Safety confirmed: `.env.example` contains **variable names only** (Supabase, Cloudflare R2, `NEXT_PUBLIC_SITE_URL`, WhatsApp, and the Brevo names added in Sprint 1) — no real credentials.
- `.env`, `.env.local`, `.env.production` and `.env*.local` remain ignored. No secret-bearing file was un-ignored.
- No `NEXT_PUBLIC_BREVO_*` variables exist.

## 2.13 Files Created

- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/[order_number]/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/components/admin/notification-recipients-settings.tsx`
- `src/app/api/admin/settings/notification-recipients/route.ts`
- `src/app/api/admin/settings/notification-recipients/[id]/route.ts`
- `src/lib/admin/notification-recipients.ts`
- `src/lib/orders/display.ts`

## 2.14 Files Modified

- `src/components/admin/admin-shell.tsx` — added `ShoppingBag`/`Settings` icons and the Orders + Settings nav entries.
- `.gitignore` — added `!.env.example`.
- `HAMMAH_BREVO_SPRINT_1_CORE_RESULT.md` — **renamed** to `HAMMAH_BREVO_IMPLEMENTATION.md` (Sprint 1 content preserved exactly), then this Sprint 2 section appended.
- `.env.example` — content unchanged from Sprint 1; now tracked because of the `.gitignore` fix.

No migrations were created or modified in Sprint 2.

## 2.15 Files Intentionally Not Modified

- `src/app/api/orders/route.ts` — no email wiring (Sprint 3).
- `src/app/(public)/signup/page.tsx`, `src/app/auth/callback/route.ts`, `src/lib/hamatee/enrolment.ts` — Hamatee/auth flow (Sprint 4).
- `src/app/(public)/track/*` — demo unchanged; no fake tracking.
- `vercel.json` / `/api/cron/birthdays` — birthday automation (Sprint 5); not created.
- All Sprint 1 `src/lib/email/*` modules and both Sprint 1 migrations.
- `src/lib/seo/site.ts`, `src/lib/currency.ts`, `src/lib/supabase/*`, middleware — reused unchanged.

## 2.16 Unexpected Findings

1. **Client-fetch-on-mount trips the React 19 lint rule.** `react-hooks/set-state-in-effect` flags loading data inside `useEffect` (the existing CTAs page has this exact pre-existing error). To avoid introducing a new lint error, the Settings page was restructured as a server component that loads recipients via RLS and passes them to the client component, which only refetches from event handlers. Result: zero new lint errors.
2. **An initial attempt put validation helpers inside a route file.** Next.js App Router allows only HTTP-handler exports from `route.ts`; the helpers were moved to `src/lib/admin/notification-recipients.ts` (this would have been a build failure, caught before build).
3. **`orders.admin_notes` is read-only in the UI.** The column exists (confirmed) but no app code writes it; editing is deferred so no fake mutation pattern was invented.
4. **Duplicate worktree still inflates lint.** `.kilo/worktrees/nova-flock` remains and is scanned by `npx eslint .`; `npx eslint src` is the reliable source-tree metric (57 errors / 78 warnings, unchanged).
5. **No migrations needed.** Sprint 2 is pure application-layer work on top of Sprint 1's tables.
6. **Admin pages rely on existing RLS, not the service-role client.** A future change to `orders`/`order_items` RLS would affect the Admin Orders pages; the existing admin-read policies are the load-bearing dependency.

## 2.17 Validation

Baseline established by Sprint 1: **`src` lint = 57 errors / 78 warnings, 0 new Sprint 1 errors.**

Sprint 2 results:

- `npx tsc --noEmit` → **PASS, 0 errors.**
- `npm run build` → **PASS.** Compiled routes include `/admin/orders`, `/admin/orders/[order_number]`, `/admin/settings`, `/api/admin/settings/notification-recipients` and `/api/admin/settings/notification-recipients/[id]`.
- `npx eslint src` → **57 errors / 78 warnings** — identical to the Sprint 1 baseline.
- `npx eslint` on all Sprint 2 files → **0 errors / 0 warnings.**
- **New Sprint 2 errors: 0.** No pre-existing lint debt was fixed.

Not performed (per instructions): screenshot/browser visual QA, live email delivery, Brevo sends. `src/app/api/orders/route.ts` was not exercised for email (no wiring exists).

## 2.18 Sprint 3 Readiness

- [x] Admin Orders list exists — `/admin/orders`
- [x] Admin Order detail exists — `/admin/orders/[order_number]`
- [x] Template #1 CTA route exists — matches `/admin/orders/{{ params.order_number }}`
- [x] Notification recipient UI exists — `/admin/settings`
- [x] Notification recipient API exists — GET/POST/PUT/DELETE under `/api/admin/settings/notification-recipients`
- [x] Enabled-recipient storage works — `notification_recipients.enabled` + RLS; `getEnabledOrderNotificationRecipients()` reads it server-side
- [x] Sprint 1 email transport still intact — `src/lib/email/*` unchanged
- [x] No email triggers wired yet — `src/app/api/orders/route.ts` unchanged

**Sprint 3 can rely upon:** Admin can now manage enabled order-notification recipients, so Template #1 has real recipients to send to; the Admin order URL contract is satisfied; `getEnabledOrderNotificationRecipients()` + `sendTrackedTemplateEmail()` + the delivery log provide the full send path. Sprint 3 must still (a) wire the non-blocking send after `create_order` succeeds, (b) decide the Template #2 `order_url` policy for **guest** orders (authenticated Hamatee orders can use `/account/orders/[order_number]`), and (c) supply Brevo credentials in the deployment environment.

HAMMAH BREVO SPRINT 2 COMPLETE

---

# Sprint 3 — Order Email Wiring

> Appended section. Sprint 1 and Sprint 2 content above is preserved exactly. This single file remains the authoritative implementation history for the entire HAMMAH Brevo rollout; all future Brevo sprints append here.

Canonical production origin: `https://www.hammah.store`
Production sender: `SL by HAMMAH <hello@hammah.store>`
Live template IDs: `#1 order_new_admin`, `#2 order_received_customer`, `#3 hamatee_welcome`, `#4 birthday`. Templates `5` and `6` remain RESERVED.

## 3.1 Sprint Status

**COMPLETE.**

Both order-related transactional emails are wired into the real order flow, the guest email UX was refined, and the guest CTA policy is implemented without inventing any route:

- **Template #1 (`order_new_admin`)** → every enabled Admin notification recipient, after order persistence, deduped per recipient.
- **Template #2 (`order_received_customer`)** → customer only when `orders.customer_email` exists, deduped per recipient.
- **Guest order UX** → email remains optional with accurate, non-overselling helper copy; the birthday-requires-email rule is preserved.
- **Guest CTA policy** → guests never receive an account-order or `/track` link; a `show_order_cta` contract flag was added and the exact required Brevo edit is documented in §3.8.

No status automation was added, `/track` is untouched, Templates #3/#4 are unwired, and WhatsApp remains the real continuation channel.

## 3.2 Starting State

Sprint 3 inherited the complete Sprint 1 + Sprint 2 systems:

- **Sprint 1 email foundation** (`src/lib/email/guard.ts`, `config.ts`, `templates.ts`, `brevo.ts`, `log.ts`, `send.ts`, `recipients.ts`) — transport (`sendTemplateEmail`), tracked send (`sendTrackedTemplateEmail`), delivery log claim/mark helpers, dedupe key builders, template registry, and `getEnabledOrderNotificationRecipients()`.
- **Sprint 1 migrations** `00012_email_delivery_log.sql` (unique `dedupe_key`, statuses `pending/sent/failed/skipped`) and `00013_notification_recipients.sql` — applied on the linked project.
- **Sprint 2 Admin surfaces** — `/admin/orders` and `/admin/orders/[order_number]` (the Template #1 CTA target), `/admin/settings` recipient management, and the recipient CRUD API under `/api/admin/settings/notification-recipients`.
- **Shared utilities reused unchanged** — `SITE_ORIGIN` / `absoluteUrl()` (`src/lib/seo/site.ts`), `formatPrice()` (`src/lib/currency.ts`), and the Admin display helpers `itemPriceDisplay()`, `orderTypeLabel()`, `orNotProvided()` (`src/lib/orders/display.ts`).
- **Order flow reality** — `POST /api/orders` → `create_order` RPC (migration `00009`) → persisted `orders` + one `order_items` snapshot → `order_number` → WhatsApp handoff. No email wiring existed.

## 3.3 Order Route Integration

**File changed:** `src/app/api/orders/route.ts`

- **Integration point:** immediately after the RPC result is validated (`const result = (data as CreateOrderResponse[])?.[0]; if (!result) …`). The order is already persisted at this point (`result.order_id` + `result.order_number` are available).
- **Mechanism:** `after()` from `next/server` (confirmed present in the installed Next `16.3.2`). The callback calls `await dispatchOrderEmails(result.order_id)`.
- **Why order success stays independent:** `after()` schedules the callback to run *after* the 201 response is sent. The callback re-reads state itself and `dispatchOrderEmails()` is fully self-contained and never throws, so email work cannot delay the response, cannot change the HTTP status, cannot roll back the order, cannot trigger another order, and cannot block the WhatsApp handoff (which is driven client-side from the returned `order_number`).
- **Placement:** registered *after* persistence and *before* the Hamatee-enrolment block + `return NextResponse.json(..., { status: 201 })`, matching the required flow `create_order succeeds → schedule side effects → return 201 → WhatsApp continues`.

## 3.4 Persisted Order Email Data

**File created:** `src/lib/email/order-emails.ts`

The dispatch reads exclusively from persisted rows via the service-role client (`createAdminClient()`); no client state is used.

Server-side query (one order, its items):

```
from("orders")
  .select(`
    id, order_number, user_id, source, communication_channel, status,
    customer_name, customer_phone, customer_email,
    delivery_region, delivery_city, delivery_area,
    delivery_landmark, delivery_gps, delivery_notes, customer_note, created_at,
    order_items (
      product_id, product_name_snapshot, product_slug_snapshot,
      variant_label, variant_value, quantity,
      pricing_mode_snapshot, price_amount_snapshot, currency, media_url_snapshot
    )
  `)
  .eq("id", orderId)
  .maybeSingle()
```

Fields consumed:

| Source | Fields |
|---|---|
| `orders` | `order_number`, `created_at`, `status`, `source`, `user_id`, `communication_channel`, `customer_name`, `customer_phone`, `customer_email`, `delivery_region`, `delivery_city`, `delivery_area`, `delivery_landmark`, `delivery_gps`, `delivery_notes`, `customer_note` |
| `order_items` | `product_id`, `product_name_snapshot`, `product_slug_snapshot`, `variant_label`, `variant_value`, `quantity`, `pricing_mode_snapshot`, `price_amount_snapshot`, `currency`, `media_url_snapshot` |

**Missing field discovered — `collection_name`:** `order_items` has **no** collection column (confirmed against `00003_orders.sql`). Collection membership lives in the `collection_products` junction → `collections`. The chosen real source is a stable server-side lookup of the product's **first published collection** (`collections.status = 'published'`, ordered by `collection_products.sort_order`, limit 1) via the service-role client. No client-side collection text is trusted. When the product belongs to no published collection (or the lookup errors), the value falls back to the neutral `Not provided` (`orNotProvided()`). The lookup is wrapped in try/catch and returns `null` on any failure.

**Multi-item note:** the current `create_order` RPC inserts exactly one `order_items` row per order, so the templates take a single flat product block (see §3.8). The dispatch uses `order_items[0]`.

## 3.5 Template #1 — Admin

- **Recipients source:** `getEnabledOrderNotificationRecipients()` (Sprint 1) — enabled rows only, normalised, deduped. Template #1 is sent to **every** enabled recipient.
- **Zero recipients:** sends `0`, logs a safe server warning (`[email/orders] no enabled Admin notification recipients…`), the order still succeeds, and Template #2 may still send. No fallback recipient is inserted in code.
- **Parameter contract (authoritative, replaces the Sprint 1 pre-design contract):**
  `order_number, created_at, order_status, product_name, collection_name, product_image_url, product_url, size, quantity, price_display, customer_name, customer_phone, customer_email, customer_type, communication_channel, delivery_region, delivery_city, delivery_area, delivery_landmark, delivery_gps, delivery_notes, customer_note, admin_order_url`.
- **Dedupe key:** `order_new_admin:order:<order_id>:<recipient>` (via `sendTrackedTemplateEmail({ orderId })` → `buildOrderDedupeKey`).
- **Admin CTA:** `absoluteUrl('/admin/orders/<order_number>')` → `https://www.hammah.store/admin/orders/<order_number>` (never `NEXT_PUBLIC_SITE_URL`, `window.location.origin`, localhost or preview hosts).
- **Nullable fallbacks:** delivery + optional fields → `Not provided`; `customer_note` absent → `No customer note`; `customer_email` null → `Not provided`. No raw null/undefined/blank labels are sent.
- **Failure behaviour:** `sendTrackedTemplateEmail` never throws; a failed send is marked `failed` in `email_delivery_log` and the dispatch continues to the remaining recipients and to Template #2.

## 3.6 Template #2 — Customer

- **Sends only when** `orders.customer_email` exists (trimmed non-empty); otherwise it is skipped (summary `no_email`) and **no** delivery-log row is written (recipient column is NOT NULL), consistent with Sprint 1.
- **Parameter contract:**
  `order_number, created_at, order_status, customer_first_name, product_name, collection_name, product_image_url, product_url, size, quantity, price_display, delivery_region, delivery_city, delivery_area, delivery_landmark, delivery_gps, order_url, show_order_cta`.
- **Hamatee CTA behaviour:** authenticated order (`source = hamatee` / `user_id` present) → `order_url = absoluteUrl('/account/orders/<order_number>')` → `https://www.hammah.store/account/orders/<order_number>`; `show_order_cta = true`. This route already exists and is user-scoped.
- **Guest CTA behaviour:** guests are **never** pointed at `/account/orders/...` (no auth) nor at `/track` (frontend demo). `show_order_cta = false`; `order_url` is set to the real selected-piece product URL so that, even before the Brevo conditional edit is applied, the button cannot point at a fake/broken destination. The guest email is built to lead with the order reference / request summary / WhatsApp continuation and to use `product_url` as the useful secondary CTA.
- **Dedupe key:** `order_received_customer:order:<order_id>:<recipient>`.
- **Failure behaviour:** identical to Template #1 — logged as `failed`, never thrown, order unaffected.
- **`customer_first_name`:** first whitespace token of `orders.customer_name`; falls back to the neutral greeting `there` if the stored name is empty/malformed (never crashes).

## 3.7 Guest Order Email UX

**File changed:** `src/components/product/order-drawer.tsx`

In `GuestIdentityFields`, the Email field remains optional for a normal guest order. The field label keeps its `— optional` suffix (or `* — required for Hamatee` when the birthday rule applies). Added copy:

- Helper (email optional):
  `Optional — add your email if you'd like a confirmation copy of this order request.`
- Supporting notice (email optional):
  `Your order will still be saved and sent to HAMMAH even if you leave this blank. If you provide an email, we'll also send your order reference and request summary to your inbox.`
- Helper (email required because a birthday was entered):
  `Required because you added a birthday — we need it to set up your Hamatee account.`

The copy deliberately uses **order request confirmation / request summary / order reference** and never implies payment confirmation, order confirmation, shipment tracking, guaranteed acceptance or automated fulfilment.

**Preservation check:**
- Normal guest order → email remains optional (client `required={emailRequired}` is `false`; the API schema keeps `customer_email` optional).
- Birthday supplied → email is still required, unchanged in both client validation and `POST /api/orders` (the existing 400 `Email is required when birthday is provided` guard and the client-side check are untouched).
- No order-validation behaviour was changed.

## 3.8 Brevo Template Contract Changes

**File changed:** `src/lib/email/templates.ts`

- Replaced the Sprint 1 pre-design contracts with the authoritative live-template contracts:
  - `OrderNewAdminEmailParams` — flat single-product block (was `items: OrderEmailItem[]`) + `order_status`, `customer_type`, `communication_channel`, and `admin_order_url` (was `order_url`).
  - `OrderReceivedCustomerEmailParams` — `order_status`, `customer_first_name` (was `first_name`), `collection_name`, delivery fields, `order_url`, and `show_order_cta`.
- Updated each template's `params` array in `EMAIL_TEMPLATES` to match exactly. `OrderEmailItem` (only referenced by the old contract) was removed. No compatibility aliases were kept.
- Templates #3 (`first_name`, `account_url`) and #4 (`first_name`, `shop_url`) contracts were left unchanged; Templates #5/#6 remain absent.

**Required manual Brevo edit (Template #2 — guest CTA):**
The live Template #2 HTML must conditionally render the order-view CTA. In the Brevo editor, wrap the order CTA block in a Brevo Template Language if-statement:

```
{% if params.show_order_cta %}
  <a href="{{ params.order_url }}">View your order</a>
{% endif %}
```

`show_order_cta` is passed as a boolean (`true` for Hamatee, `false` for guests). Until that edit is applied, Code-side behaviour is already safe: guests receive `order_url = <product_url>` (a real, relevant destination), so the button — if rendered unconditionally — cannot point at an account route, `/track`, a fake URL, localhost or a preview host. No guest is ever linked to a route they cannot use.

## 3.9 Idempotency

Confirmed via the Sprint 1 claim/send/mark helper (`dedupe_key` UNIQUE, partial index on non-null):

- **Template #1:** a repeated `POST /api/orders` returning the same order (idempotency-key replay) re-runs `dispatchOrderEmails`, but each recipient's `order_new_admin:order:<order_id>:<recipient>` row already exists in `sent`/`pending` state → `claimDelivery` returns `already_sent`/`in_progress` → status `duplicate`, no Brevo call.
- **Template #2:** same guarantee for `order_received_customer:order:<order_id>:<recipient>`.
- Dedupe is keyed by `order_id` (not `idempotency_key`), so it holds regardless of how the duplicate request arrives.

## 3.10 Failure Handling

- **Brevo failure** → `sendTemplateEmail` returns a normalised failure; the row is marked `failed`; dispatch continues. The order still returns **201**.
- **No enabled Admin recipients** → Template #1 sends `0`; order succeeds; Template #2 still evaluated.
- **Missing customer email** → Template #2 skipped (`no_email`); order succeeds.
- **Brevo not configured** (missing env vars) → the transport fails at read time with a clear `BrevoConfigError` message, the delivery row reflects the failure where a recipient exists, and the order still succeeds. No config details or secrets are exposed to the customer.
- **WhatsApp remains available** — the client-side handoff is unchanged and depends only on the returned `order_number`.
- No synchronous retry loop is performed; retries will be handled from the `failed` delivery-log state later.

## 3.11 Status / Tracking Reality

- **No order-status automation was added.** `order_status` is a read-only display of the persisted value; the dispatch never writes or mutates `orders.status`.
- **`/track` is unchanged** — still a frontend demo; guest order tracking remains deferred.
- **Templates #5/#6 remain RESERVED** — no keys, env vars, mappings or references.
- Templates #3/#4 remain unwired (Sprints 4/5).

## 3.12 Files Created

- `src/lib/email/order-emails.ts` — persisted-order re-read, `collection_name` lookup, param builders, non-blocking dispatch for Templates #1/#2.

## 3.13 Files Modified

- `src/app/api/orders/route.ts` — added `after()`-scheduled `dispatchOrderEmails(result.order_id)` immediately after successful persistence.
- `src/lib/email/templates.ts` — authoritative Template #1/#2 param contracts + `params` arrays aligned to the live Brevo design.
- `src/components/product/order-drawer.tsx` — guest optional-email helper copy + supporting notice.
- `HAMMAH_BREVO_IMPLEMENTATION.md` — this Sprint 3 section appended (Sprint 1/2 preserved).

No migrations were created or modified.

## 3.14 Files Intentionally Not Modified

- **Hamatee welcome trigger (Template #3)** — `src/app/(public)/signup/page.tsx`, `src/app/auth/callback/route.ts`, `src/lib/hamatee/enrolment.ts` (Sprint 4).
- **Birthday automation (Template #4)** — no `/api/cron/birthdays`, no `vercel.json`, no scheduler (Sprint 5).
- **`/track`** — demo unchanged; no guest tracking built.
- **Order status mutation** — no status API/buttons/triggers for `contacted/confirmed/preparing/shipped/delivered/cancelled`.
- **Templates #5/#6** — still RESERVED.
- **Admin Orders UI** (`src/app/admin/orders/*`) and Admin shell — unchanged.
- **`create_order` RPC / migrations `00003`–`00013`** — unchanged; no schema change was needed for email wiring.
- **Sprint 1 `src/lib/email/*`** (guard/config/brevo/log/send/recipients) — unchanged (reused).
- **WhatsApp flow** — `src/lib/orders/whatsapp.ts` unchanged.
- **`src/lib/seo/site.ts`, `src/lib/currency.ts`, `src/lib/orders/display.ts`** — reused unchanged.

## 3.15 Unexpected Findings

1. **`order_items` has no `collection_name`.** Handled with a stable server-side lookup of the product's first published collection (`collection_products` → `collections`), neutral `Not provided` fallback. Documented in §3.4.
2. **Sprint 1's Template #1 contract assumed an `items[]` array.** The real order model persists one item per order and the live template expects a flat product block — the interface was replaced outright rather than aliased (per the brief).
3. **Admin-oriented status label vs customer wording.** The shared `orderStatusLabel()` returns `Pending` (correct for the Admin UI). The email contract needed `Request received` for a new order, so a separate `orderStatusDisplay()` mapping was added inside the email module. The shared Admin helper was left untouched (§27).
4. **The live Brevo Template #2 HTML could not be inspected** (no Brevo credentials locally, and the template lives in the Brevo account, not the repo). A `show_order_cta` flag is passed and the exact required Brevo if-statement edit is documented in §3.8; until then guests safely receive the product URL, never a fake route.
5. **`product_image_url` may be empty** when a product has no primary media snapshot (`media_url_snapshot` is nullable). An empty string is passed rather than a misleading placeholder; the Brevo template should guard the image element. (This is the one deliberate empty-string param; all textual/label fields use `Not provided` / `No customer note`.)
6. **`sendTrackedTemplateEmail` accepts `Record<string, unknown>`.** The typed param objects are passed by spread (`{ ...params }`) at the call site, which satisfies the index-signature requirement without casts or `any`.
7. **No Brevo credentials locally** — `.env.local` contains no `BREVO_*` values, so no live send was attempted (correctly). `getBrevoConfigProblems()` / `isBrevoConfigured()` already report readiness safely.
8. **Existing order-drawer lint debt** — `order-drawer.tsx` already carried 4 errors / 2 warnings (`react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`, `@next/next/no-img-element`) before this sprint; the new copy added none (verified against the committed file).

## 3.16 Validation

Sprint 2 baseline: **57 errors / 78 warnings** (`npx eslint src`).

Sprint 3 results:

- `npx tsc --noEmit` → **PASS, 0 errors.**
- `npm run build` → **PASS.** `/api/orders` compiled; all existing routes unchanged.
- `npx eslint src` → **57 errors / 78 warnings** — identical to the Sprint 2 baseline.
- ESLint on all Sprint 3 changed files:
  - `src/lib/email/order-emails.ts` → **0 errors / 0 warnings**
  - `src/lib/email/templates.ts` → **0 errors / 0 warnings**
  - `src/app/api/orders/route.ts` → **0 errors / 0 warnings**
  - `src/components/product/order-drawer.tsx` → **4 errors / 2 warnings** — **pre-existing**, identical to the committed `HEAD` version (verified by linting `git show HEAD:` copy).
- **New Sprint 3 errors: 0.** **Pre-existing errors: 57** (src tree). No unrelated debt was fixed.

Not performed (per instructions): screenshot/browser visual QA, live Brevo delivery, and sending any production email. The user will perform the real workflow test.

Static contract verification: the Template #1/#2 `params` arrays, the TypeScript param interfaces, and the values produced by `buildAdminParams()` / `buildCustomerParams()` were checked to match key-for-key.

## 3.17 Manual QA Checklist

```
[ ] Guest order without email still succeeds
[ ] Guest order without email still appears in Admin Orders
[ ] Guest order without email still triggers Admin Template #1
[ ] Guest order without email does NOT attempt customer Template #2

[ ] Guest order with email succeeds
[ ] Guest order with email appears in Admin Orders
[ ] Admin receives Template #1
[ ] Guest receives Template #2
[ ] Guest Template #2 does not link to account order history
[ ] Guest email copy says request received, not confirmed/paid/shipped
[ ] WhatsApp handoff still works

[ ] Hamatee order succeeds
[ ] Admin receives Template #1
[ ] Hamatee receives Template #2
[ ] Hamatee Template #2 order CTA links to /account/orders/<order_number>

[ ] Duplicate/retried order does not resend Admin email
[ ] Duplicate/retried order does not resend customer email

[ ] Disabled Admin recipient receives nothing
[ ] Enabled Admin recipient receives the order notification

[ ] Fixed-price order shows correct GHS amount
[ ] Price-on-request order shows Price on request

[ ] Birthday + guest still requires email
[ ] Normal guest email remains optional
```

## 3.18 Sprint 4 Readiness

Sprint 4 (Hamatee Welcome — Template #3) can rely upon:

- [x] Templates #1 and #2 wired into the real order flow
- [x] Order email delivery logging live (`email_delivery_log` claim/mark)
- [x] Order email dedupe live (per order + recipient)
- [x] Guest optional-email UX complete
- [x] WhatsApp flow preserved (unchanged)
- [x] No status automation introduced
- [x] Template #3 still unwired (signup/auth/enrolment untouched)

Outstanding (environment, not code): supply `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `BREVO_TEMPLATE_ID_ORDER_ADMIN`, `BREVO_TEMPLATE_ID_ORDER_CUSTOMER` (plus the #3/#4 IDs for later sprints) in the deployment environment for live delivery, and apply the Template #2 guest-CTA conditional edit documented in §3.8.

HAMMAH BREVO SPRINT 3 COMPLETE

---

# Sprint 4 — Hamatee Welcome

> Appended section. Sprint 1–3 content above is preserved exactly. This single file remains the authoritative implementation history for the entire HAMMAH Brevo rollout; all future Brevo sprints append here.

Canonical production origin: `https://www.hammah.store`
Production sender: `SL by HAMMAH <hello@hammah.store>`
Live template IDs: `#1 order_new_admin`, `#2 order_received_customer`, `#3 hamatee_welcome`, `#4 birthday`. Templates `5` and `6` remain RESERVED.

## 4.1 Sprint Status

**COMPLETE.**

Brevo Template #3 (`hamatee_welcome`) is wired to the genuine lifecycle of a **new direct Hamatee signup only**:

- `/signup` now supplies an explicit `emailRedirectTo` pointing at `/auth/callback` with an explicit `welcome=1` marker.
- `/auth/callback` distinguishes a new direct-signup confirmation from password reset / other auth callbacks, and schedules the Welcome email **non-blockingly** via `after()` only when the marker is present and the code exchange produced a server-verified user.
- A focused server-only helper (`src/lib/email/hamatee-welcome.ts`) re-verifies the user server-side, reads the profile, builds the live Template #3 params, and sends once per user through the Sprint 1 tracked-send infrastructure.

No login-based trigger, no bulk backfill, no guest-enrolment activation, no order-email changes, no birthday work, no status/tracking work, and no `/track` change. No new migration was required.

## 4.2 Starting State

**Inherited systems (Sprint 1–3):**

- Brevo foundation: `guard.ts`, `config.ts`, `templates.ts`, `brevo.ts` (`sendTemplateEmail`), `log.ts` (`claimDelivery`/`markSent`/`markFailed` + `buildUserDedupeKey`), `send.ts` (`sendTrackedTemplateEmail`), `recipients.ts`.
- Migrations `00012_email_delivery_log.sql` (unique `dedupe_key`, `user_id`, statuses) and `00013_notification_recipients.sql` — applied.
- Sprint 3 order wiring (`src/lib/email/order-emails.ts`, `/api/orders` `after()` dispatch) — live and untouched.
- Canonical URL utility `SITE_ORIGIN` / `absoluteUrl()` (`src/lib/seo/site.ts`).
- Supabase Agent: `createClient()` (server, cookie-based) and `createAdminClient()` (service-role, RLS bypass).

**Direct signup flow (`/signup` → `src/app/(public)/signup/page.tsx`), inspected:**

1. Client `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name, phone, date_of_birth } } })` — **no `emailRedirectTo` was supplied** (`options` contained only `data`).
2. The DB trigger `handle_new_user` (`00004` + `00007`) creates `public.profiles` from the signup metadata (`first_name`, `last_name`, `phone`, `date_of_birth`, `role='customer'`).
3. Supabase Auth sends the Confirm Signup email **through Brevo SMTP** (route unchanged).
4. On confirmation the user lands on the default Supabase redirect (no HAMMAH callback destination was owned).

**Confirmation/callback flow (`/auth/callback` → `src/app/auth/callback/route.ts`), inspected:**

```
GET /auth/callback?code=...&next=...
  → createClient() (cookie session)
  → exchangeCodeForSession(code)
  → on success: safeNext = next startsWith "/" && !startsWith "//" ? next : "/"
  → redirect `${origin}${safeNext}`
  → else redirect `${origin}/login?error=auth_callback`
```

Only `forgot-password` used it (`resetPasswordForEmail({ redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` })`). Login (customer + admin) uses `signInWithPassword` and never touches the callback. No OAuth flow exists.

**Template #3 registry state inherited from Sprint 1:**

- `hamatee_welcome`, env `BREVO_TEMPLATE_ID_HAMATEE_WELCOME`, `dedupeScope: "user"`, provisional params `["first_name", "account_url"]`, interface `HamateeWelcomeEmailParams { first_name, account_url }`. **Wired to no lifecycle at all.**

## 4.3 Confirmation Redirect Change

**File changed:** `src/app/(public)/signup/page.tsx`

- Added an explicit `emailRedirectTo` to `supabase.auth.signUp` (previously absent):
  `${redirectOrigin}/auth/callback?next=/account&welcome=1`
- **`redirectOrigin` selection:**
  - production → `SITE_ORIGIN` (`https://www.hammah.store`) — canonical domain.
  - development → `window.location.origin` — the existing local-origin convention (mirrors `forgot-password`).
- **Callback marker:** `welcome=1`. **Target after confirmation:** `next=/account`.
- The marker is carried in the confirmation link's `redirect_to` query string (the same mechanism the working password-reset flow relies on) and is read back by `/auth/callback`.

## 4.4 Callback Integration

**File changed:** `src/app/auth/callback/route.ts`

- **Distinguishing signup confirmation from password reset:** the callback reads an explicit marker, `searchParams.get("welcome") === "1"`. The password-reset and future flows never pass it. There is no inference from `next`, the email address, or any other ambient value.
- **Scheduling point:** inside the successful `exchangeCodeForSession` branch, immediately before the redirect is returned. Identity is taken from the server-verified session user returned by the exchange (`data.user.id`), **never** from the query string.
- **`after()` is used** (`import { after } from "next/server"`, already proven in the Sprint 3 order route). The callback is:
  ```
  after(async () => { await sendHamateeWelcome(userId); });
  ```
- **Redirect independence from Brevo:** `after()` runs after the redirect response has been sent; `sendHamateeWelcome` re-verifies through the service-role client and never throws. A Brevo failure cannot delay, change, or fail the confirmation, session creation, or the redirect.
- **Existing safe-redirect handling preserved:** `safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/"` is unchanged (no open redirect). Auth codes/tokens are never logged.

## 4.5 Welcome Eligibility

| Scenario | Eligible? | Why |
|---|---|---|
| Direct signup, email confirmed, callback with `welcome=1` | **YES** | Marker present + server-verified confirmed user + profile exists; deduped once per user |
| Pending guest birthday enrolment (`hamatee_enrolments`, `status = pending`) | **NO** | Nothing in the enrolment flow calls the helper; no auth account is created from pending enrolments |
| Existing account login | **NO** | Login uses `signInWithPassword`; it never reaches `/auth/callback` and carries no marker |
| Password reset | **NO** | `/auth/callback?next=/reset-password` has no `welcome` marker |
| Direct signup whose email is _not_ confirmed | **NO** | Helper re-verifies `user.email_confirmed_at`; unconfirmed → skipped |

## 4.6 Template #3 Contract

**Registry (`src/lib/email/templates.ts`)** — `hamatee_welcome.params` is now exactly:

```
first_name, full_name, email, joined_at, account_url, shop_url
```

The provisional Sprint 1 keys (`first_name`, `account_url`) were replaced, not aliased; `HamateeWelcomeEmailParams` now matches the live template exactly.

| Param | Source | Fallback |
|---|---|---|
| `first_name` | `profiles.first_name` (trimmed) | first token of `full_name`, else `Hamatee` |
| `full_name` | `profiles.first_name` + `profiles.last_name` (trimmed, joined) | `first_name` when both blank |
| `email` | The authenticated, email-confirmed Supabase user's `email` (via `auth.admin.getUserById`) | — (missing email → skip) |
| `joined_at` | `profiles.created_at`, formatted en-GB (`5 October 2026`) | auth user `created_at`; else `Not provided` |
| `account_url` | `absoluteUrl('/account')` → `https://www.hammah.store/account` | — |
| `shop_url` | `absoluteUrl('/shop')` → `https://www.hammah.store/shop` | — |

No `NEXT_PUBLIC_SITE_URL`, `window.location.origin`, localhost or preview host is used for either CTA.

## 4.7 Idempotency

- Dedupe key: **`hamatee_welcome:user:<user_id>:<recipient>`**, built with the Sprint 1 `buildUserDedupeKey("hamatee_welcome", userId, email)` and passed to `sendTrackedTemplateEmail`.
- The unique `dedupe_key` index means a repeated callback, a refresh of the confirmation URL, a retried request, or a later sign-in can never produce a second Welcome: the existing row is in `sent`/`pending` state and `claimDelivery` returns `already_sent`/`in_progress` → `duplicate`, with no Brevo call.
- Once-per-user is therefore enforced at the database level, not by application state.

## 4.8 Failure Handling

Confirmed failure contract for Template #3:

- The send happens inside `after()`, after the redirect is already committed.
- `sendHamateeWelcome` is fully wrapped in try/catch and `sendTrackedTemplateEmail` never throws, so a failure cannot:
  - break **email confirmation** (the code was already exchanged),
  - break **session creation** (the session cookie was already set),
  - break **account access**, or
  - block the **`/account` redirect**.
- A failed send is recorded as `failed` in `email_delivery_log` and remains retryable from that state; a skip-before-claim (unconfirmed/missing profile) writes no row.
- Brevo error details are never exposed to the customer; server logs contain only a safe, non-secret summary.

## 4.9 Existing User Protection

The Welcome is gated on an explicit marker that only the new `/signup` `emailRedirectTo` produces:

- Existing users log in via `signInWithPassword` — no callback, no marker.
- Old accounts never pass through the direct-signup `emailRedirectTo`, so they can never be marked as a new signup (even though `email_delivery_log` has no historical rows for them).
- There is **no bulk backfill** and **no “send to everyone without a log row”** path.
- Dedupe additionally guarantees once-per-user even if the callback is replayed.

## 4.10 Guest Enrolment Reality

- Nothing in `hamatee_enrolments`, `create_hamatee_enrolment` or `createHamateeEnrolment()` was modified.
- No `pending → invited` / `pending → activated` transition was added, and no auth account is created from a pending enrolment.
- Template #3 is never sent for enrolment records. The guest activation/invitation lifecycle remains **deferred** (separate future work).

## 4.11 Supabase Auth Compatibility

- **Confirm Signup** and **Reset Password** are still sent by Supabase Auth through Brevo SMTP; no auth email template was rewritten in code and no auth email was moved onto the Brevo Transactional API.
- **Password reset remains intact:** `/auth/callback?next=/reset-password` still exchanges the code and redirects to `safeNext` with no Welcome scheduling.
- The callback’s existing normalisation of `next` is unchanged; the only additions are the `welcome` marker read and the `after()` schedule.
- Architecture unchanged: `Supabase Auth → Brevo SMTP → verification/reset`; `HAMMAH app → Brevo Transactional API → Templates #1–#4`.

## 4.12 Files Created

- `src/lib/email/hamatee-welcome.ts` — server-only Template #3 helper (server-side user re-verification, profile read, param build, user dedupe key, tracked send).

## 4.13 Files Modified

- `src/app/(public)/signup/page.tsx` — explicit `emailRedirectTo` (`/auth/callback?next=/account&welcome=1`) with canonical-origin selection.
- `src/app/auth/callback/route.ts` — marker-gated, non-blocking `after()` schedule of `sendHamateeWelcome`.
- `src/lib/email/templates.ts` — Template #3 contract + registry params aligned to the live Brevo template.
- `HAMMAH_BREVO_IMPLEMENTATION.md` — this Sprint 4 section appended (Sprint 1–3 preserved).

No migrations created or modified.

## 4.14 Files Intentionally Not Modified

- **Order email architecture** — `src/lib/email/order-emails.ts`, `/api/orders` wiring, Template #1/#2 params, Admin-recipient handling, guest optional-email UX (Sprint 3).
- **Guest enrolments** — all `hamatee_enrolments` code and `src/lib/hamatee/enrolment.ts`.
- **Birthday cron (Template #4)** — no `/api/cron/birthdays`, no `vercel.json`, no scheduler (Sprint 5).
- **`/track`** — unchanged (still a demo); no tracking tokens.
- **Order status** — no status mutation, no order-status emails.
- **Templates #5/#6** — still RESERVED.
- **Login flows** — `login` and `admin/login` (`signInWithPassword`) untouched; no welcome check added to login.
- **Supabase Auth email templates / SMTP config** — out of repo, unchanged.
- **Sprint 1 `src/lib/email/*` core** (guard/config/brevo/log/send/recipients) — reused unchanged.
- **Brevo Template #2 live guest-CTA conditional** — deliberately **not** addressed in Sprint 4 (per brief §16); still tracked as a manual final-rollout follow-up (see Sprint 3 §3.8).

## 4.15 Unexpected Findings

1. **Signup previously had no `emailRedirectTo` at all** (confirmed), so HAMMAH did not own the post-confirmation destination. Now owned via the marker-bearing callback URL.
2. **`profiles.created_at` is a genuine join timestamp** — the `handle_new_user` trigger inserts the profiles row at signup, so `profiles.created_at` is a real account-creation timestamp (used for `joined_at`, with auth-user `created_at` as fallback). No fabricated “Hamatee since” value.
3. **The callback returned `origin`-relative redirects**; production canonicalisation for the signup _email link_ is achieved by pinning `redirectOrigin` to `SITE_ORIGIN` in production while keeping local dev working. **Supabase’s allowed redirect URLs must include `https://www.hammah.store/auth/callback` (and `http://localhost:3000/auth/callback` for dev)** — this is deployment configuration, not code.
4. **Identity for the send does not depend on cookies inside `after()`.** The user id comes from `exchangeCodeForSession().data.user` (server-verified), and the helper re-verifies via the service-role `auth.admin.getUserById` + a `profiles` read. This deliberately avoids relying on the freshly-set session cookie being visible inside the post-response callback.
5. **`auth.admin.getUserById` requires the service-role key.** `createAdminClient()` uses `SUPABASE_SECRET_KEY`. If absent/invalid the helper logs a safe warning and skips (no throw, no unconfirmed send). No secrets are logged.
6. **No new migration was needed** — `email_delivery_log.user_id` + unique `dedupe_key` are sufficient for once-per-user Welcome; no `welcome_email_sent` column was introduced.
7. **Template #2 guest-CTA conditional remains a known manual Brevo edit** (not code), unchanged from Sprint 3 §3.8; deferred to final rollout review after Sprint 5.
8. **Pending guest enrolment activation does not exist** and was not invented; the lifecycle remains blocked until a real activation flow is designed.

## 4.16 Validation

Baseline carried from Sprint 3: **`npx eslint src` = 57 errors / 78 warnings**.

Sprint 4 results:

- `npx tsc --noEmit` → **PASS, 0 errors.**
- `npm run build` → **PASS.** `/auth/callback` and `/signup` compiled; all existing routes unchanged.
- `npx eslint src` → **57 errors / 78 warnings** — identical to the Sprint 3 baseline.
- Targeted ESLint on every Sprint 4 changed file (`src/lib/email/hamatee-welcome.ts`, `src/lib/email/templates.ts`, `src/app/auth/callback/route.ts`, `src/app/(public)/signup/page.tsx`) → **0 errors / 0 warnings.**
- **New Sprint 4 errors: 0.** **Pre-existing errors: 57** (src tree). No unrelated lint debt was fixed.

Not performed (per instructions): screenshot/browser visual QA, live Brevo delivery, and creating fake users or sending arbitrary production emails. The user will perform real signup verification manually.

Static contract verification: the Template #3 registry `params`, the `HamateeWelcomeEmailParams` interface, and the params produced by `sendHamateeWelcome()` were checked key-for-key; the callback marker and the signup `emailRedirectTo` marker were checked to match exactly.

## 4.17 Manual QA Checklist

```
[ ] New direct Hamatee signup succeeds
[ ] Supabase verification email arrives
[ ] Confirmation link returns through HAMMAH callback
[ ] Email becomes confirmed
[ ] User reaches /account successfully
[ ] Template #3 Hamatee Welcome arrives
[ ] Template #3 contains correct first name
[ ] Template #3 contains correct full name
[ ] Template #3 contains correct verified email
[ ] Template #3 contains correct joined date
[ ] Account CTA points to https://www.hammah.store/account
[ ] Shop CTA points to https://www.hammah.store/shop

[ ] Refreshing/revisiting callback does not send Template #3 twice
[ ] Normal login does not send Template #3
[ ] Existing old Hamatee login does not send Template #3
[ ] Password reset does not send Template #3
[ ] Password reset callback still works

[ ] Pending guest birthday enrolment does not receive Template #3
[ ] Guest order flow remains unchanged
[ ] Admin/customer order emails remain unchanged
```

## 4.18 Sprint 5 Readiness

- [x] Template #1 wired (orders → Admin)
- [x] Template #2 wired (orders → customer)
- [x] Template #3 wired (confirmed direct signup → Hamatee Welcome)
- [x] Welcome dedupe active (`hamatee_welcome:user:<user_id>:<recipient>`)
- [x] Signup confirmation flow preserved (marker-bearing `emailRedirectTo`)
- [x] Password reset preserved (no marker → no Welcome)
- [x] Pending enrolments untouched (no activation flow introduced)
- [x] Template #4 still unwired

**Sprint 5 can rely upon:** the full Brevo foundation, all three live application templates wired with dedupe and logging, a reusable once-per-user send pattern (`buildUserDedupeKey` + `sendTrackedTemplateEmail`), the `after()` non-blocking scheduling pattern, and the canonical `absoluteUrl()` CTA utility. Sprint 5 (Birthday — Template #4) should mirror the same delivery-log/dedupe approach with the yearly key `birthday:year:<year>:<recipient>` and its own `/api/cron/birthdays` + `vercel.json` schedule. The Template #2 guest-CTA conditional remains the outstanding manual Brevo edit for final rollout.

HAMMAH BREVO SPRINT 4 COMPLETE

---

# Sprint 5 — Birthday Automation + Production Readiness

> Final appended section. Sprint 1–4 content above is preserved exactly. This single file remains the authoritative implementation history for the entire HAMMAH Brevo rollout.

Canonical production origin: `https://www.hammah.store`
Production sender: `SL by HAMMAH <hello@hammah.store>`
Live template IDs: `#1 order_new_admin`, `#2 order_received_customer`, `#3 hamatee_welcome`, `#4 birthday`. Templates `5` and `6` remain RESERVED.

## 5.1 Sprint Status

**COMPLETE.**

Template #4 (`birthday`) is wired to a protected daily Vercel Cron that emails **real, email-confirmed Hamatee profiles** whose birthday matches the **Ghana** calendar date — at most once per user per calendar year. Production-readiness audit, environment checklist, dashboard checklist and live-QA playbook are included below.

## 5.2 Starting State

Sprint 5 inherited the complete Sprint 1–4 system:

- **Sprint 1** — Brevo foundation (`guard.ts`, `config.ts`, `templates.ts`, `brevo.ts`, `log.ts`, `send.ts`, `recipients.ts`), migrations `00012_email_delivery_log.sql` + `00013_notification_recipients.sql` (applied remotely).
- **Sprint 2** — Admin Orders + Admin Notification Recipients management (`/admin/orders`, `/admin/settings`, recipient CRUD API).
- **Sprint 3** — order email wiring (`src/lib/email/order-emails.ts`; `/api/orders` `after()` dispatch of Templates #1/#2, order dedupe).
- **Sprint 4** — Hamatee Welcome wiring (`src/lib/email/hamatee-welcome.ts`; signup `emailRedirectTo` marker + `/auth/callback` `after()` schedule, `hamatee_welcome:user:<id>:<recipient>` dedupe).
- **Schema available for Sprint 5 (no new migration needed):** `profiles.date_of_birth` (added in `00005`, populated by `handle_new_user` from `00007`), `email_delivery_log.user_id` + unique `dedupe_key`, `auth.users` (Supabase Auth).
- **Template #4 registry state inherited:** `birthday`, env `BREVO_TEMPLATE_ID_BIRTHDAY`, `dedupeScope: "year_recipient"`, provisional params `["first_name", "shop_url"]`; **wired to no lifecycle at all.** No cron, no `vercel.json`.
- **Dedupe helper inherited:** `buildYearlyDedupeKey(templateKey, recipient, year)` → `birthday:year:<year>:<recipient>` (recipient-keyed).

## 5.3 Birthday Eligibility

- **Table used:** `public.profiles` only.
- **DOB field:** `profiles.date_of_birth` (the real existing `date` column — no new birthday column introduced; guest enrolment DOB was **not** copied in).
- **Actual Hamatee requirement:** a `profiles` row (created exclusively by the `handle_new_user` trigger on a genuine `auth.users` INSERT). Pending guest enrolments live in `hamatee_enrolments`, never in `profiles`, so they are structurally excluded.
- **Verified-email requirement:** the underlying Supabase Auth user must exist with a non-empty `email` and a set `email_confirmed_at` (checked via the service/admin client). Unverified, deleted, or email-less accounts are skipped.
- **Pending enrolment exclusion:** the processor never reads `hamatee_enrolments`.
- **Ghana date policy:** matching uses `Africa/Accra` via `Intl.DateTimeFormat(..., { timeZone: "Africa/Accra" })` — never server local time, browser time, or Vercel geography.
- **Eligibility rule:** `date_of_birth` month/day == Ghana today's month/day. Birth year is irrelevant; age is never computed and never exposed.
- **Leap-day policy:** 29 February profiles match exactly (month = 2, day = 29) and therefore receive a birthday email **only on 29 February in leap years**. They are never silently moved to 28 Feb or 1 Mar. (Verified at runtime — see §5.17.)

## 5.4 Birthday Processor

**File:** `src/lib/email/birthday.ts`

- **Ghana date:** `ghanaDateParts()` returns `{ year, month, day, iso }` for the deterministic `Africa/Accra` calendar date.
- **Query strategy:** `profiles.select("id, first_name, last_name, date_of_birth").not("date_of_birth", "is", null)`; month/day matching is performed server-side. This is the minimal sensitive data needed and is appropriate at HAMMAH's current scale (documented; paginate if the profile base grows substantially). No database function was added.
- **Batch strategy:** sequential, bounded processing — no unbounded `Promise.all()` over the customer base.
- **Per-user isolation:** every user is wrapped in try/catch; one invalid or failing recipient increments `skipped`/`failed` and never aborts the batch.
- **Auth verification:** for each eligible profile, `supabase.auth.admin.getUserById(profile.id)` is called and the user must exist with a verified email; otherwise the user is skipped.
- **Send:** `sendTrackedTemplateEmail({ templateKey: "birthday", … })` — reuses Sprint 1 transport, logging, claiming and template lookup. No duplicated Brevo/logging logic.
- **Return:** a `BirthdayRunSummary` `{ ok, date, eligible, sent, duplicate, failed, skipped }`; never throws into the cron route.

## 5.5 Template #4 Contract

**Registry (`src/lib/email/templates.ts`)** — `birthday.params` is now exactly:

```
first_name, account_url, shop_url
```

The provisional Sprint 1 keys (`first_name`, `shop_url`) were extended to the live contract; `BirthdayEmailParams` now matches the live template exactly. Duplicate/competing contracts are avoided.

| Param | Source | Fallback |
|---|---|---|
| `first_name` | `profiles.first_name` (trimmed) | `profiles.last_name`, else neutral `Hamatee` — never `undefined` |
| `account_url` | `absoluteUrl('/account')` → `https://www.hammah.store/account` | — |
| `shop_url` | `absoluteUrl('/shop')` → `https://www.hammah.store/shop` | — |

No `NEXT_PUBLIC_SITE_URL`, `window.location.origin`, localhost or Vercel preview URL is used.

## 5.6 Birthday Idempotency

- **Final dedupe format:** `birthday:user:<user_id>:year:<YYYY>`
  e.g. `birthday:user:550e8400-e29b-41d4-a716-446655440000:year:2026`.
- **Helper change:** a new helper `buildUserYearDedupeKey(templateKey, userId, year)` was **added** to `src/lib/email/log.ts`. The existing `buildYearlyDedupeKey(templateKey, recipient, year)` was left intact (no behaviour change to order/welcome dedupe); only an additive helper was introduced. This keys the birthday dedupe to the stable `user_id` rather than the customer's email (which may change).
- **No migration required:** `email_delivery_log.dedupe_key` is a unique text column and already supports arbitrary event keys.

## 5.7 Cron Endpoint

**File:** `src/app/api/cron/birthdays/route.ts`

| Aspect | Behaviour |
|---|---|
| **Method** | `GET` (Vercel Cron invokes GET) |
| **Auth** | `Authorization: Bearer <CRON_SECRET>`; constant-time comparison; secret read only from the server-only `CRON_SECRET` env var |
| **Missing CRON_SECRET** | Fails closed: **500** `{ ok: false, error: "Cron is not configured." }` (a request is never treated as authorised) |
| **Wrong/missing Authorization** | **401** `{ ok: false, error: "Unauthorized." }` |
| **Success** | **200** `{ ok, date, eligible, sent, duplicate, failed, skipped }` — aggregate counts only |
| **Fatal processor failure** | **500** `{ ok: false, error: "Birthday run failed." }` |
| **PII/secrets** | The response never contains customer emails, names, DOBs, Brevo responses, secrets or auth data |

## 5.8 Vercel Cron

**File created:** `vercel.json` (none existed previously).

```json
{
  "crons": [
    { "path": "/api/cron/birthdays", "schedule": "0 8 * * *" }
  ]
}
```

- **Timezone reasoning:** Vercel Cron expressions run in **UTC**. Ghana is UTC+0 (Africa/Accra, no DST), so `0 8 * * *` = **08:00 Africa/Accra**, matching the recommended daily delivery time deterministically. The in-process date used for matching is still computed in `Africa/Accra`, so it remains correct even if the schedule were changed.
- **Existing config preserved:** there was no `vercel.json` to merge; the file contains only the single birthday cron. No unrelated Vercel settings were introduced and no duplicate entries exist.

## 5.9 Environment Variables

Complete set required by the full Brevo system (names only — never values):

**Brevo (server-only):**
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `BREVO_TEMPLATE_ID_ORDER_ADMIN`
- `BREVO_TEMPLATE_ID_ORDER_CUSTOMER`
- `BREVO_TEMPLATE_ID_HAMATEE_WELCOME`
- `BREVO_TEMPLATE_ID_BIRTHDAY`

**Scheduled jobs (server-only):**
- `CRON_SECRET`

**Supabase / app (pre-existing):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the project's actual public-key variable name)
- `SUPABASE_SECRET_KEY`

Other pre-existing variables used by the order/WhatsApp/media flows (unchanged, not part of this rollout): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_HAMMAH_WHATSAPP_NUMBER`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET`, `CLOUDFLARE_R2_PUBLIC_BASE_URL`.

No `NEXT_PUBLIC_BREVO_API_KEY` and no `NEXT_PUBLIC_CRON_SECRET` exist. `.env.example` was updated with a `Scheduled jobs` section containing `CRON_SECRET=` (name only).

## 5.10 Migration Status

**New migration created: NO.**

- No database change was required: `profiles.date_of_birth`, `email_delivery_log.user_id` and the unique `dedupe_key` fully support Template #4 and its yearly, user-keyed idempotency.
- `00012_email_delivery_log.sql` and `00013_notification_recipients.sql` remain the latest Brevo migrations and were already applied remotely in Sprint 1.
- **Nothing needs to be run in Supabase for Sprint 5.** No `db push`, no reset, no destructive operation.

## 5.11 Failure Handling

- **One user failure does not stop the batch:** each recipient is isolated; a bad auth user is `skipped`, a Brevo failure is `failed`, and processing continues.
- **Brevo failure remains logged:** `sendTrackedTemplateEmail` records `status = failed` in `email_delivery_log` with a truncated, non-secret error; the aggregate summary counts it.
- **Successful yearly send cannot duplicate:** once a row is `sent`, a re-run claims `duplicate` and makes no Brevo call.
- **Failed delivery can retry safely:** a `failed` row is re-claimed as `pending` on a later eligible cron execution (the next day, since the same birthday would still match only on the birthday date itself — a retry runs on the next day only if the schedule/date still matches; more precisely, the `failed` row is reclaimable whenever the processor runs again for that user). No uncontrolled retry loop exists inside a single request.

## 5.12 Guest / Pending Enrolment Protection

- The processor reads **only** `public.profiles`. It never reads `hamatee_enrolments` and never sends to `status = pending` guest enrolments or raw guest order birthday data.
- `hamatee_enrolments` begin as `pending` and are not a completed Hamatee membership lifecycle; this sprint does not imply otherwise and does not activate them.

## 5.13 Files Created

- `src/lib/email/birthday.ts` — birthday processor (Ghana date, eligibility, auth verification, batch-safe send).
- `src/app/api/cron/birthdays/route.ts` — protected cron endpoint.
- `vercel.json` — daily Vercel Cron registration.

## 5.14 Files Modified

- `src/lib/email/log.ts` — added `buildUserYearDedupeKey()` (additive; `buildYearlyDedupeKey()` unchanged).
- `src/lib/email/templates.ts` — Template #4 registry params + `BirthdayEmailParams` aligned to the live Brevo template.
- `.env.example` — added the `Scheduled jobs` section with `CRON_SECRET=`.
- `HAMMAH_BREVO_IMPLEMENTATION.md` — this Sprint 5 section + final production rollout checklist appended (Sprint 1–4 preserved).

## 5.15 Files Intentionally Not Modified

- **Template #1/#2 behaviour** — `src/lib/email/order-emails.ts`, `/api/orders` wiring, Admin recipient handling, guest optional-email UX.
- **Template #3 behaviour** — `src/lib/email/hamatee-welcome.ts`, `/signup` redirect marker, `/auth/callback` schedule.
- **Guest enrolment lifecycle** — `hamatee_enrolments`, `create_hamatee_enrolment`, `src/lib/hamatee/enrolment.ts`.
- **`/track`** — unchanged (demo); no tokens, no order connection, no emails.
- **Order statuses** — no status mutation, no status emails.
- **Templates #5/#6** — still RESERVED.
- **Supabase Auth SMTP / auth email templates** — unchanged in code.
- **Migrations `00001`–`00013`** — unchanged.

## 5.16 Unexpected Findings

1. **`buildYearlyDedupeKey` was recipient-keyed**, not user-keyed. Rather than change it (which could affect other yearly templates), a new additive helper `buildUserYearDedupeKey` was introduced and used for birthday, satisfying the stronger `birthday:user:<id>:year:<YYYY>` semantic.
2. **`profiles.date_of_birth` is a real `date` column** (added `00005`, populated `00007`), so no schema change or birthday-column duplication was needed.
3. **No `vercel.json` existed**, so a minimal new file was created rather than merged.
4. **`auth.admin.getUserById` requires the service-role key** (`SUPABASE_SECRET_KEY`). If unavailable, the per-user verification fails safely and the user is skipped (never a wrong send).
5. **Ghana = UTC+0**, so the Vercel UTC schedule and the in-process `Africa/Accra` date agree; the date-matching logic is still timezone-explicit so it stays correct regardless of schedule.
6. **Leap-day birthdays** are handled by exact month/day matching (no drift to 28 Feb / 1 Mar); verified at runtime.
7. **Template #2 guest-CTA conditional remains a required manual Brevo edit** (documented since Sprint 3) and is carried into the final rollout checklist — it is not solvable from code in this sprint.
8. **Pending guest enrolment activation does not exist** and was not invented.

## 5.17 Validation

Established baseline carried from Sprint 4: **`npx eslint src` = 57 errors / 78 warnings**.

Sprint 5 results:

- `npx tsc --noEmit` → **PASS, 0 errors.**
- `npm run build` → **PASS.** `/api/cron/birthdays` compiled as a dynamic route; `/signup` compiled; all routes intact.
- `npx eslint src` → **57 errors / 78 warnings** — identical to the baseline.
- Targeted ESLint on every Sprint 5 source file (`src/lib/email/birthday.ts`, `src/lib/email/log.ts`, `src/lib/email/templates.ts`, `src/app/api/cron/birthdays/route.ts`) → **0 errors / 0 warnings.**
- **New Sprint 5 errors: 0.** **Pre-existing errors: 57** (src tree). No unrelated lint debt fixed.

**Runtime date-logic verification (node, `Africa/Accra`):** month/day matching confirmed for `1998-10-06` on `2026-10-06` (match) and `2026-10-07` (no match); leap-day `2000-02-29` matched only on `2028-02-29`, not `2027-02-28` or `2028-03-01`; the UTC boundary `2026-10-06T00:30Z` resolves to the Ghana date `2026-10-06`; malformed DOB values are excluded.

Not performed (per instructions): no live production QA, no fake production accounts, no real birthday changes, no arbitrary birthday sends, no live cron invocation, no screenshot/browser QA.

## 5.18 Manual QA Checklist

```
BIRTHDAY
[ ] Real Hamatee with birthday today receives Template #4
[ ] First name renders correctly
[ ] Account CTA → https://www.hammah.store/account
[ ] Shop CTA → https://www.hammah.store/shop
[ ] email_delivery_log records successful delivery
[ ] Re-running cron does not resend birthday email
[ ] Hamatee whose birthday is not today receives nothing
[ ] Pending guest enrolment whose birthday is today receives nothing
[ ] User without verified email receives nothing
[ ] One failed recipient does not block another recipient

CRON SECURITY
[ ] Cron with correct Bearer secret succeeds
[ ] Missing Authorization returns 401
[ ] Wrong secret returns 401
[ ] Response exposes no customer PII
[ ] Response exposes no secrets

EXISTING SYSTEM REGRESSION
[ ] Guest order without email still succeeds
[ ] Guest order with email still receives Template #2
[ ] Admin still receives Template #1
[ ] Hamatee order still receives Template #2
[ ] New confirmed Hamatee signup still receives Template #3
[ ] Password reset still works
[ ] WhatsApp handoff still works
```

---

## 32 Final Production Readiness Audit

| Component | Status |
|---|---|
| Template #1 — New Order → Admin | **wired** (`order-emails.ts`, `/api/orders` `after()`) |
| Template #2 — Order Request Received → customer | **wired** (email-gated, deduped) |
| Template #3 — Hamatee Welcome | **wired** (confirmed signup callback, deduped) |
| Template #4 — Happy Birthday | **wired** (protected daily cron, deduped) |
| Delivery logging | **ready** (`email_delivery_log`, claim → send → mark) |
| Order dedupe | **ready** (`order_new_admin:order:<id>:<recipient>` / `order_received_customer:order:<id>:<recipient>`) |
| Welcome dedupe | **ready** (`hamatee_welcome:user:<id>:<recipient>`) |
| Birthday dedupe | **ready** (`birthday:user:<id>:year:<YYYY>`) |
| Admin recipient management | **ready** (`/admin/settings` + recipient CRUD API) |
| Birthday cron | **ready** (protected `/api/cron/birthdays`, `vercel.json`) |
| Supabase Auth SMTP — code compatibility | **ready** (auth emails remain on Supabase → Brevo SMTP; no code conflict) |

## 33 Final Vercel Environment Checklist

Must exist in **Vercel → Project → Settings → Environment Variables → Production** (names only):

```
BREVO_API_KEY
BREVO_SENDER_EMAIL
BREVO_SENDER_NAME
BREVO_TEMPLATE_ID_ORDER_ADMIN
BREVO_TEMPLATE_ID_ORDER_CUSTOMER
BREVO_TEMPLATE_ID_HAMATEE_WELCOME
BREVO_TEMPLATE_ID_BIRTHDAY
CRON_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

Also required by the existing app (unchanged): `NEXT_PUBLIC_SITE_URL` (= `https://www.hammah.store`), `NEXT_PUBLIC_HAMMAH_WHATSAPP_NUMBER`, and the Cloudflare R2 variables. No secret values are recorded here.

## 34 Final Supabase Dashboard Checklist

(Authentication → URL Configuration — apply manually; code does not change dashboard settings)

- [ ] **Site URL:** `https://www.hammah.store`
- [ ] **Redirect URLs** include `https://www.hammah.store/auth/callback`
- [ ] Development redirect includes `http://localhost:3000/auth/callback` (if the local workflow requires it)
- [ ] Confirm Signup + Reset Password emails are routed through Brevo SMTP (existing configuration)

## 35 Final Brevo Dashboard Checklist

- [ ] Sender configured: `SL by HAMMAH <hello@hammah.store>`
- [ ] Template #1 → Activate
- [ ] Template #2 → Activate
- [ ] Template #3 → Activate
- [ ] Template #4 → Activate

**REQUIRED BEFORE LIVE ORDER TEST — Template #2 manual conditional correction:**

- **Hamatee:** show “View your order” → real `/account/orders/<order_number>` link.
- **Guest:** hide “View your order” entirely; do **not** link to `/account`; do **not** link to the demo `/track`; retain product / request / WhatsApp-oriented content.

Implementation hint (Brevo Template Language): wrap the order CTA in
`{% if params.show_order_cta %} … {% endif %}`
The code already sends `show_order_cta` = `true` for Hamatee and `false` for guests, and until the edit is applied guests safely receive the product URL (never a fake route).

## 36 Final Vercel Deployment Checklist

1. Confirm code committed/pushed.
2. Confirm all required Vercel Production env vars (§33).
3. Confirm `CRON_SECRET` is set.
4. Confirm Supabase production redirect URLs (§34).
5. Make the required Template #2 Brevo conditional change (§35).
6. Activate Brevo Templates #1–#4.
7. Deploy/redeploy HAMMAH on Vercel.
8. Confirm the deployment is serving `www.hammah.store`.
9. Confirm Vercel Cron is registered (`/api/cron/birthdays`, `0 8 * * *`).
10. Begin controlled live QA (§37).

Do not perform these production actions automatically.

## 37 Live QA Order After Deployment

**Test 1 — Admin configuration:** `/admin/settings` → add/confirm an enabled Admin recipient.

**Test 2 — Guest without email:** order saved · Admin Template #1 received · customer receives no email · WhatsApp opens · order appears in Admin Orders.

**Test 3 — Guest with email:** order saved · Admin Template #1 received · customer Template #2 received · guest does **not** get an authenticated order CTA · WhatsApp opens.

**Test 4 — Hamatee order:** order saved · Admin Template #1 · customer Template #2 · real `/account/orders/<order_number>` CTA · WhatsApp continues.

**Test 5 — New Hamatee signup:** Supabase Confirm Signup email → confirm → `/auth/callback` → `/account` → Template #3 Welcome.

**Test 6 — Password reset:** reset email → callback → reset works → **NO** Template #3.

**Test 7 — Birthday:** use a controlled real/test Hamatee account whose DOB can safely represent today's date. Protected cron run → Template #4 → delivery log → second run → duplicate prevented. Do not use unrelated real customers.

## 38 Final Sprint Completion State

```
ORDER
persist → Template #1 Admin
       → Template #2 customer (when email exists)
       → WhatsApp

HAMATEE SIGNUP
signup → Supabase verification
      → confirmed callback
      → Template #3 Welcome

BIRTHDAY
daily protected Vercel Cron
      → actual verified Hamatee birthdays
      → Template #4
```

All application email sends are server-side, logged, idempotent, non-destructive and failure-isolated. Templates #5/#6 remain RESERVED pending a real order-status workflow.

## 39 Sprint 5 Readiness / Brevo Rollout Complete

- [x] Template #1 wired
- [x] Template #2 wired
- [x] Template #3 wired
- [x] Template #4 wired
- [x] Admin recipient configuration exists
- [x] Delivery logging exists
- [x] Order dedupe exists
- [x] Welcome dedupe exists
- [x] Birthday yearly dedupe exists
- [x] Cron endpoint protected
- [x] Vercel Cron configured
- [x] No pending migration
- [x] Static build passes
- [x] Production environment checklist produced
- [x] Live manual QA checklist produced

HAMMAH BREVO SPRINT 5 COMPLETE

---

# FINAL PRODUCTION ROLLOUT CHECKLIST

> Manual, operator-run steps only. Code cannot perform these. The Brevo Template #2 conditional is **mandatory before the live order test**.

### A. Vercel — Environment Variables (Production)

- [ ] `BREVO_API_KEY`
- [ ] `BREVO_SENDER_EMAIL` (= `hello@hammah.store`)
- [ ] `BREVO_SENDER_NAME` (= `SL by HAMMAH`)
- [ ] `BREVO_TEMPLATE_ID_ORDER_ADMIN`
- [ ] `BREVO_TEMPLATE_ID_ORDER_CUSTOMER`
- [ ] `BREVO_TEMPLATE_ID_HAMATEE_WELCOME`
- [ ] `BREVO_TEMPLATE_ID_BIRTHDAY`
- [ ] `CRON_SECRET`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `SUPABASE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.hammah.store`

### B. Supabase — Authentication URL Configuration

- [ ] Site URL = `https://www.hammah.store`
- [ ] Redirect URL `https://www.hammah.store/auth/callback` allowed
- [ ] (Dev) `http://localhost:3000/auth/callback` allowed if required

### C. Brevo — Sender & Templates

- [ ] Sender `SL by HAMMAH <hello@hammah.store>` verified
- [ ] Template #1 activated
- [ ] Template #2 activated
- [ ] Template #3 activated
- [ ] Template #4 activated

### D. Brevo — REQUIRED BEFORE LIVE ORDER TEST: Template #2 conditional

- [ ] Wrap the order CTA in `{% if params.show_order_cta %} … {% endif %}`
- [ ] Hamatee: shows “View your order” → `/account/orders/<order_number>`
- [ ] Guest: no order CTA; no `/account` link; no `/track` link; product/request/WhatsApp content retained

### E. Deployment Sequence

1. [ ] Confirm code committed/pushed
2. [ ] Confirm all Vercel Production env vars (A)
3. [ ] Confirm `CRON_SECRET`
4. [ ] Confirm Supabase production redirect URLs (B)
5. [ ] Make the required Template #2 Brevo conditional change (D)
6. [ ] Activate Brevo Templates #1–#4 (C)
7. [ ] Deploy/redeploy HAMMAH on Vercel
8. [ ] Confirm the deployment serves `www.hammah.store`
9. [ ] Confirm Vercel Cron registered (`/api/cron/birthdays`, `0 8 * * *`)
10. [ ] Begin controlled live QA

### F. Controlled Live QA (in order)

1. [ ] **Admin config** — `/admin/settings`: enabled Admin recipient present.
2. [ ] **Guest without email** — order saved · Admin #1 · no customer email · WhatsApp opens · Admin Orders shows order.
3. [ ] **Guest with email** — order saved · Admin #1 · customer #2 · no authenticated order CTA · WhatsApp opens.
4. [ ] **Hamatee order** — order saved · Admin #1 · customer #2 · real `/account/orders/<order_number>` CTA · WhatsApp continues.
5. [ ] **New Hamatee signup** — Confirm Signup email → confirm → `/auth/callback` → `/account` → Template #3 Welcome.
6. [ ] **Password reset** — reset email → callback → reset works → **no** Template #3.
7. [ ] **Birthday** — controlled Hamatee with today's DOB → protected cron → Template #4 → delivery log → second run duplicates prevented.

### G. Cron Security Verification

- [ ] Correct `Authorization: Bearer <CRON_SECRET>` → 200 summary
- [ ] Missing Authorization → 401
- [ ] Wrong secret → 401
- [ ] Response contains no PII and no secrets

### H. Post-Rollout

- [ ] Templates #5/#6 remain RESERVED until a real order-status workflow exists
- [ ] `/track` remains a demo (not connected to orders or emails)
- [ ] Pending guest enrolment activation remains a separate future workstream

HAMMAH BREVO ROLLOUT — ALL FIVE SPRINTS COMPLETE
