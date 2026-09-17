-- ============================================================
-- HAMMAH — Sprint 0.19C: Hamatee Enrolment, Authenticated Orders & Order History
-- ============================================================
-- 1. hamatee_enrolments table for guest birthday enrolment intent
-- 2. Update create_order RPC to support authenticated ownership
-- 3. RLS policies for enrolments and order reads
-- 4. Indexes for performance
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE: hamatee_enrolments
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.hamatee_enrolments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  email             text NOT NULL,
  first_name        text,
  last_name         text,
  phone             text,
  date_of_birth     date NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'invited', 'activated', 'existing_account', 'failed', 'cancelled')),
  activated_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  activated_at      timestamptz,
  last_error        text
);

-- One enrolment per order maximum
CREATE UNIQUE INDEX IF NOT EXISTS idx_hamatee_enrolments_order_id
  ON public.hamatee_enrolments (order_id);

-- Enrolments by email (for existing account detection)
CREATE INDEX IF NOT EXISTS idx_hamatee_enrolments_email
  ON public.hamatee_enrolments (email);

-- Enrolments by status (for admin queries)
CREATE INDEX IF NOT EXISTS idx_hamatee_enrolments_status
  ON public.hamatee_enrolments (status);

CREATE TRIGGER hamatee_enrolments_set_updated_at
  BEFORE UPDATE ON public.hamatee_enrolments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. RLS: hamatee_enrolments
-- ─────────────────────────────────────────────

ALTER TABLE public.hamatee_enrolments ENABLE ROW LEVEL SECURITY;

-- No public/anon read on enrolments (personal data)
-- Admins can read all enrolments
CREATE POLICY "Enrolments: admins can read all"
  ON public.hamatee_enrolments FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update enrolments
CREATE POLICY "Enrolments: admins can update"
  ON public.hamatee_enrolments FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Inserts happen via SECURITY DEFINER function only (bypasses RLS)

-- ─────────────────────────────────────────────
-- 3. FUNCTION: Replace create_order to support authenticated ownership
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
  p_idempotency_key text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_source text DEFAULT 'website_guest'
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
  v_source text;
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

  -- Determine source: validate and use provided source
  v_source := COALESCE(p_source, 'website_guest');
  IF v_source NOT IN ('website_guest', 'hamatee') THEN
    v_source := 'website_guest';
  END IF;

  -- If user_id is provided, force source to hamatee
  IF p_user_id IS NOT NULL THEN
    v_source := 'hamatee';
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
    order_number, user_id, source, communication_channel, status,
    customer_name, customer_phone, customer_email,
    delivery_region, delivery_city, delivery_area,
    delivery_landmark, delivery_gps, delivery_notes, customer_note,
    idempotency_key
  ) VALUES (
    v_order_number, p_user_id, v_source, 'whatsapp', 'pending',
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
-- 4. FUNCTION: Create hamatee enrolment (server-side only)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_hamatee_enrolment(
  p_order_id uuid,
  p_email text,
  p_date_of_birth date,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrolment_id uuid;
  v_existing_user_id uuid;
  v_status text;
BEGIN
  -- Check if email already belongs to an auth user
  SELECT id INTO v_existing_user_id
  FROM auth.users
  WHERE email = lower(trim(p_email));

  IF v_existing_user_id IS NOT NULL THEN
    v_status := 'existing_account';
  ELSE
    v_status := 'pending';
  END IF;

  -- Insert enrolment (upsert: one per order)
  INSERT INTO public.hamatee_enrolments (
    order_id, email, first_name, last_name, phone,
    date_of_birth, status, activated_user_id
  ) VALUES (
    p_order_id,
    lower(trim(p_email)),
    p_first_name,
    p_last_name,
    p_phone,
    p_date_of_birth,
    v_status,
    CASE WHEN v_existing_user_id IS NOT NULL THEN v_existing_user_id ELSE NULL END
  )
  ON CONFLICT (order_id) DO UPDATE
    SET email = lower(trim(p_email)),
        first_name = p_first_name,
        last_name = p_last_name,
        phone = p_phone,
        date_of_birth = p_date_of_birth,
        status = v_status,
        activated_user_id = CASE WHEN v_existing_user_id IS NOT NULL THEN v_existing_user_id ELSE hamatee_enrolments.activated_user_id END,
        updated_at = now()
  RETURNING id INTO v_enrolment_id;

  RETURN v_enrolment_id;
END;
$$;

-- ─────────────────────────────────────────────
-- END OF MIGRATION
-- ============================================================
