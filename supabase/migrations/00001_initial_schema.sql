-- ============================================================
-- HAMMAH — Sprint 0.15 Foundation Migration
-- ============================================================
-- Applies the approved Sprint 0.15 schema:
--   profiles, categories, collections, products, product_variants,
--   collection_products, media_assets, product_media,
--   homepage_featured_products, homepage_hero_images,
--   homepage_collection_feature
--
-- Run via: Supabase SQL Editor, supabase CLI, or psql.
-- All objects are idempotent-safe where possible.
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. HELPER: updated_at trigger function
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- 1. TABLE: profiles
-- ─────────────────────────────────────────────

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

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. TABLE: categories
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  name              text NOT NULL,
  short_description text,
  description       text,
  cover_image_url   text,
  sort_order        integer NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 3. TABLE: collections
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.collections (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text NOT NULL UNIQUE,
  name                  text NOT NULL,
  description           text,
  hero_image_url        text,
  hero_image_mobile_url text,
  editorial_heading     text,
  editorial_statement   text,
  editorial_body        text,
  sort_order            integer NOT NULL DEFAULT 0,
  status                text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER collections_set_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 4. TABLE: products
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  description   text,
  category_id   uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  pricing_mode  text NOT NULL DEFAULT 'PRICE_ON_REQUEST' CHECK (pricing_mode IN ('PRICE_ON_REQUEST', 'FIXED')),
  price_amount  integer,
  currency      text NOT NULL DEFAULT 'GHS',
  availability  text NOT NULL DEFAULT 'COMING_SOON' CHECK (availability IN ('AVAILABLE', 'COMING_SOON', 'SOLD_OUT')),
  sort_order    integer NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at  timestamptz,
  video_url     text,
  has_360       boolean NOT NULL DEFAULT false,
  set_360_id    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sort ON public.products(category_id, sort_order);

-- ─────────────────────────────────────────────
-- 5. TABLE: product_variants
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_variants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_label text NOT NULL,
  size_value text NOT NULL,
  available  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, size_value)
);

CREATE INDEX IF NOT EXISTS idx_pv_product ON public.product_variants(product_id);

-- ─────────────────────────────────────────────
-- 6. TABLE: collection_products (junction)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.collection_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_collection ON public.collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_cp_product ON public.collection_products(product_id);

-- ─────────────────────────────────────────────
-- 7. TABLE: media_assets
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.media_assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key     text NOT NULL UNIQUE,
  public_url      text NOT NULL,
  media_type      text NOT NULL CHECK (media_type IN ('image', 'video', '360_frame')),
  mime_type       text NOT NULL,
  file_size_bytes integer,
  width           integer,
  height          integer,
  alt_text        text NOT NULL DEFAULT '',
  caption         text,
  set_id          text,
  frame_order     integer,
  duration_ms     integer,
  uploaded_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER media_assets_set_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_ma_type ON public.media_assets(media_type);
CREATE INDEX IF NOT EXISTS idx_ma_set ON public.media_assets(set_id) WHERE set_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ma_uploaded ON public.media_assets(uploaded_by);

-- ─────────────────────────────────────────────
-- 8. TABLE: product_media (junction)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_media (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  media_asset_id uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  role           text NOT NULL CHECK (role IN ('primary', 'hover', 'gallery', 'detail')),
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, media_asset_id)
);

CREATE INDEX IF NOT EXISTS idx_pm_product ON public.product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_pm_asset ON public.product_media(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_pm_role ON public.product_media(product_id, role);

-- ─────────────────────────────────────────────
-- 9. TABLE: homepage_featured_products
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.homepage_featured_products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_hfp_active ON public.homepage_featured_products(is_active, sort_order);

-- ─────────────────────────────────────────────
-- 10. TABLE: homepage_hero_images
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.homepage_hero_images (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id   uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  alt_text         text NOT NULL DEFAULT '',
  object_position  text,
  sort_order       integer NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hhi_active ON public.homepage_hero_images(is_active, sort_order);

-- ─────────────────────────────────────────────
-- 11. TABLE: homepage_collection_feature
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.homepage_collection_feature (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  heading       text NOT NULL DEFAULT 'The first release.',
  statement     text NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 12. ADMIN CHECK FUNCTION
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────
-- 13. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_collection_feature ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────

CREATE POLICY "Profiles: user can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Profiles: user can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Profiles: admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ── categories ──────────────────────────────

CREATE POLICY "Categories: public read published"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Categories: admins can read all"
  ON public.categories FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Categories: admins can insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Categories: admins can update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Categories: admins can delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── collections ─────────────────────────────

CREATE POLICY "Collections: public read published"
  ON public.collections FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Collections: admins can read all"
  ON public.collections FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Collections: admins can insert"
  ON public.collections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Collections: admins can update"
  ON public.collections FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Collections: admins can delete"
  ON public.collections FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── products ────────────────────────────────

CREATE POLICY "Products: public read published"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Products: admins can read all"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Products: admins can insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Products: admins can update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Products: admins can delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── product_variants ────────────────────────

CREATE POLICY "Product variants: public read for published products"
  ON public.product_variants FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
        AND products.status = 'published'
    )
  );

CREATE POLICY "Product variants: admins can read all"
  ON public.product_variants FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Product variants: admins can insert"
  ON public.product_variants FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Product variants: admins can update"
  ON public.product_variants FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Product variants: admins can delete"
  ON public.product_variants FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── collection_products ─────────────────────

CREATE POLICY "Collection products: public read for published collections"
  ON public.collection_products FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_products.collection_id
        AND collections.status = 'published'
    )
  );

CREATE POLICY "Collection products: admins can read all"
  ON public.collection_products FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Collection products: admins can insert"
  ON public.collection_products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Collection products: admins can delete"
  ON public.collection_products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── media_assets ────────────────────────────

CREATE POLICY "Media assets: public read"
  ON public.media_assets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Media assets: admins can read all"
  ON public.media_assets FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Media assets: admins can insert"
  ON public.media_assets FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Media assets: admins can update"
  ON public.media_assets FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Media assets: admins can delete"
  ON public.media_assets FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── product_media ───────────────────────────

CREATE POLICY "Product media: public read for published products"
  ON public.product_media FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_media.product_id
        AND products.status = 'published'
    )
  );

CREATE POLICY "Product media: admins can read all"
  ON public.product_media FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Product media: admins can insert"
  ON public.product_media FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Product media: admins can delete"
  ON public.product_media FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── homepage_featured_products ──────────────

CREATE POLICY "Homepage featured: public read active"
  ON public.homepage_featured_products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Homepage featured: admins can read all"
  ON public.homepage_featured_products FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Homepage featured: admins can insert"
  ON public.homepage_featured_products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Homepage featured: admins can update"
  ON public.homepage_featured_products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Homepage featured: admins can delete"
  ON public.homepage_featured_products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── homepage_hero_images ────────────────────

CREATE POLICY "Homepage hero: public read active"
  ON public.homepage_hero_images FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Homepage hero: admins can read all"
  ON public.homepage_hero_images FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Homepage hero: admins can insert"
  ON public.homepage_hero_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Homepage hero: admins can update"
  ON public.homepage_hero_images FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Homepage hero: admins can delete"
  ON public.homepage_hero_images FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── homepage_collection_feature ─────────────

CREATE POLICY "Homepage collection feature: public read active"
  ON public.homepage_collection_feature FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Homepage collection feature: admins can read all"
  ON public.homepage_collection_feature FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Homepage collection feature: admins can insert"
  ON public.homepage_collection_feature FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Homepage collection feature: admins can update"
  ON public.homepage_collection_feature FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Homepage collection feature: admins can delete"
  ON public.homepage_collection_feature FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- END OF MIGRATION
-- ============================================================
