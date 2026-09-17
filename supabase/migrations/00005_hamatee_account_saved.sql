-- ============================================================
-- HAMMAH — Sprint 0.19B: Hamatee Account, Profile & Saved Pieces
-- ============================================================
-- 1. profiles.date_of_birth column
-- 2. saved_products table
-- 3. RLS policies for saved_products
-- 4. Indexes for performance
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. COLUMN: profiles.date_of_birth
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date NULL;

-- ─────────────────────────────────────────────
-- 2. TABLE: saved_products
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.saved_products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ─────────────────────────────────────────────
-- 3. INDEXES
-- ─────────────────────────────────────────────

-- Saved products by user (for /account/saved listing)
CREATE INDEX IF NOT EXISTS idx_saved_products_user_id
  ON public.saved_products (user_id);

-- Save state lookup by user + product (for PDP button state)
CREATE INDEX IF NOT EXISTS idx_saved_products_user_product
  ON public.saved_products (user_id, product_id);

-- ─────────────────────────────────────────────
-- 4. RLS: saved_products
-- ─────────────────────────────────────────────

ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

-- SELECT: authenticated user reads only their own
CREATE POLICY "Saved products: user can read own"
  ON public.saved_products FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: authenticated user inserts only their own
CREATE POLICY "Saved products: user can insert own"
  ON public.saved_products FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: authenticated user deletes only their own
CREATE POLICY "Saved products: user can delete own"
  ON public.saved_products FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- END OF MIGRATION
-- ============================================================
