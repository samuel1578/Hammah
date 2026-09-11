-- ============================================================
-- HAMMAH — Sprint 0.17: CTA Placements
-- ============================================================
-- Adds the CTA Manager system for Admin-managed call-to-action
-- placements in predefined frontend positions.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE: cta_placements
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cta_placements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot           text NOT NULL,
  label          text NOT NULL,
  href           text NOT NULL,
  enabled        boolean NOT NULL DEFAULT true,
  variant        text NOT NULL DEFAULT 'primary' CHECK (variant IN ('primary', 'secondary', 'ghost')),
  sort_order     integer NOT NULL DEFAULT 0,
  starts_at      timestamptz,
  ends_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER cta_placements_set_updated_at
  BEFORE UPDATE ON public.cta_placements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_cta_slot ON public.cta_placements(slot);
CREATE INDEX IF NOT EXISTS idx_cta_enabled ON public.cta_placements(enabled, sort_order);

-- ─────────────────────────────────────────────
-- 2. UNIQUE: one active CTA per slot
-- ─────────────────────────────────────────────

-- Note: We allow multiple CTAs per slot (for A/B or scheduling)
-- but only one can be enabled at a time. enforced at app level.

-- ─────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE public.cta_placements ENABLE ROW LEVEL SECURITY;

-- Public can read enabled, non-expired CTAs for rendering
CREATE POLICY "CTA: public read active"
  ON public.cta_placements FOR SELECT
  TO anon, authenticated
  USING (
    enabled = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

-- Admins can read all CTAs
CREATE POLICY "CTA: admins can read all"
  ON public.cta_placements FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert CTAs
CREATE POLICY "CTA: admins can insert"
  ON public.cta_placements FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update CTAs
CREATE POLICY "CTA: admins can update"
  ON public.cta_placements FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete CTAs
CREATE POLICY "CTA: admins can delete"
  ON public.cta_placements FOR DELETE
  TO authenticated
  USING (public.is_admin());
