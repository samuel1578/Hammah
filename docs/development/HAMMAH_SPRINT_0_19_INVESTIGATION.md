# HAMMAH — Sprint 0.19 Investigation Report

## Hamatee Authentication, Customer Accounts, Saved Pieces & Order History

**Date:** 16 September 2026
**Status:** Investigation Complete — Not Ready for Implementation

---

## 1. Executive Summary

### What Already Exists

- **Supabase Auth infrastructure:** Browser client (`@supabase/ssr` 0.12.7), server client, admin client, middleware with cookie-based session refresh.
- **Admin authentication:** Fully working. `signInWithPassword` in admin login, `signOut` in admin shell, role-based route protection via middleware + `is_admin()` SQL function + RLS.
- **`profiles` table:** Exists with `id` (FK to `auth.users`), `first_name` (NOT NULL), `last_name` (NOT NULL), `phone`, `role` (DEFAULT 'customer', CHECK constraint), `avatar_url`, timestamps. RLS allows self-read, self-update, admin-read-all.
- **Order domain:** Working production system with `orders`, `order_items`, atomic `create_order` RPC, idempotency, immutable snapshots, HAM-YYYY-NNNN references, guest support, WhatsApp handoff.
- **Order RLS:** Authenticated users can read own orders (via `user_id = auth.uid()`), admins can read/update all.
- **Frontend auth UI:** Login page, signup page (2-step), saved page — all with complete visual design, animations, responsive layout.
- **`/saved` page:** Visual demo with populated/empty/signed-out states, uses fixture products from `src/data/products`.

### What Is Still Mocked

- **Login page:** Uses `setTimeout()` — never calls Supabase `signInWithPassword`.
- **Signup page:** Uses `setTimeout()` — never calls Supabase `signUp`. Comment references "Appwrite authentication phase" (stale — project uses Supabase).
- **Saved pieces:** Client-only `useState` with demo states. No persistence, no Supabase query.
- **Save piece button on PDP:** Client-only `useState(false)` toggle. No backend.
- **Order tracking:** Hardcoded demo timeline. No real order lookup.
- **Google OAuth buttons:** Present on login and signup — non-functional, no backend wiring.
- **"Forgot password" link:** Present on login — non-functional, no handler.

### Biggest Architectural Gaps

1. **No profile creation trigger.** When a user signs up via Supabase Auth, no `profiles` row is automatically created. `profiles.first_name` and `profiles.last_name` are `NOT NULL`, so the trigger must populate them or signup will fail.
2. **No `saved_products` table.** Only exists in documentation. Needs migration.
3. **Order API does not pass authentication context.** `POST /api/orders` uses `createAdminClient()` and never checks the session. `user_id` is never passed to `create_order`. All orders are created as `source = 'website_guest'`.
4. **No customer-facing account routes.** No `/account`, no profile page, no order history page.
5. **No auth callback route.** No `/auth/callback` for handling OAuth redirects or email verification.
6. **No password reset flow.** No forgot-password page, no reset callback.

### Can the Existing Architecture Support Hamatee Cleanly?

**Yes, with targeted additions.** The existing architecture is well-designed:
- The `orders.user_id` column and RLS policies already support authenticated order ownership.
- The `profiles` table already has the right structure.
- The middleware already handles session refresh for admin routes.
- The `is_admin()` function can coexist with customer-level RLS.
- The unified order model supports both guest and authenticated orders.

The gaps are specific and addressable without architectural rework.

---

## 2. Current Authentication Architecture

### Supabase Client Setup

| Client | File | Purpose |
|--------|------|---------|
| Browser | `src/lib/supabase/client.ts` | `createBrowserClient` from `@supabase/ssr` — used by admin login, admin shell, admin pages |
| Server | `src/lib/supabase/server.ts` | `createServerClient` from `@supabase/ssr` — uses `cookies()` from `next/headers` — used by admin API routes, middleware |
| Admin | `src/lib/supabase/admin.ts` | `createClient` from `@supabase/supabase-js` with `SUPABASE_SECRET_KEY` — bypasses RLS — used by order creation, admin mutations |

### Middleware (`src/middleware.ts`)

- Creates a Supabase server client with cookie manipulation (set/get).
- Calls `supabase.auth.getUser()` to refresh/validate session.
- **Only runs on `/admin/:path*` routes** (per `config.matcher`).
- For `/admin/login`: if user exists and is admin, redirect to `/admin`.
- For other `/admin/*`: if no user, redirect to `/admin/login`. If user exists but not admin, redirect to `/`.
- Returns `supabaseResponse` with refreshed cookies.
- **Does NOT run on public routes** — no session refresh for customer-facing pages.

### Auth Methods Used

| Method | Location | Context |
|--------|----------|---------|
| `signInWithPassword` | `src/app/admin/login/page.tsx:21` | Admin login |
| `signOut` | `src/components/admin/admin-shell.tsx:104` | Admin logout |
| `getUser` | `src/middleware.ts:30`, `src/lib/supabase/require-admin.ts:20` | Session validation |
| `is_admin()` SQL | Migration 00001, lines 258-271 | RLS + middleware role check |

### What Is Missing for Customer Auth

- No `signInWithPassword` for customers.
- No `signUp` anywhere.
- No `onAuthStateChange` listener.
- No `getSession` calls.
- No `resetPassword` / `updateUser`.
- No auth callback route.
- No session refresh on public routes.

### Package Versions

- `@supabase/ssr`: `^0.12.7` (current, compatible with Next.js App Router)
- `@supabase/supabase-js`: `^2.116.0` (current)

---

## 3. Current Profiles Schema

### Table Definition (Migration 00001, lines 34-43)

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name  text NOT NULL,
  phone      text,
  role       text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Column Analysis

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | PK | — | FK to `auth.users(id)` ON DELETE CASCADE |
| `first_name` | text | NOT NULL | — | **Blocks signup if not provided** |
| `last_name` | text | NOT NULL | — | **Blocks signup if not provided** |
| `phone` | text | nullable | NULL | Optional |
| `role` | text | NOT NULL | 'customer' | CHECK: 'customer' or 'admin' |
| `avatar_url` | text | nullable | NULL | Optional |
| `created_at` | timestamptz | NOT NULL | now() | Auto-set |
| `updated_at` | timestamptz | NOT NULL | now() | Auto-triggered |

### Constraints & Indexes

- `handle_updated_at()` trigger fires BEFORE UPDATE.
- No unique constraint on `phone` or email (email not stored in profiles).
- No indexes beyond PK.

### RLS Policies

| Policy | Operation | Role | Condition |
|--------|-----------|------|-----------|
| "Profiles: user can read own profile" | SELECT | authenticated | `id = auth.uid()` |
| "Profiles: user can update own profile" | UPDATE | authenticated | `USING (id = auth.uid()) WITH CHECK (id = auth.uid())` |
| "Profiles: admins can read all profiles" | SELECT | authenticated | `public.is_admin()` |

### CRITICAL: Profile Creation Mechanism

**There is no automatic `auth.users → profiles` trigger.** This was confirmed in the Sprint 0.17 investigation and remains true. The `profiles` table has no INSERT policy for authenticated users (only SELECT and UPDATE). The only way profiles are currently created is via direct SQL or the admin client.

### Can a User Modify Their Own `role`?

**Potentially yes — this is a security concern.** The UPDATE policy allows `USING (id = auth.uid()) WITH CHECK (id = auth.uid())`. The CHECK clause does not restrict which columns can be updated. If a customer sends an UPDATE with `role = 'admin'`, the RLS policy would allow it because the row belongs to them. The CHECK clause only verifies the `id` matches — it does not prevent role changes.

**Mitigation:** The application code currently never exposes profile editing to customers, so this is not exploitable today. But it must be fixed before Sprint 0.19 adds profile editing.

### Fields Analysis for Hamatee

**Required by current product UX:**
- `first_name` — used in signup form Step 1
- `last_name` — used in signup form Step 1
- `phone` — used in signup form Step 1, also in order drawer

**Already supported:**
- `role` — customer/admin
- `avatar_url` — not yet used in UI but exists

**Genuinely missing for Hamatee MVP:**
- Nothing critical. The current schema covers signup fields. Display name could be derived from `first_name + last_name`.

**Optional future enhancement:**
- `display_name` / `preferred_name`
- `email` in profiles (currently only in `auth.users` — this is correct Supabase practice)
- `date_of_birth`, `gender` — no current requirement
- `marketing_opt_in` — possible future need

---

## 4. Current Public Login UI

**File:** `src/app/(public)/login/page.tsx` (281 lines)

### Implementation Details

- **Client component** (`"use client"`)
- Fields: `email` (type email, required), `password` (type password, required)
- Password visibility toggle: Eye/EyeOff icons
- Validation: checks empty fields
- Submit handler: `setTimeout(800ms)` — **completely fake, never calls Supabase**
- Error states: `invalid`, `generic`, `unverified` (typed but `unverified` never triggered)
- Loading state: spinner animation
- Google button: present, calls `handleGoogleSignup` which also uses `setTimeout` — **non-functional**
- "Forgot password?" button: present, has no `onClick` handler — **non-functional**
- "Not a Hamatee yet? Join the Legacy" link → `/signup`
- Left panel: editorial media image from `getMediaById("login-editorial")`
- Mobile: editorial image shown below form
- Brand overlay: "SL by Hammah" text

### Redirects

- No post-login redirect (login doesn't actually authenticate)

### What Needs to Change

- Replace `setTimeout` with `supabase.auth.signInWithPassword()`
- Handle error states (wrong password, unverified email, network error)
- Add redirect after successful login (to `/` or `/account`)
- Wire "Forgot password?" to actual flow
- Remove or wire Google button

---

## 5. Current Public Signup UI

**File:** `src/app/(public)/signup/page.tsx` (650 lines)

### Implementation Details

- **Client component** (`"use client"`)
- **2-step animated flow** with directional transitions

**Step 1 fields:**
- `firstName` (text, required)
- `lastName` (text, required)
- `email` (email, required, regex validated)
- `phone` (tel, required)

**Step 2 fields:**
- `password` (password, required, no strength validation)
- `agreeTerms` (checkbox, required)
- `agreePrivacy` (checkbox, required)

**Validation:**
- Step 1: all fields required, email format check
- Step 2: password required, both checkboxes required
- No password strength validation

**Submit handler:** `setTimeout(1000ms)` — **completely fake, never calls Supabase**
- On "success": shows welcome screen with "Your Hamatee account has been created"
- Comment says: "Frontend demonstration only. Live account creation will be connected in the Appwrite authentication phase" (stale reference)

**Google signup button:** calls `handleGoogleSignup` → `setTimeout` → shows "google-profile" completion form asking for phone — **non-functional**

**Success state:** Shows checkmark animation, "Welcome to the Hammah Legacy", links to `/legacy`

### Schema Mismatch

| Signup Field | Profiles Column | Match |
|--------------|-----------------|-------|
| firstName | first_name | Yes (maps directly) |
| lastName | last_name | Yes (maps directly) |
| email | — | Not in profiles (correct — in auth.users) |
| phone | phone | Yes (maps directly) |
| password | — | Auth credential, not stored in profiles |
| agreeTerms | — | Not persisted (no terms acceptance table) |
| agreePrivacy | — | Not persisted (no privacy acceptance table) |

**The signup fields map cleanly to the existing profiles schema.** No gaps.

### What Needs to Change

- Replace `setTimeout` with `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name, phone } } })`
- Decide: create profile via trigger or application-side after signup
- Handle email verification flow
- Add password strength validation
- Remove stale "Appwrite" comments
- Remove or wire Google button

---

## 6. Current Saved Pieces Architecture

### Where State Lives

**Client-only `useState`** in `src/app/(public)/saved/page.tsx`.

- Default state: `"populated"` (shows 4 demo products from `src/data/products`)
- Dev state selector buttons: populated / empty / signed-out
- No Supabase query, no API call, no persistence
- Products identified by fixture `id` (not database UUIDs)

### Product Info Panel Save Button

**File:** `src/components/product/product-info-panel.tsx`

- `const [saved, setSaved] = useState(false)` — local toggle
- Heart icon fills/unfills on click
- No backend persistence
- No authentication check
- No product identifier sent anywhere

### `saved_products` Table

**Does not exist in any migration.** Only referenced in documentation:
- `docs/development/03_HAMMAH_DATA_MODEL.md:361` — planned for Sprint 0.19
- Proposed schema: `id`, `user_id` (FK auth.users), `product_id` (FK products), `created_at`, `UNIQUE(user_id, product_id)`

### What Needs to Change

- Create `saved_products` table migration
- Implement save/unsave API or direct Supabase operations
- Require authentication for persistent saving
- Decide: guest saved items behavior (local-only vs login-required)

---

## 7. Current Order Ownership Architecture

### Full Flow Trace

```
OrderDrawer (src/components/product/order-drawer.tsx)
  → handleSubmit() (line 125)
  → fetch("/api/orders", { method: "POST", body: JSON.stringify({...}) })
  → src/app/api/orders/route.ts (line 30)
  → OrderSchema.parse(body) — validates input
  → createAdminClient() — uses service-role key, bypasses RLS
  → supabase.rpc("create_order", { ... })
  → supabase/migrations/00003_orders.sql create_order() function
  → INSERT INTO public.orders (...)
  → INSERT INTO public.order_items (...)
```

### How Guest vs Authenticated Ownership Works Today

**All orders are created as guests.** Specifically:

1. The API route (`src/app/api/orders/route.ts`) uses `createAdminClient()` which bypasses RLS entirely.
2. The `create_order` RPC function receives no user identity parameter.
3. The RPC hardcodes `source = 'website_guest'` (line 190 of migration 00003).
4. The `user_id` column in `orders` is never populated by the insert.
5. The API route never calls `supabase.auth.getUser()` — no session check.
6. The OrderDrawer never sends authentication credentials.

### Can Authenticated Orders Be Linked to a User?

**Not currently.** The `orders` table has `user_id uuid REFERENCES auth.users(id)`, and the RLS policy allows authenticated users to read orders where `user_id = auth.uid()`. But the creation flow never populates `user_id`.

The schema already supports it. The API and RPC do not.

### What Needs Modification

1. **API route:** Check session, pass `user_id` to RPC (or set it after RPC).
2. **RPC:** Accept optional `p_user_id` parameter, set `orders.user_id`.
3. **OrderDrawer:** Optionally pre-fill customer info from profile if authenticated.
4. **Source field:** Change from `'website_guest'` to `'hamatee'` for authenticated orders.

### What Must Remain Immutable

- Guest order flow must continue working exactly as-is
- Idempotency key behavior
- Order number generation (HAM-YYYY-NNNN)
- Immutable order_item snapshots
- WhatsApp handoff after order creation
- The RPC function's validation logic

---

## 8. Current Customer Order Read Permissions

### RLS Policies (Migration 00003, lines 226-267)

**Orders:**
- `SELECT` for authenticated users: `USING (user_id = auth.uid())` — only if `user_id` is set
- `SELECT` for admins: `USING (public.is_admin())`
- `UPDATE` for admins only

**Order Items:**
- `SELECT` for authenticated users: via parent order ownership check
- `SELECT` for admins: full access

### Can Customers Read Their Own Orders Today?

**Only if `user_id` was set during order creation.** Since all current orders are created as guests with `user_id = NULL`, the RLS policy `user_id = auth.uid()` will never match. Even if a customer signs up and authenticates, they cannot see any existing orders.

### What Is Required for `/account/orders`

1. New orders must be created with `user_id` populated.
2. The API route must authenticate the session.
3. The RPC must accept and set `user_id`.
4. A customer-facing query route or server component must read orders using the RLS-guaranteed `auth.uid()`.

---

## 9. Admin/Auth Compatibility

### Admin Authentication Model

- Admin users have `profiles` rows with `role = 'admin'`
- Middleware checks `profiles.role === 'admin'` for all `/admin/*` routes
- `is_admin()` SQL function used in RLS for catalogue mutations
- Admin login uses `createClient()` (browser client) → `signInWithPassword`
- Admin logout uses `createClient()` → `signOut` → redirect to `/admin/login`

### How Customer Auth Must Not Break Admin

1. **Profile trigger:** Must default `role = 'customer'`. Admin accounts already exist with `role = 'admin'`. A trigger must not overwrite existing roles.
2. **Middleware expansion:** Currently only matches `/admin/:path*`. Adding customer auth routes must not change this matcher unless carefully extended.
3. **Session coexistence:** Supabase Auth supports a single session per browser. Admin and customer auth use the same Supabase project. An admin logging into the customer area would get a `customer` profile (or no profile). This is acceptable — admins are customers too.
4. **Signup defaults:** New signups must get `role = 'customer'`. No path should allow `role = 'admin'` at signup time.
5. **RLS:** The `is_admin()` function is SECURITY DEFINER and checks `profiles.role`. Customer RLS policies must not interfere with admin policies.

---

## 10. Security Findings

### CRITICAL

**1. Profile role escalation via UPDATE.**
The profiles UPDATE policy allows any authenticated user to update their own row: `USING (id = auth.uid()) WITH CHECK (id = auth.uid())`. There is no column-level restriction. A customer could send `UPDATE profiles SET role = 'admin' WHERE id = auth.uid()` and the RLS would allow it.

**Severity: CRITICAL** — Must be fixed before profile editing is exposed. Fix: Add `WITH CHECK (role = OLD.role)` or use a trigger/function to prevent role self-modification.

**2. No INSERT policy on profiles for authenticated users.**
Currently profiles can only be created via direct SQL or admin client. If a profile trigger is added, this is fine. If application-side creation is used without service-role, the INSERT will be blocked by RLS.

**Severity: CRITICAL** — Must be resolved as part of profile creation strategy.

### HIGH

**3. Order API has no authentication check.**
`POST /api/orders` uses `createAdminClient()` and never verifies the caller's session. Any unauthenticated request can create orders. This is intentional for guest orders but means authenticated order ownership cannot be established.

**Severity: HIGH** — Must be addressed for Hamatee order linking.

**4. No customer-facing order read API.**
There is no endpoint or server component that allows an authenticated customer to query their orders. RLS exists but no code uses it for customer reads.

**Severity: HIGH** — Required for order history feature.

### MEDIUM

**5. No rate limiting on order creation.**
The idempotency key prevents duplicate orders but does not prevent rapid-fire different orders.

**Severity: MEDIUM** — Can be addressed in Sprint 0.20 hardening.

**6. Stale "Appwrite" reference in signup page.**
The signup page comments reference "Appwrite authentication phase" — misleading for developers.

**Severity: MEDIUM** — Should be corrected.

### LOW

**7. Google OAuth buttons are non-functional.**
Present on login and signup pages with no backend wiring. Could confuse users.

**Severity: LOW** — Decision needed: implement or remove.

**8. "Forgot password?" button has no handler.**
Present on login page, does nothing when clicked.

**Severity: LOW** — Must be wired for production.

### INFORMATIONAL

**9. Order tracking page is fully mocked.**
Uses hardcoded demo data. No real order lookup. Acceptable for now but must be addressed before production.

**10. No session expiry handling in public pages.**
Middleware only refreshes sessions on admin routes. Public pages have no session refresh logic.

---

## 11. Database Gaps

### Tables That Need Creation

1. **`saved_products`** — Not yet created. Planned schema:
   - `id` uuid PK
   - `user_id` uuid FK → auth.users(id) ON DELETE CASCADE
   - `product_id` uuid FK → products(id) ON DELETE CASCADE
   - `created_at` timestamptz DEFAULT now()
   - `UNIQUE(user_id, product_id)`
   - RLS: authenticated users can CRUD own rows

### Columns That Need Modification

None. The existing schema is sufficient. Specifically:
- `orders.user_id` already exists and supports ownership.
- `profiles` has all necessary fields for MVP.

### Functions That Need Modification

1. **`create_order` RPC** — Must accept optional `p_user_id` parameter to support authenticated order linking. Currently hardcodes no user_id.

### Policies That Need Addition/Modification

1. **`profiles` INSERT policy** — Need authenticated user self-insert OR trigger-based creation.
2. **`profiles` UPDATE policy** — Must prevent role self-modification.
3. **`saved_products`** — Full CRUD policies for authenticated users.

---

## 12. Auth Flow Gaps

### Missing for Production Authentication

| Feature | Status | Priority |
|---------|--------|----------|
| Real signup (`signUp`) | Not implemented | Required |
| Real login (`signInWithPassword`) | Only admin | Required |
| Logout (`signOut`) | Only admin | Required |
| Profile creation | No trigger, no app logic | Required |
| Session refresh on public routes | Not implemented | Required |
| Auth state listener | Not implemented | Required |
| Auth callback route | Not implemented | Required |
| Forgot password | Button exists, no handler | Required |
| Reset password callback | Not implemented | Required |
| Email confirmation flow | Not implemented | Required (Supabase default) |
| Resend confirmation | Not implemented | Recommended |
| Password change | Not implemented | Recommended |
| Google OAuth | Button exists, no backend | Product decision |
| Email change | Not implemented | Not required for MVP |

---

## 13. Profile Creation Strategy Options

### Option A: Database Trigger on `auth.users`

**How:** Create a `handle_new_user()` trigger function on `auth.users` INSERT that creates a `profiles` row using `NEW.id`, `NEW.raw_user_meta_data`.

**Pros:**
- Transactional: profile exists immediately after user creation
- No application code needed — works with any auth method (email, OAuth, magic link)
- Standard Supabase pattern
- Profile is guaranteed to exist

**Cons:**
- `first_name` and `last_name` are NOT NULL — trigger must extract from `raw_user_meta_data` or provide defaults
- If metadata is missing, INSERT fails
- Trigger must handle edge case of existing profile (idempotent)
- Admin accounts already exist — trigger must not overwrite

**Implementation notes:**
- `supabase.auth.signUp({ options: { data: { first_name, last_name, phone } } })` stores metadata in `raw_user_meta_data`
- Trigger reads `NEW.raw_user_meta_data->>'first_name'` etc.
- Use `INSERT ... ON CONFLICT DO NOTHING` for idempotency
- Existing admin accounts already have profiles — trigger won't fire for them (they already exist in auth.users)

### Option B: Application-Side Profile Creation After Signup

**How:** After `signUp()`, call a server action or API route that inserts into `profiles` using the service-role client.

**Pros:**
- Full control over profile fields
- Can validate before insert
- Can handle partial failures

**Cons:**
- Two-step process: if the second step fails, user exists in auth but has no profile
- Requires service-role client for INSERT (RLS blocks authenticated self-insert)
- More complex error handling
- Race condition possible if user tries to access profile before it's created

### Option C: Hybrid — Trigger for Core + Application for Extended

**How:** Trigger creates minimal profile (id, role, timestamps). Application-side completes profile with name/phone.

**Pros:**
- Profile always exists (trigger guarantees it)
- Extended fields can be optional

**Cons:**
- Over-engineered for current needs
- Two sources of truth for profile state
- More complex than necessary

### Recommendation: Option A (Database Trigger)

The existing `profiles` schema has `first_name` and `last_name` as NOT NULL. The trigger approach is the most reliable because:
1. It guarantees profile existence immediately.
2. It's the standard Supabase pattern.
3. It works with all auth methods.
4. The signup form already collects all required fields.
5. `raw_user_meta_data` is the correct Supabase mechanism for passing signup metadata to the database.

**The trigger must:**
- Extract `first_name`, `last_name`, `phone` from `raw_user_meta_data`
- Default `role` to `'customer'`
- Use `ON CONFLICT DO NOTHING` for idempotency
- Not interfere with existing admin accounts

---

## 14. Recommended Minimum Profile Contract

### Required Fields (for MVP)

| Field | Source | Notes |
|-------|--------|-------|
| `id` | `auth.users.id` | Automatic via trigger |
| `first_name` | Signup form / `raw_user_meta_data` | NOT NULL in schema |
| `last_name` | Signup form / `raw_user_meta_data` | NOT NULL in schema |
| `role` | Default `'customer'` | CHECK constraint enforced |
| `created_at` | `now()` | Automatic |
| `updated_at` | `now()` | Automatic via trigger |

### Optional Fields

| Field | Source | Notes |
|-------|--------|-------|
| `phone` | Signup form / `raw_user_meta_data` | Nullable, used in order drawer |
| `avatar_url` | Future upload | Nullable, not MVP |

### Fields Controlled Only by Server/Admin

| Field | Notes |
|-------|-------|
| `role` | Must not be user-modifiable. Admin-only. |

### Fields NOT to Duplicate from Auth

- **Email:** Correctly lives only in `auth.users`. Do not add to profiles.
- **Password:** Auth credential only.
- **Email confirmed:** lives in `auth.users.email_confirmed_at`.

---

## 15. Recommended Hamatee Route Architecture

### Smallest Coherent Route Structure

```
/account              → Account overview (profile + recent orders)
/account/orders       → Order history list
/account/orders/[id]  → Order detail
/account/saved        → Saved pieces
/account/profile      → Edit profile
```

### Compatibility with Existing `/saved`

The existing `/saved` route (`src/app/(public)/saved/page.tsx`) should be **redirected or replaced** by `/account/saved` when authenticated, or remain as a public landing that redirects to login.

### Proposed Approach

- Create `src/app/(public)/account/` route group with its own layout (or extend `(public)` layout).
- The `(public)` layout already has `SiteHeader` and `SiteFooter` — account pages should share this.
- Account pages require authentication — redirect to `/login` if not authenticated.
- Keep `/saved` as-is for now but update it to redirect authenticated users to `/account/saved`.

### MVP Required

- `/account` — overview with profile display, recent orders, quick links
- `/account/orders` — full order history
- `/account/orders/[id]` — order detail with status and items
- `/account/saved` — saved pieces (migrating from current `/saved`)
- `/account/profile` — edit first name, last name, phone

### Optional Later Enhancement

- `/account/addresses` — address book
- `/account/security` — password change, email change
- `/account/preferences` — notification settings

---

## 16. Recommended Signup Flow

### Screens/States

1. **Step 1:** First name, last name, email, phone (existing UI, validated)
2. **Step 2:** Password (with strength indicator), agree terms, agree privacy (existing UI)
3. **Submit:** Call `supabase.auth.signUp()` with metadata
4. **Email verification state:** Show "Check your email" screen with resend option
5. **Post-verification:** Redirect to `/account` or `/`

### Key Behaviors

- If email already exists: Supabase returns error, show "An account with this email already exists"
- If signup succeeds: show email verification screen
- Password requirements: min 8 characters (Supabase default)
- Google button: remove or implement (product decision)

---

## 17. Recommended Login Flow

### Screens/States

1. **Login form:** Email + password (existing UI)
2. **Submit:** Call `supabase.auth.signInWithPassword()`
3. **Success:** Redirect to `/` or `/account` (with `router.refresh()`)
4. **Error states:** Wrong password, unverified email, network error
5. **Forgot password:** Link to forgot-password flow

### Key Behaviors

- On success: `router.push("/")` + `router.refresh()` to update header state
- Show unverified email message with resend option
- "Forgot password?" links to reset flow

---

## 18. Recommended Logout Flow

### Implementation

1. Call `supabase.auth.signOut()` via browser client
2. Redirect to `/`
3. Update header to show logged-out state

### Admin Reuse

The admin shell already implements `signOut()`. The same pattern should be used for customer logout, placed in the account dropdown or header.

---

## 19. Recommended Forgot/Reset Password Flow

### Required for MVP

**Forgot Password Page (`/forgot-password`):**
- Email input form
- Call `supabase.auth.resetPasswordForEmail(email, { redirectTo: '...' })`
- Show "Check your email" confirmation

**Reset Password Callback (`/auth/callback` or `/reset-password`):**
- Supabase sends user to this URL with token
- Exchange token for session
- Show new password form
- Call `supabase.auth.updateUser({ password: newPassword })`
- Redirect to `/account`

### Supabase Configuration Required

- `SITE_URL` env var must be set for redirect URLs
- Email templates must be configured in Supabase dashboard (not in repo)

---

## 20. Recommended Saved Pieces Flow

### Signed-Out User

- Can browse saved pieces page (shows login prompt)
- Local storage could remember saved items (optional enhancement)
- Save button on PDP shows "Sign in to save" or opens login modal

### Authenticated User

- Save: `INSERT INTO saved_products (user_id, product_id)` via Supabase client
- Unsave: `DELETE FROM saved_products WHERE user_id = auth.uid() AND product_id = ?`
- Duplicate prevention: `UNIQUE(user_id, product_id)` constraint
- Saved page queries `saved_products` JOIN `products` for display

### Archived/Deleted Products

- `product_id` FK uses `ON DELETE CASCADE` — if product is deleted, saved record is removed
- Product archival (status = 'archived') should still show in saved list with "No longer available" indicator
- Query should join with products and handle missing/archived gracefully

### Guest → Account Migration

**Not recommended for MVP.** The complexity of merging local saved items with account-based saved items is not justified:
- No current guest saved items exist in any persistence layer
- The current save button is a demo toggle
- Implementing local-to-account merging adds unnecessary complexity
- Start fresh with account-only saving

---

## 21. Recommended Authenticated Order Flow

### How Authenticated Orders Should Attach to the Unified Order Model

1. **OrderDrawer checks auth state.** If authenticated, pre-fill name/phone/email from profile.
2. **API route checks session.** Call `supabase.auth.getUser()` via server client.
3. **Pass user_id to RPC.** Add optional `p_user_id` parameter to `create_order`.
4. **RPC sets user_id.** If `p_user_id` is provided, set `orders.user_id = p_user_id` and `orders.source = 'hamatee'`.
5. **Guest flow unchanged.** If no session, `p_user_id` is NULL, `source = 'website_guest'`.

### What Must Not Change

- Guest orders continue working exactly as today
- OrderDrawer still submits the same form data
- WhatsApp handoff still happens after order creation
- Idempotency still works identically
- Order number generation unchanged

---

## 22. Recommended Order History Flow

### Order List (`/account/orders`)

**Server Component** that queries orders via Supabase server client:
```sql
SELECT id, order_number, status, created_at, customer_name, delivery_region, delivery_city
FROM orders
WHERE user_id = auth.uid()
ORDER BY created_at DESC
```

RLS ensures only own orders are returned. No custom API needed.

### Order Detail (`/account/orders/[id]`)

**Server Component** that queries single order + items:
```sql
SELECT * FROM orders WHERE id = ? AND user_id = auth.uid()
SELECT * FROM order_items WHERE order_id = ?
```

RLS ensures only own order is accessible. Includes product snapshots from `order_items`.

### Data Exposed to Customer

| Show | Don't Show |
|------|------------|
| Order reference (HAM-YYYY-NNNN) | `id` (internal UUID) |
| Status | `idempotency_key` |
| Created date | `user_id` |
| Customer name, email, phone | `admin_notes` |
| Delivery details | `source` (unless meaningful) |
| Order items with snapshots | `communication_channel` |
| Product name, size, quantity, image | Internal metadata |

---

## 23. Guest → Hamatee Behaviour

### Should Guest Orders Automatically Attach After Signup?

**No.** This introduces significant complexity and security risk:

1. **Email matching is unreliable.** Guests may enter any email. Matching on email could attach someone else's order to a new account.
2. **Phone matching is unreliable.** Same issue.
3. **No existing guest orders have `user_id` set.** The column is NULL for all current orders.
4. **Attachment would require email/phone matching logic** with false-positive risk.
5. **Security implication:** A bad actor could sign up with a known email and gain access to that person's order history.

### Should Saved Items Migrate?

**No, for the same reasons.** No guest saved items currently exist in any persistence layer. Start fresh.

### Recommendation

Keep guest and authenticated orders separate. New authenticated orders get `user_id`. Old guest orders remain as-is. If a customer placed a guest order and later creates an account, they can reference the order via the tracking page (when real lookup is implemented).

---

## 24. RLS Changes Required

### Profiles

**Add INSERT policy:**
- Authenticated users can insert their own profile (id = auth.uid())
- OR rely on trigger (SECURITY DEFINER bypasses RLS)

**Modify UPDATE policy:**
- Add column restriction: prevent `role` from being changed by the user
- Use: `WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()))`

### Saved Products (New Table)

- `SELECT`: authenticated users can read own (`user_id = auth.uid()`)
- `INSERT`: authenticated users can insert own (`user_id = auth.uid()`)
- `DELETE`: authenticated users can delete own (`user_id = auth.uid()`)
- No public read access
- No admin-specific policies needed (admin can use service-role if needed)

### Orders

**Existing policies are sufficient** for the authenticated order history use case:
- `SELECT` for authenticated: `user_id = auth.uid()` — works when `user_id` is populated
- No changes needed to INSERT (RPC is SECURITY DEFINER)

---

## 25. Middleware / Server Authorization Strategy

### Current State

- Middleware only runs on `/admin/:path*`
- Session refresh happens in middleware via cookie manipulation
- Admin authorization happens in middleware (role check) AND in `requireAdmin()` helper

### Recommendation: Option B — Leave Session Refresh in Middleware, Authorization in Server Components

**Why:**
- Middleware running on all routes would add latency to every public page load
- Supabase server client (`src/lib/supabase/server.ts`) already handles cookie-based session access
- Server Components can call `supabase.auth.getUser()` directly — this validates and refreshes the session
- Account pages are Server Components that can check auth and redirect

**Implementation:**
1. Account pages (`/account/*`) use a **layout** that checks auth in a Server Component
2. If no session → redirect to `/login`
3. If session exists → render children with profile data available
4. No middleware changes needed for customer auth

### Tradeoffs

| Approach | Pros | Cons |
|----------|------|------|
| Extend middleware | Single auth check point | Adds latency to all public routes, complex matcher config |
| Server Component auth | No middleware overhead, per-page control | Auth check repeated per layout (cached by Next.js) |
| API route auth | Centralized | Unnecessary — RLS + server components handle this |

**Recommended: Server Component approach** — simplest, follows existing admin pattern (`requireAdmin()`), no middleware changes.

---

## 26. Required API / Server Actions

### Genuinely Needed

1. **`POST /api/orders` modification** — Add session check, pass `user_id` to RPC for authenticated orders.

### Not Needed (Server Components Are Sufficient)

- Order history query → Server Component with Supabase server client
- Order detail query → Server Component with Supabase server client
- Profile read → Server Component with Supabase server client
- Profile update → Server Action with Supabase server client
- Saved pieces read → Server Component with Supabase server client
- Saved pieces add/remove → Server Action or direct Supabase client call (RLS handles authorization)

### Potentially Needed

- **`/auth/callback` route** — For handling OAuth redirects and email verification tokens. Required by Supabase Auth for OAuth flows.
- **Password reset callback route** — For handling reset password tokens from email.

---

## 27. Existing Files Likely to Change

| File | Change Type | Reason |
|------|-------------|--------|
| `src/app/(public)/login/page.tsx` | Major rewrite | Replace fake auth with real Supabase calls |
| `src/app/(public)/signup/page.tsx` | Major rewrite | Replace fake auth with real Supabase calls |
| `src/app/(public)/saved/page.tsx` | Major rewrite | Replace demo state with real Supabase queries |
| `src/components/product/product-info-panel.tsx` | Modify save button | Add auth check, Supabase save/unsave |
| `src/components/product/order-drawer.tsx` | Modify | Pre-fill from profile if authenticated |
| `src/app/api/orders/route.ts` | Modify | Add session check, pass user_id |
| `src/middleware.ts` | Possible minor change | Session refresh for public routes (if needed) |
| `src/components/layout/site-header.tsx` | Modify | Show account dropdown when authenticated, logout |
| `src/components/layout/mobile-menu.tsx` | Modify | Show account state, logout |
| `src/data/navigation.ts` | Modify | Update Account link behavior |

---

## 28. New Files Likely Required

| File | Purpose |
|------|---------|
| `supabase/migrations/00004_auth_and_saved_products.sql` | Profile trigger, saved_products table, RLS policies |
| `src/app/(public)/account/layout.tsx` | Account area layout with auth check |
| `src/app/(public)/account/page.tsx` | Account overview |
| `src/app/(public)/account/orders/page.tsx` | Order history |
| `src/app/(public)/account/orders/[id]/page.tsx` | Order detail |
| `src/app/(public)/account/saved/page.tsx` | Saved pieces (replacing current /saved) |
| `src/app/(public)/account/profile/page.tsx` | Edit profile |
| `src/app/(public)/forgot-password/page.tsx` | Forgot password |
| `src/app/(public)/reset-password/page.tsx` | Reset password callback |
| `src/app/auth/callback/route.ts` | Auth callback for OAuth/email verification |
| `src/lib/supabase/customer-auth.ts` | Optional: customer auth helpers |

---

## 29. Files That Must Not Be Touched

| File/Directory | Reason |
|----------------|--------|
| `src/app/admin/**` | Admin functionality — unrelated |
| `src/app/api/admin/**` | Admin API routes — unrelated |
| `src/components/admin/**` | Admin components — unrelated |
| `src/lib/supabase/admin.ts` | Admin client — must not change |
| `src/lib/supabase/require-admin.ts` | Admin auth guard — must not change |
| `src/lib/orders/whatsapp.ts` | WhatsApp integration — must not change |
| `src/lib/catalogue/**` | Catalogue queries — unrelated |
| `src/data/**` | Fixtures/data — unrelated (except navigation.ts) |
| `src/types/**` | Type definitions — may need minor additions |
| `supabase/migrations/00001_initial_schema.sql` | Existing migration — never modify |
| `supabase/migrations/00002_cta_placements.sql` | Existing migration — never modify |
| `supabase/migrations/00003_orders.sql` | Existing migration — never modify |
| `supabase/seed.sql` | Seed data — unrelated |

---

## 30. Implementation Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Profile trigger failure | HIGH | Use `ON CONFLICT DO NOTHING`, test with existing admin accounts |
| Admin account regressions | HIGH | Trigger must not modify existing profiles. Test admin login before/after. |
| Role escalation via UPDATE | CRITICAL | Fix UPDATE policy before exposing profile editing |
| Session hydration issues | MEDIUM | Use `router.refresh()` after auth state changes, test multi-tab |
| Stale refresh tokens | LOW | Supabase handles token refresh. Middleware + server client handle cookie refresh. |
| Email verification behaviour | MEDIUM | Test full flow: signup → email → verify → profile exists → login |
| Duplicate profile creation | LOW | Trigger uses `ON CONFLICT DO NOTHING` |
| Guest order regression | HIGH | Do not modify existing order creation path for guests. Test guest flow end-to-end. |
| Order ownership spoofing | HIGH | RPC must validate `p_user_id` matches `auth.uid()`. Never trust client-provided user_id without server verification. |
| Saved-item duplication | LOW | `UNIQUE(user_id, product_id)` constraint handles this |
| Archived products in saved list | LOW | Join with products, handle missing gracefully |
| RLS leakage | HIGH | Test all policies with different auth states (anon, customer, admin) |
| Mobile auth UX | MEDIUM | Test signup/login flows on mobile viewport |
| Race conditions | LOW | Profile trigger + auth is atomic within Supabase |
| Multi-tab session state | LOW | `onAuthStateChange` syncs across tabs |
| Google OAuth decision | MEDIUM | Must decide: implement or remove buttons before Sprint 0.19 ships |

---

## 31. QA Matrix for Future Sprint 0.19

### Authentication

| Test Case | Expected Result |
|-----------|-----------------|
| Signup with valid data | Account created, email verification sent, profile row created |
| Signup with duplicate email | Error: "An account with this email already exists" |
| Signup with invalid email | Validation error |
| Signup with weak password | Validation error (min 8 chars) |
| Login with correct credentials | Session created, redirect to /account or / |
| Login with wrong password | Error: "Invalid login credentials" |
| Login with unverified email | Appropriate error or redirect to verification |
| Logout | Session destroyed, redirect to /, header shows logged-out state |
| Expired session | Redirect to /login, no error |
| Session refresh | Seamless — user stays logged in |
| Multiple tabs | Auth state synced across tabs |

### Profile

| Test Case | Expected Result |
|-----------|-----------------|
| Profile created exactly once per signup | One profile row per auth user |
| Admin role protected | Customer cannot change own role to 'admin' |
| Own profile only | RLS blocks reading other users' profiles |
| Update allowed fields | first_name, last_name, phone can be updated |
| Blocked privilege escalation | role field cannot be self-modified |

### Saved Pieces

| Test Case | Expected Result |
|-----------|-----------------|
| Save (authenticated) | Row created in saved_products |
| Duplicate save | UNIQUE constraint prevents duplicate |
| Unsave | Row deleted |
| Reload persistence | Saved items persist across page reloads |
| Another user's data inaccessible | RLS blocks cross-user reads |
| Archived product behaviour | Shows in saved list with appropriate indicator |

### Orders

| Test Case | Expected Result |
|-----------|-----------------|
| Guest order still works | Order created with user_id = NULL, source = 'website_guest' |
| Authenticated order works | Order created with user_id set, source = 'hamatee' |
| Correct owner attached | user_id matches auth.uid() |
| Cannot access another customer's order | RLS blocks cross-user order reads |
| Immutable snapshot rendering | Order history shows product data as-at order time |
| WhatsApp handoff unchanged | Post-order WhatsApp flow identical |
| Idempotency unchanged | Same idempotency key returns same order |

### Responsive/Accessibility

| Test Case | Expected Result |
|-----------|-----------------|
| Mobile signup/login | Forms usable, keyboard accessible |
| Keyboard navigation | All interactive elements focusable |
| Labels | All form fields properly labeled |
| Focus states | Visible focus indicators |
| Loading states | Spinner shown during async operations |
| Error states | Errors announced to screen readers (role="alert") |
| Reduced motion | Animations respect prefers-reduced-motion |

---

## 32. Recommended Sprint 0.19 Mini-Sprint Breakdown

Based on actual repository dependencies:

### 0.19.1 — Auth + Profile Foundation (Database)
- Create migration: profile trigger on `auth.users`
- Create migration: `saved_products` table with RLS
- Fix profiles UPDATE policy (prevent role escalation)
- Test: admin accounts unaffected, new signup creates profile

### 0.19.2 — Signup + Login + Session UX
- Rewrite `/signup` page with real `supabase.auth.signUp()`
- Rewrite `/login` page with real `signInWithPassword()`
- Add auth callback route (`/auth/callback`)
- Add post-auth redirect logic
- Update header to show authenticated state
- Test: full signup → verify email → login flow

### 0.19.3 — Forgot/Reset Password + Logout
- Create `/forgot-password` page
- Create `/reset-password` page
- Wire "Forgot password?" link on login
- Add customer logout to header/account
- Test: full password reset flow

### 0.19.4 — Account Area + Profile + Saved Pieces
- Create `/account` layout with auth guard
- Create `/account` overview page
- Create `/account/profile` edit page
- Migrate `/saved` to `/account/saved` with real persistence
- Update PDP save button to use Supabase
- Test: profile editing, saved pieces CRUD

### 0.19.5 — Authenticated Order Flow + Order History
- Modify `/api/orders` to check session and pass user_id
- Modify `create_order` RPC to accept optional user_id
- Create `/account/orders` list page
- Create `/account/orders/[id]` detail page
- Test: guest order regression, authenticated order ownership

### 0.19.6 — Security Audit + Regression QA + Closeout
- Full RLS audit with test matrix
- Admin regression testing
- Guest order regression testing
- Mobile responsive testing
- Accessibility review
- Documentation updates

---

## 33. Implementation Readiness Verdict

```
NOT READY — BLOCKERS MUST BE RESOLVED
```

### Genuine Blockers

1. **Profile role escalation vulnerability.** The profiles UPDATE policy allows customers to set `role = 'admin'`. This must be fixed before profile editing is exposed. Without this fix, Sprint 0.19 would introduce a privilege escalation vector.

2. **No profile creation mechanism.** The `profiles.first_name` and `profiles.last_name` columns are NOT NULL, but there is no trigger or application logic to create profiles. Signup will fail at the database level if this is not addressed first.

3. **No INSERT policy on profiles for authenticated users.** If using application-side profile creation (not trigger), the INSERT will be blocked by RLS. This must be resolved as part of the profile creation strategy.

### Non-Blocking But Required Before Implementation

4. **Google OAuth decision.** Buttons exist but are non-functional. Must decide: implement or remove before shipping.
5. **Email verification configuration.** Supabase dashboard email templates must be configured (not in repo, but a deployment dependency).
6. **`SITE_URL` / `NEXT_PUBLIC_SITE_URL` environment variable.** Required for auth redirect URLs.

---

*End of Investigation Report*
