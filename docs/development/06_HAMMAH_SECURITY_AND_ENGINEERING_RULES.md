# 06 — HAMMAH Security and Engineering Rules

> **Purpose:** The strict rules document every future AI/developer must obey.
>
> **Canonical source of truth:** This document.
>
> **Last verified against repo:** September 16, 2026 (updated Sprint 0.19A)

---

## 1. NO GUESSING

Never guess:

- Table names
- Column names
- Routes
- Environment variables
- API endpoints
- Component behaviour
- Permissions
- RLS policies
- Media providers
- Auth behaviour

**If you are unsure, inspect first. Do not assume.**

---

## 2. INVESTIGATION FIRST

Before editing any subsystem:

1. **Locate** the current implementation (file, line, component)
2. **Trace** imports and dependencies
3. **Inspect** types and interfaces
4. **Inspect** schema/migrations if backend-related
5. **Inspect** existing utilities and helpers
6. **Inspect** related tests (if any)
7. **Understand** current behaviour completely
8. **Then** make changes

**Do not edit code you have not read.**

---

## 3. SECURITY

### Secrets

- **Never expose Supabase service role key client-side.** It bypasses all RLS.
- **Never expose Cloudflare secrets client-side.**
- **Never commit secrets to the repository.** Use `.env.local` (gitignored).
- **Never log secrets or keys.**

### Input Validation

- Client input is untrusted — always validate on server
- Server-side validation is mandatory for all mutations
- Use Zod or equivalent for schema validation on API routes
- Sanitise user-generated content

### RLS

- RLS is mandatory for all protected data
- Role checks must NOT exist only in frontend UI — they must be enforced at the database level
- Admin role check happens in RLS policies, not just in application code

### Auth

- Session handled via HTTP-only cookies (Supabase default)
- Middleware validates session on protected routes
- Profile created via database trigger on signup (not client-side)

### Media Uploads

- Media uploads must be authenticated and authorised
- Use signed URLs for client-to-R2 uploads (never expose R2 credentials)
- Validate file type, size, and dimensions server-side

### Destructive Operations

- Destructive operations require reference checks
- Archive before delete
- Verify zero references before hard delete

---

## 4. ARCHITECTURAL DISCIPLINE

### Reuse Before Creating

- Check existing components, utilities, and helpers before creating new ones
- Do not create duplicate helpers
- Do not introduce new dependencies casually

### Do Not Modify Unrelated Areas

- When editing a feature, stay within its boundaries
- Do not refactor unrelated code in the same change
- Do not change architecture silently

### Do Not Invent

- Do not invent new tables or fields during implementation unless approved
- Do not add columns "while you're at it"
- Do not remove working fallback systems until parity is verified
- Do not assume a library is available — check `package.json` first

### Follow Existing Patterns

- Check neighbouring files for code style conventions
- Use existing libraries and utilities
- Follow existing naming conventions
- Maintain consistent formatting

---

## 5. DOCUMENTATION

Any real architecture, schema, security, admin, or media change must update the relevant canonical doc in the same sprint.

| Change Type | Update Document |
|-------------|----------------|
| New table or field | `03_HAMMAH_DATA_MODEL.md` |
| New route | `01_HAMMAH_SYSTEM_CONTEXT.md` |
| Security change | `06_HAMMAH_SECURITY_AND_ENGINEERING_RULES.md` |
| Media strategy change | `05_HAMMAH_MEDIA_ARCHITECTURE.md` |
| Business rule change | `04_HAMMAH_PRODUCT_AND_ADMIN_RULES.md` |
| Architecture change | `02_HAMMAH_ARCHITECTURE.md` |
| Sprint progress | `SPRINT_LOG.md` and `HAMMAH_SPRINT_REPORT.md` |

---

## 6. SOURCE OF TRUTH PRECEDENCE

When information conflicts, use this precedence (highest first):

1. **Actual migrations/database/current implementation** — the code is truth
2. **Canonical development docs** (this system) — approved architecture
3. **Approved current sprint specification** — what this sprint says to do
4. **Sprint report/log** — historical record
5. **Assumptions are not acceptable without validation**

**If implementation conflicts with docs: STOP and report the discrepancy.**

---

## 7. ENVIRONMENT

### Required Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_PUBLIC_BASE_URL=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# WhatsApp
NEXT_PUBLIC_HAMMAH_WHATSAPP_NUMBER=
```

### Rules

- `.env.local` is gitignored — never commit it
- `.env.example` documents required variables (no values)
- `NEXT_PUBLIC_` prefixed vars are client-safe
- Non-prefixed vars are server-only
- Service role key (`SUPABASE_SECRET_KEY`) is NEVER exposed to client
- Cloudflare credentials are NEVER exposed to client

---

## 8. GIT

- Never commit secrets or keys
- Never commit `.env.local`
- Stage only intended files
- Write concise commit messages matching repo style
- Do not force-push unless explicitly requested
- Do not amend commits unless explicitly requested

---

## 9. AI BEHAVIOUR

- Do not add unnecessary comments unless asked
- Do not add documentation files unless asked
- Do not explain code unless asked
- Do not add emojis unless asked
- Be concise — fewer than 4 lines of text unless detail is requested
- Run lint/typecheck after code changes
- Verify build succeeds before reporting completion

---

# Mandatory AI Prompt Preamble

Every future HAMMAH development prompt MUST include this preamble or reference this document:

---

**Before implementing ANY changes to the HAMMAH codebase, you MUST:**

1. **Read all 7 canonical development docs:**
   - `docs/development/01_HAMMAH_SYSTEM_CONTEXT.md`
   - `docs/development/02_HAMMAH_ARCHITECTURE.md`
   - `docs/development/03_HAMMAH_DATA_MODEL.md`
   - `docs/development/04_HAMMAH_PRODUCT_AND_ADMIN_RULES.md`
   - `docs/development/05_HAMMAH_MEDIA_ARCHITECTURE.md`
   - `docs/development/06_HAMMAH_SECURITY_AND_ENGINEERING_RULES.md`
   - `docs/development/07_HAMMAH_DEVELOPMENT_ROADMAP.md`

2. **Read the cumulative sprint history:**
   - `HAMMAH_SPRINT_REPORT.md`
   - `SPRINT_LOG.md`

3. **Inspect the relevant code before modification:**
   - Locate the current implementation
   - Trace imports
   - Inspect types
   - Understand current behaviour
   - Then make changes

4. **Follow the rules in this document** (06_HAMMAH_SECURITY_AND_ENGINEERING_RULES.md):
   - NO GUESSING
   - INVESTIGATION FIRST
   - SECURITY
   - ARCHITECTURAL DISCIPLINE
   - DOCUMENTATION

5. **After changes, verify:**
   - `npm run lint` passes
   - `npm run build` succeeds
   - No contradictory definitions between docs

**If you cannot or will not follow these steps, do not proceed.**

---

*This document is the canonical security and engineering rules reference. For the architecture, see `02_HAMMAH_ARCHITECTURE.md`. For the data model, see `03_HAMMAH_DATA_MODEL.md`.*
