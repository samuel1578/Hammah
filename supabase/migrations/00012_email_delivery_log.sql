-- ============================================================
-- HAMMAH — Brevo Sprint 1: Email Delivery Log
-- ============================================================
-- Outbound transactional-email audit trail and idempotency anchor for
-- the Brevo email foundation. No application code sends email yet; this
-- table is written by src/lib/email/log.ts in future sprints.
--
-- Access model:
--   * writes/reads via the service-role client (bypasses RLS)
--   * admins may read for future diagnostics
--   * the storefront (anon/authenticated non-admin) has no access
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE: email_delivery_log
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.email_delivery_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key     text NOT NULL,
  recipient        text NOT NULL,
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id         uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  dedupe_key       text,
  brevo_message_id text,
  error            text,
  metadata         jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  sent_at          timestamptz,
  CONSTRAINT email_delivery_log_recipient_lowercase
    CHECK (recipient = lower(recipient)),
  CONSTRAINT email_delivery_log_dedupe_key_not_blank
    CHECK (dedupe_key IS NULL OR length(dedupe_key) > 0)
);

CREATE TRIGGER email_delivery_log_set_updated_at
  BEFORE UPDATE ON public.email_delivery_log
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. IDEMPOTENCY
-- ─────────────────────────────────────────────
-- A single dedicated `dedupe_key` serves every duplicate-prevention rule
-- instead of several awkward partial expression indexes:
--   order emails   → '<template>:order:<order_id>:<recipient>'
--   welcome        → '<template>:user:<user_id>:<recipient>'
--   birthday       → '<template>:year:<year>:<recipient>'
-- Keys are built centrally in src/lib/email/log.ts. A unique violation is
-- the duplicate signal (see `claimDelivery`). NULL keys are allowed for
-- rows that intentionally carry no dedupe scope.

CREATE UNIQUE INDEX IF NOT EXISTS ux_email_delivery_log_dedupe_key
  ON public.email_delivery_log(dedupe_key)
  WHERE dedupe_key IS NOT NULL;

-- ─────────────────────────────────────────────
-- 3. INDEXES
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_email_delivery_log_template_recipient
  ON public.email_delivery_log(template_key, recipient, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_delivery_log_order
  ON public.email_delivery_log(order_id);

CREATE INDEX IF NOT EXISTS idx_email_delivery_log_user
  ON public.email_delivery_log(user_id);

CREATE INDEX IF NOT EXISTS idx_email_delivery_log_status
  ON public.email_delivery_log(status);

-- ─────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE public.email_delivery_log ENABLE ROW LEVEL SECURITY;

-- No anon or authenticated write policies exist. The storefront cannot
-- read or modify delivery records. Inserts/updates happen through the
-- service-role client only.
--
-- Admins may read for future diagnostics (Sprint 2+ Admin surfaces).
CREATE POLICY "Email delivery log: admins can read"
  ON public.email_delivery_log FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- END OF MIGRATION
-- ============================================================
