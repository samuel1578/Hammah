-- Add video_media_id FK so admin selects a video from the Media Library
-- rather than pasting a raw URL.

-- 1. Add the FK column (nullable — existing rows with manual video_url are unaffected)
ALTER TABLE public.products
  ADD COLUMN video_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL;

CREATE INDEX idx_products_video_media_id ON public.products(video_media_id);

COMMENT ON COLUMN public.products.video_media_id IS
  'FK to media_assets — the product video selected via the Media Library picker.';

-- 2. Back-fill video_media_id from existing video_url where the asset already exists
UPDATE public.products p
SET video_media_id = ma.id
FROM public.media_assets ma
WHERE ma.public_url = p.video_url
  AND ma.media_type = 'video'
  AND p.video_media_id IS NULL;

-- 3. RLS — admins manage, public read (same as products table)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Admin full access (already exists, but ensure the new column is covered)
-- Products RLS policies are already in place from 00001; no new policy needed.

-- 4. Grant usage to service_role for back-end operations
GRANT SELECT, UPDATE ON public.products TO service_role;
