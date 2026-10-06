-- ============================================================
-- HAMMAH — Brevo Sprint 1: Notification Recipients
-- ============================================================
-- Admin-managed list of addresses that receive new-order
-- notifications. One row per recipient — never a comma-separated
-- string. Follows the existing cta_placements admin-CRUD + is_admin()
-- RLS convention.
--
-- No Admin UI/API is built in this sprint (Sprint 2). Server-side email
-- code reads enabled recipients through the service-role client.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE: notification_recipients
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notification_recipients (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  label      text,
  enabled    boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_recipients_email_lowercase
    CHECK (email = lower(email)),
  CONSTRAINT notification_recipients_email_format
    CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

CREATE TRIGGER notification_recipients_set_updated_at
  BEFORE UPDATE ON public.notification_recipients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- One row per address. Emails are stored lower-cased, so a plain unique
-- index prevents obvious duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS ux_notification_recipients_email
  ON public.notification_recipients(email);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_enabled
  ON public.notification_recipients(enabled);

-- ─────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
-- The public storefront must not be able to read or modify the list.
-- There is deliberately NO anon policy and no public SELECT policy.

ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notification recipients: admins can read"
  ON public.notification_recipients FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Notification recipients: admins can insert"
  ON public.notification_recipients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Notification recipients: admins can update"
  ON public.notification_recipients FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Notification recipients: admins can delete"
  ON public.notification_recipients FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- END OF MIGRATION
-- ============================================================
