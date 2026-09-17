-- ============================================================
-- HAMMAH — Size Guides System
-- ============================================================
-- 1. size_guides table
-- 2. size_guide_rows table
-- 3. products.size_guide_id FK
-- 4. RLS policies
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE: size_guides
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.size_guides (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  unit        text NOT NULL DEFAULT 'cm',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER size_guides_set_updated_at
  BEFORE UPDATE ON public.size_guides
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. TABLE: size_guide_rows
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.size_guide_rows (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  size_guide_id  uuid NOT NULL REFERENCES public.size_guides(id) ON DELETE CASCADE,
  size_label     text NOT NULL,
  sort_order     integer NOT NULL DEFAULT 0,
  measurements   jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_size_guide_rows_guide ON public.size_guide_rows(size_guide_id);

CREATE TRIGGER size_guide_rows_set_updated_at
  BEFORE UPDATE ON public.size_guide_rows
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 3. COLUMN: products.size_guide_id
-- ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'size_guide_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN size_guide_id uuid REFERENCES public.size_guides(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 4. RLS: size_guides
-- ─────────────────────────────────────────────

ALTER TABLE public.size_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.size_guide_rows ENABLE ROW LEVEL SECURITY;

-- Public can read active size guides
CREATE POLICY "Size guides: public can read active"
  ON public.size_guides FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Public can read rows of active size guides
CREATE POLICY "Size guide rows: public can read active"
  ON public.size_guide_rows FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.size_guides
      WHERE size_guides.id = size_guide_rows.size_guide_id
        AND size_guides.is_active = true
    )
  );

-- Admins can do everything with size guides
CREATE POLICY "Size guides: admins can insert"
  ON public.size_guides FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Size guides: admins can update"
  ON public.size_guides FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Size guides: admins can delete"
  ON public.size_guides FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Admins can do everything with size guide rows
CREATE POLICY "Size guide rows: admins can insert"
  ON public.size_guide_rows FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Size guide rows: admins can update"
  ON public.size_guide_rows FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Size guide rows: admins can delete"
  ON public.size_guide_rows FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- END OF MIGRATION
-- ============================================================
