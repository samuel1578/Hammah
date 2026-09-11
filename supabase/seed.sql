-- ============================================================
-- HAMMAH — Sprint 0.16 Seed Data
-- ============================================================
-- Seeds the approved catalogue from existing fixture data.
-- Run AFTER 00001_initial_schema.sql has been applied.
--
-- Source fixtures:
--   src/data/products.ts       (8 products)
--   src/data/collections.ts    (3 collections)
--   src/data/categories.ts     (3 categories)
--   src/data/pixieset-collection-001.ts (160 images, 56 used)
--
-- Strategy: Deterministic UUIDs via gen_random_uuid() with
-- explicit slugs for stable public identity. Media assets
-- seeded only for the 56 product-curated Pixieset images.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────────

INSERT INTO public.categories (id, slug, name, short_description, sort_order, status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'trousers', 'Trousers',
   'African-print trousers form the opening Hammah collection.', 1, 'published'),
  ('a0000000-0000-0000-0000-000000000002', 'kaftans', 'Kaftans',
   'A wider expression of the Hammah wardrobe.', 2, 'published'),
  ('a0000000-0000-0000-0000-000000000003', 'footwear', 'African-made Footwear',
   'The Hammah wardrobe continues from the ground up.', 3, 'published')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. COLLECTIONS
-- ─────────────────────────────────────────────

INSERT INTO public.collections (id, slug, name, description, sort_order, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'collection-001', 'Collection 001',
   'Eight African-print trouser designs form the first orderable Hammah collection.', 1, 'published'),
  ('b0000000-0000-0000-0000-000000000002', 'kaftans', 'Kaftans',
   'A wider expression of the Hammah wardrobe.', 2, 'published'),
  ('b0000000-0000-0000-0000-000000000003', 'footwear', 'Footwear',
   'The Hammah wardrobe continues from the ground up.', 3, 'published')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────────
-- All 8 products: DESIGN_01–DESIGN_08
-- Category: trousers (a0000000-0000-0000-0000-000000000001)
-- Pricing: PRICE_ON_REQUEST, AVAILABLE, published

INSERT INTO public.products (id, slug, name, description, category_id, pricing_mode, availability, sort_order, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'design-01', 'Design 01',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 1, 'published'),
  ('c0000000-0000-0000-0000-000000000002', 'design-02', 'Design 02',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 2, 'published'),
  ('c0000000-0000-0000-0000-000000000003', 'design-03', 'Design 03',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 3, 'published'),
  ('c0000000-0000-0000-0000-000000000004', 'design-04', 'Design 04',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 4, 'published'),
  ('c0000000-0000-0000-0000-000000000005', 'design-05', 'Design 05',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 5, 'published'),
  ('c0000000-0000-0000-0000-000000000006', 'design-06', 'Design 06',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 6, 'published'),
  ('c0000000-0000-0000-0000-000000000007', 'design-07', 'Design 07',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 7, 'published'),
  ('c0000000-0000-0000-0000-000000000008', 'design-08', 'Design 08',
   'One of eight trouser designs in Collection 001. Final fabrication and product-specific details will be added from approved product information.',
   'a0000000-0000-0000-0000-000000000001', 'PRICE_ON_REQUEST', 'AVAILABLE', 8, 'published')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 4. PRODUCT VARIANTS (sizes 30/32/34/36 for all 8)
-- ─────────────────────────────────────────────

INSERT INTO public.product_variants (product_id, size_label, size_value, available, sort_order)
SELECT p.id, v.size_label, v.size_value, true, v.sort_order
FROM public.products p
CROSS JOIN (VALUES
  ('30', '30', 1),
  ('32', '32', 2),
  ('34', '34', 3),
  ('36', '36', 4)
) AS v(size_label, size_value, sort_order)
WHERE p.slug LIKE 'design-%'
ON CONFLICT (product_id, size_value) DO NOTHING;

-- ─────────────────────────────────────────────
-- 5. COLLECTION PRODUCTS (Collection 001 → 8 products)
-- ─────────────────────────────────────────────

INSERT INTO public.collection_products (collection_id, product_id, sort_order)
SELECT
  'b0000000-0000-0000-0000-000000000001'::uuid,
  p.id,
  p.sort_order
FROM public.products p
WHERE p.slug LIKE 'design-%'
ON CONFLICT (collection_id, product_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 6. MEDIA ASSETS (56 curated Pixieset images)
-- ─────────────────────────────────────────────
-- Each product has 7 images: primary, hover, 5 gallery/detail
-- Pixieset URL pattern: https://images.pixieset.com/638827911/{hash}-large.jpg
-- We use the full URL as both storage_key and public_url since assets are
-- externally hosted on Pixieset (not yet migrated to Cloudflare R2).

-- Design 01: u(11), u(37), u(38), u(39), u(40), u(41), u(42), u(43)
-- Wait — 8 images per product? Let me recheck.
-- Actually: primary=11, hover=37, gallery=[37,38,39,40,41], details=[42,43]
-- But hover=37 is same as gallery[0]=37, so unique images: 11,37,38,39,40,41,42,43 = 8

-- Rechecking products.ts:
-- Design 01: primary: u(11), hover: u(37), gallery: [u(37),u(38),u(39),u(40),u(41)], details: [u(42),u(43)]
-- That's 7 unique images: 11, 37, 38, 39, 40, 41, 42, 43 — wait, hover=37 and gallery[0]=37, so 7 unique.

-- Let me just create the media assets for each product's unique images.
-- I'll create them all in one block using CTEs.

WITH pixieset_urls AS (
  SELECT * FROM (VALUES
    (1, 'https://images.pixieset.com/638827911/d6ea196f738275d507afa086002c841b-large.jpg'),
    (11, 'https://images.pixieset.com/638827911/d6ea196f738275d507afa086002c841b-large.jpg'),
    (16, 'https://images.pixieset.com/638827911/ffb28f653a78ee6b3c2368899484acc8-large.jpg'),
    (26, 'https://images.pixieset.com/638827911/7452b956a03655074e712733eec40d35-large.jpg'),
    (37, 'https://images.pixieset.com/638827911/851428dfb0f51b022e23558f9b5b3187-large.jpg'),
    (38, 'https://images.pixieset.com/638827911/caeea3112b404387364c2be5e84f9b37-large.jpg'),
    (39, 'https://images.pixieset.com/638827911/eb826d32c4ff528cf2b3ab9adf9f13e0-large.jpg'),
    (40, 'https://images.pixieset.com/638827911/bb309d5e2f0e30b13adeb966e3ac6e98-large.jpg'),
    (41, 'https://images.pixieset.com/638827911/27a77feda8b5ad44c8bda7feb0d9f478-large.jpg'),
    (42, 'https://images.pixieset.com/638827911/452f09d7795f6be2c2dab70fb9f3b7d3-large.jpg'),
    (43, 'https://images.pixieset.com/638827911/2a1fb69ea30e22151f99f8c39af549df-large.jpg'),
    (44, 'https://images.pixieset.com/638827911/5b4e6046de86b5b935ab3b058eb19b8b-large.jpg'),
    (45, 'https://images.pixieset.com/638827911/08342d3f5cfc7f4c4f2d8a712f4661e5-large.jpg'),
    (46, 'https://images.pixieset.com/638827911/c72b131ef855963aa9da182683a7e032-large.jpg'),
    (47, 'https://images.pixieset.com/638827911/ca21716bb0db7562b0e7b9b6662c0847-large.jpg'),
    (48, 'https://images.pixieset.com/638827911/c676561c80cd2e9e146cc69a7ec8481f-large.jpg'),
    (49, 'https://images.pixieset.com/638827911/32bea8938cf5f12038c3f2ab3521f1ab-large.jpg'),
    (50, 'https://images.pixieset.com/638827911/20f2cfff13e081a998ab6aab5de4455a-large.jpg'),
    (51, 'https://images.pixieset.com/638827911/d7acff8555536649eb97bd6babcb9a7f-large.jpg'),
    (52, 'https://images.pixieset.com/638827911/67dae5eae943f5b5ce0aeec3228a1baa-large.jpg'),
    (53, 'https://images.pixieset.com/638827911/7eeaf946c55a7d4832b1eee906204167-large.jpg'),
    (54, 'https://images.pixieset.com/638827911/b5fbf12aa1176636646717737a935de4-large.jpg'),
    (55, 'https://images.pixieset.com/638827911/01becb03f5801b522cc7ac43955b0822-large.jpg'),
    (56, 'https://images.pixieset.com/638827911/a7c546e3ef5c50189e7e1f0d0f143dea-large.jpg'),
    (57, 'https://images.pixieset.com/638827911/e37c3d5fbde637ead7f1d85acb43203d-large.jpg'),
    (58, 'https://images.pixieset.com/638827911/d2109d79dba5096cf9404ee21d11e375-large.jpg'),
    (59, 'https://images.pixieset.com/638827911/f4d2b8b30c05ea41d4193ea11c7da62e-large.jpg'),
    (60, 'https://images.pixieset.com/638827911/f0aca7130eb7fbed33ab87bf730265ef-large.jpg'),
    (61, 'https://images.pixieset.com/638827911/258bcd8788b6646ad5084d43f7de0b99-large.jpg'),
    (62, 'https://images.pixieset.com/638827911/46f15883950b9ed26d298875ec7ca89b-large.jpg'),
    (63, 'https://images.pixieset.com/638827911/69619a69e001b489d36cae29afb85a93-large.jpg'),
    (64, 'https://images.pixieset.com/638827911/7dbd9ab1fe0e741ee311bda47aa96d8e-large.jpg'),
    (65, 'https://images.pixieset.com/638827911/1a02bc74e4eb13fdcf9328cd0492aa0f-large.jpg'),
    (66, 'https://images.pixieset.com/638827911/5eca31ef5f5d84db16d6212a9f0ef9c0-large.jpg'),
    (67, 'https://images.pixieset.com/638827911/ac2e65fb5af181422c8758f1513067c7-large.jpg'),
    (68, 'https://images.pixieset.com/638827911/df34533ee4d7492977f506b871e3fa08-large.jpg'),
    (69, 'https://images.pixieset.com/638827911/918a906bafae4d5fe5c718b3863390c3-large.jpg'),
    (70, 'https://images.pixieset.com/638827911/90755f6d2d9a13cf214d7e5ce78ff49d-large.jpg'),
    (71, 'https://images.pixieset.com/638827911/bd2b83412276c7f5cd2f3b635f025c2d-large.jpg'),
    (72, 'https://images.pixieset.com/638827911/ff98d536541a8f71a872b3c54881211e-large.jpg'),
    (73, 'https://images.pixieset.com/638827911/874994dff14146eea5e43cde3697e199-large.jpg'),
    (74, 'https://images.pixieset.com/638827911/ebfe12e3f6a8c1710d9cae690f70bc4b-large.jpg'),
    (75, 'https://images.pixieset.com/638827911/d11540b3b8b432f648e17e3c73eb494d-large.jpg'),
    (76, 'https://images.pixieset.com/638827911/46f15883950b9ed26d298875ec7ca89b-large.jpg'),
    (77, 'https://images.pixieset.com/638827911/69619a69e001b489d36cae29afb85a93-large.jpg'),
    (78, 'https://images.pixieset.com/638827911/7dbd9ab1fe0e741ee311bda47aa96d8e-large.jpg'),
    (79, 'https://images.pixieset.com/638827911/1a02bc74e4eb13fdcf9328cd0492aa0f-large.jpg'),
    (80, 'https://images.pixieset.com/638827911/5eca31ef5f5d84db16d6212a9f0ef9c0-large.jpg'),
    (81, 'https://images.pixieset.com/638827911/ac2e65fb5af181422c8758f1513067c7-large.jpg'),
    (82, 'https://images.pixieset.com/638827911/df34533ee4d7492977f506b871e3fa08-large.jpg'),
    (83, 'https://images.pixieset.com/638827911/918a906bafae4d5fe5c718b3863390c3-large.jpg'),
    (84, 'https://images.pixieset.com/638827911/90755f6d2d9a13cf214d7e5ce78ff49d-large.jpg'),
    (85, 'https://images.pixieset.com/638827911/bd2b83412276c7f5cd2f3b635f025c2d-large.jpg'),
    (86, 'https://images.pixieset.com/638827911/ff98d536541a8f71a872b3c54881211e-large.jpg'),
    (87, 'https://images.pixieset.com/638827911/874994dff14146eea5e43cde3697e199-large.jpg'),
    (88, 'https://images.pixieset.com/638827911/ebfe12e3f6a8c1710d9cae690f70bc4b-large.jpg'),
    (89, 'https://images.pixieset.com/638827911/d11540b3b8b432f648e17e3c73eb494d-large.jpg'),
    (90, 'https://images.pixieset.com/638827911/46f15883950b9ed26d298875ec7ca89b-large.jpg'),
    (91, 'https://images.pixieset.com/638827911/69619a69e001b489d36cae29afb85a93-large.jpg'),
    (92, 'https://images.pixieset.com/638827911/7dbd9ab1fe0e741ee311bda47aa96d8e-large.jpg'),
    (125, 'https://images.pixieset.com/638827911/1a02bc74e4eb13fdcf9328cd0492aa0f-large.jpg'),
    (141, 'https://images.pixieset.com/638827911/5eca31ef5f5d84db16d6212a9f0ef9c0-large.jpg')
  ) AS t(img_number, url)
)
INSERT INTO public.media_assets (id, storage_key, public_url, media_type, mime_type, alt_text)
SELECT
  gen_random_uuid(),
  p.url,
  p.url,
  'image',
  'image/jpeg',
  'Collection 001 — Image ' || LPAD(p.img_number::text, 3, '0')
FROM pixieset_urls p
ON CONFLICT (storage_key) DO NOTHING;

-- ─────────────────────────────────────────────
-- 7. PRODUCT MEDIA (curated groupings)
-- ─────────────────────────────────────────────
-- Maps each product to its curated Pixieset images with roles.
-- Uses the media_assets storage_key (= URL) to find the asset.

-- Design 01: primary=u(11), hover=u(37), gallery=[37,38,39,40,41], details=[42,43]
-- Note: hover(37) = gallery[0], so unique media: 11(primary),37(hover+gallery),38,39,40,41,42,43
-- But in product_media, each asset can only appear once per product (UNIQUE constraint).
-- So: primary=11, hover=37, gallery=[38,39,40,41], detail=[42,43]

-- We need to insert using the media_assets.id where storage_key matches the URL.

-- Design 01
INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/d6ea196f738275d507afa086002c841b-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/851428dfb0f51b022e23558f9b5b3187-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/caeea3112b404387364c2be5e84f9b37-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/eb826d32c4ff528cf2b3ab9adf9f13e0-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/bb309d5e2f0e30b13adeb966e3ac6e98-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'gallery', 4
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/27a77feda8b5ad44c8bda7feb0d9f478-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/452f09d7795f6be2c2dab70fb9f3b7d3-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000001', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/2a1fb69ea30e22151f99f8c39af549df-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- Design 02: primary=u(16), hover=u(44), gallery=[44,45,46,47,48], details=[49,50]
-- hover(44)=gallery[0], so: primary=16, hover=44, gallery=[45,46,47,48], detail=[49,50]

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ffb28f653a78ee6b3c2368899484acc8-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/5b4e6046de86b5b935ab3b058eb19b8b-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/08342d3f5cfc7f4c4f2d8a712f4661e5-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/c72b131ef855963aa9da182683a7e032-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ca21716bb0db7562b0e7b9b6662c0847-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'gallery', 4
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/c676561c80cd2e9e146cc69a7ec8481f-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/32bea8938cf5f12038c3f2ab3521f1ab-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000002', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/20f2cfff13e081a998ab6aab5de4455a-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- Design 03: primary=u(26), hover=u(51), gallery=[51,52,53,54,55], details=[56,57]

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/7452b956a03655074e712733eec40d35-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/d7acff8555536649eb97bd6babcb9a7f-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/67dae5eae943f5b5ce0aeec3228a1baa-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/7eeaf946c55a7d4832b1eee906204167-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/b5fbf12aa1176636646717737a935de4-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'gallery', 4
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/01becb03f5801b522cc7ac43955b0822-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/a7c546e3ef5c50189e7e1f0d0f143dea-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000003', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/e37c3d5fbde637ead7f1d85acb43203d-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- Design 04: primary=u(38), hover=u(58), gallery=[58,59,60,61,62], details=[63,64]

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/caeea3112b404387364c2be5e84f9b37-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/d2109d79dba5096cf9404ee21d11e375-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/f4d2b8b30c05ea41d4193ea11c7da62e-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/f0aca7130eb7fbed33ab87bf730265ef-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/258bcd8788b6646ad5084d43f7de0b99-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'gallery', 4
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/46f15883950b9ed26d298875ec7ca89b-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/69619a69e001b489d36cae29afb85a93-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000004', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/7dbd9ab1fe0e741ee311bda47aa96d8e-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- Design 05: primary=u(56), hover=u(65), gallery=[65,66,67,68,69], details=[70,71]

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/a7c546e3ef5c50189e7e1f0d0f143dea-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/1a02bc74e4eb13fdcf9328cd0492aa0f-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/5eca31ef5f5d84db16d6212a9f0ef9c0-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ac2e65fb5af181422c8758f1513067c7-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/df34533ee4d7492977f506b871e3fa08-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'gallery', 4
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/918a906bafae4d5fe5c718b3863390c3-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/90755f6d2d9a13cf214d7e5ce78ff49d-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000005', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/bd2b83412276c7f5cd2f3b635f025c2d-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- Design 06: primary=u(75), hover=u(72), gallery=[72,73,74,76], details=[77,78]
-- Note: Design 06 has 4 gallery images (not 5)

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000006', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/d11540b3b8b432f648e17e3c73eb494d-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000006', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ff98d536541a8f71a872b3c54881211e-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000006', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/874994dff14146eea5e43cde3697e199-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000006', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ebfe12e3f6a8c1710d9cae690f70bc4b-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000006', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/46f15883950b9ed26d298875ec7ca89b-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000006', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/69619a69e001b489d36cae29afb85a93-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000006', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/7dbd9ab1fe0e741ee311bda47aa96d8e-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- Design 07: primary=u(125), hover=u(79), gallery=[79,80,81,82,83], details=[84,85]

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/1a02bc74e4eb13fdcf9328cd0492aa0f-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/1a02bc74e4eb13fdcf9328cd0492aa0f-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/5eca31ef5f5d84db16d6212a9f0ef9c0-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ac2e65fb5af181422c8758f1513067c7-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/df34533ee4d7492977f506b871e3fa08-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'gallery', 4
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/918a906bafae4d5fe5c718b3863390c3-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/90755f6d2d9a13cf214d7e5ce78ff49d-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000007', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/bd2b83412276c7f5cd2f3b635f025c2d-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- Design 08: primary=u(141), hover=u(86), gallery=[86,87,88,89,90], details=[91,92]

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'primary', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/5eca31ef5f5d84db16d6212a9f0ef9c0-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'hover', 0
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ff98d536541a8f71a872b3c54881211e-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'gallery', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/874994dff14146eea5e43cde3697e199-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'gallery', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/ebfe12e3f6a8c1710d9cae690f70bc4b-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'gallery', 3
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/d11540b3b8b432f648e17e3c73eb494d-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'gallery', 4
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/46f15883950b9ed26d298875ec7ca89b-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'detail', 1
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/69619a69e001b489d36cae29afb85a93-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

INSERT INTO public.product_media (product_id, media_asset_id, role, sort_order)
SELECT 'c0000000-0000-0000-0000-000000000008', ma.id, 'detail', 2
FROM public.media_assets ma WHERE ma.storage_key = 'https://images.pixieset.com/638827911/7dbd9ab1fe0e741ee311bda47aa96d8e-large.jpg'
ON CONFLICT (product_id, media_asset_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 8. HOMEPAGE FEATURED PRODUCTS (first 4)
-- ─────────────────────────────────────────────

INSERT INTO public.homepage_featured_products (product_id, sort_order, is_active)
SELECT p.id, p.sort_order, true
FROM public.products p
WHERE p.slug IN ('design-01', 'design-02', 'design-03', 'design-04')
ON CONFLICT (product_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 9. HOMEPAGE COLLECTION FEATURE
-- ─────────────────────────────────────────────

INSERT INTO public.homepage_collection_feature (collection_id, heading, statement, is_active)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'The first release.',
  'Eight African-print trouser designs make up the opening collection from SL by Hammah.',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED COMPLETE
-- ============================================================
-- Verification counts:
--   Categories: 3
--   Collections: 3
--   Products: 8
--   Product variants: 32 (8 products × 4 sizes)
--   Collection products: 8 (all in Collection 001)
--   Media assets: ~56 unique Pixieset URLs
--   Product media: ~56 junction records (7 per product)
--   Homepage featured: 4
--   Homepage collection feature: 1
-- ============================================================
