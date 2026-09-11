-- ============================================================
-- HAMMAH — Sprint 0.18.1: Order Domain + Persistence Foundation
-- ============================================================
-- Adds orders, order_items, order number sequence, RLS policies,
-- and an atomic create_order RPC function.
--
-- Run via: Supabase SQL Editor, supabase CLI, or psql.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. SEQUENCE: order numbers
-- ─────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ─────────────────────────────────────────────
-- 2. TABLE: orders
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number           text NOT NULL UNIQUE,
  user_id                uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source                 text NOT NULL DEFAULT 'website_guest' CHECK (source IN ('website_guest', 'hamatee')),
  communication_channel  text NOT NULL DEFAULT 'whatsapp',
  status                 text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  customer_name          text NOT NULL,
  customer_phone         text NOT NULL,
  customer_email         text,
  delivery_region        text NOT NULL,
  delivery_city          text NOT NULL,
  delivery_area          text,
  delivery_landmark      text,
  delivery_gps           text,
  delivery_notes         text,
  customer_note          text,
  admin_notes            text,
  idempotency_key        text UNIQUE,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ─────────────────────────────────────────────
-- 3. TABLE: order_items
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id               uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot    text NOT NULL,
  product_slug_snapshot    text NOT NULL,
  variant_label            text,
  variant_value            text,
  quantity                 integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  pricing_mode_snapshot    text NOT NULL,
  price_amount_snapshot    integer,
  currency                 text NOT NULL DEFAULT 'GHS',
  media_url_snapshot       text,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ─────────────────────────────────────────────
-- 4. ATOMIC ORDER CREATION FUNCTION
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_region text,
  p_delivery_city text,
  p_product_id uuid,
  p_customer_email text DEFAULT NULL,
  p_delivery_area text DEFAULT NULL,
  p_delivery_landmark text DEFAULT NULL,
  p_delivery_gps text DEFAULT NULL,
  p_delivery_notes text DEFAULT NULL,
  p_customer_note text DEFAULT NULL,
  p_variant_value text DEFAULT NULL,
  p_quantity integer DEFAULT 1,
  p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE(order_id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_product record;
  v_variant record;
  v_media_url text;
  v_existing record;
BEGIN
  -- Idempotency: if key provided, return existing order
  IF p_idempotency_key IS NOT NULL THEN
    SELECT o.id, o.order_number INTO v_existing
    FROM public.orders o
    WHERE o.idempotency_key = p_idempotency_key;

    IF v_existing IS NOT NULL THEN
      order_id := v_existing.id;
      order_number := v_existing.order_number;
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- Validate product exists and is published
  SELECT id, name, slug, pricing_mode, price_amount, currency, availability
  INTO v_product
  FROM public.products
  WHERE id = p_product_id AND status = 'published';

  IF v_product IS NULL THEN
    RAISE EXCEPTION 'Product not found or not available';
  END IF;

  -- Validate availability
  IF v_product.availability != 'AVAILABLE' THEN
    RAISE EXCEPTION 'Product is not currently available';
  END IF;

  -- Validate variant if provided
  IF p_variant_value IS NOT NULL THEN
    SELECT id, size_label, size_value, available
    INTO v_variant
    FROM public.product_variants
    WHERE product_id = p_product_id AND size_value = p_variant_value;

    IF v_variant IS NULL THEN
      RAISE EXCEPTION 'Variant not found for this product';
    END IF;

    IF NOT v_variant.available THEN
      RAISE EXCEPTION 'Selected size is not available';
    END IF;
  END IF;

  -- Validate quantity
  IF p_quantity < 1 OR p_quantity > 10 THEN
    RAISE EXCEPTION 'Quantity must be between 1 and 10';
  END IF;

  -- Validate required customer fields
  IF TRIM(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  IF TRIM(p_customer_phone) = '' THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;
  IF TRIM(p_delivery_region) = '' THEN
    RAISE EXCEPTION 'Delivery region is required';
  END IF;
  IF TRIM(p_delivery_city) = '' THEN
    RAISE EXCEPTION 'Delivery city is required';
  END IF;

  -- Get primary media URL for snapshot
  SELECT ma.public_url INTO v_media_url
  FROM public.product_media pm
  JOIN public.media_assets ma ON ma.id = pm.media_asset_id
  WHERE pm.product_id = p_product_id AND pm.role = 'primary'
  LIMIT 1;

  -- Generate order number: HAM-YYYY-NNNN
  v_order_number := 'HAM-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(nextval('order_number_seq')::text, 4, '0');

  -- Create order
  INSERT INTO public.orders (
    order_number, source, communication_channel, status,
    customer_name, customer_phone, customer_email,
    delivery_region, delivery_city, delivery_area,
    delivery_landmark, delivery_gps, delivery_notes, customer_note,
    idempotency_key
  ) VALUES (
    v_order_number, 'website_guest', 'whatsapp', 'pending',
    TRIM(p_customer_name), TRIM(p_customer_phone), NULLIF(TRIM(COALESCE(p_customer_email, '')), ''),
    TRIM(p_delivery_region), TRIM(p_delivery_city), NULLIF(TRIM(COALESCE(p_delivery_area, '')), ''),
    NULLIF(TRIM(COALESCE(p_delivery_landmark, '')), ''), NULLIF(TRIM(COALESCE(p_delivery_gps, '')), ''),
    NULLIF(TRIM(COALESCE(p_delivery_notes, '')), ''), NULLIF(TRIM(COALESCE(p_customer_note, '')), ''),
    p_idempotency_key
  )
  RETURNING id INTO v_order_id;

  -- Create order item with immutable snapshots
  INSERT INTO public.order_items (
    order_id, product_id,
    product_name_snapshot, product_slug_snapshot,
    variant_label, variant_value,
    quantity,
    pricing_mode_snapshot, price_amount_snapshot, currency,
    media_url_snapshot
  ) VALUES (
    v_order_id, p_product_id,
    v_product.name, v_product.slug,
    COALESCE(v_variant.size_label, p_variant_value), p_variant_value,
    p_quantity,
    v_product.pricing_mode, v_product.price_amount, v_product.currency,
    v_media_url
  );

  order_id := v_order_id;
  order_number := v_order_number;
  RETURN NEXT;
END;
$$;

-- ─────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- No public read on orders — customer data must not be exposed
-- Inserts happen via SECURITY DEFINER function (bypasses RLS)

-- Authenticated users can read their own orders
CREATE POLICY "Orders: authenticated user can read own"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all orders
CREATE POLICY "Orders: admins can read all"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update orders (status, notes)
CREATE POLICY "Orders: admins can update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order items: authenticated user can read own (via parent order)
CREATE POLICY "Order items: authenticated user can read own"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "Order items: admins can read all"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- END OF MIGRATION
-- ============================================================
