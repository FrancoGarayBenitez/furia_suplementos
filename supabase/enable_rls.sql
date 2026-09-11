-- ============================================================
-- RLS — Furia Suplementos
-- Pegar en: Supabase Dashboard → SQL Editor
-- Después de: seed.sql  (opcional pero recomendado)
--
-- ¿Qué hace? Sin RLS la anon key (pública, viaja en el bundle JS)
-- permite a CUALQUIER persona INSERT/UPDATE/DELETE por la API REST.
-- RLS hace que la DB rechace accesos según el rol del request:
--   - visitante sin sesión  → rol `anon`          → solo SELECT público
--   - admin logueado        → rol `authenticated` → puede escribir
--
-- USING   = qué filas ves/tocas    (SELECT, UPDATE, DELETE)
-- WITH CHECK = qué valores podés escribir (INSERT, UPDATE)
--
-- Idempotente: se puede re-ejecutar sin errores.
-- ============================================================

-- ------------------------------------------------------------
-- 1) ACTIVAR RLS en las tablas
-- ------------------------------------------------------------
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings   ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2) CATEGORIES
--    SELECT: público (cualquiera lee el catálogo)
--    ESCRITURA: solo authenticated (admin en el dashboard)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Categories public select" ON public.categories;
CREATE POLICY "Categories public select"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Categories auth insert" ON public.categories;
CREATE POLICY "Categories auth insert"
  ON public.categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Categories auth update" ON public.categories;
CREATE POLICY "Categories auth update"
  ON public.categories FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Categories auth delete" ON public.categories;
CREATE POLICY "Categories auth delete"
  ON public.categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 3) PRODUCTS
--    SELECT: público (la app ya filtra is_active server-side)
--    ESCRITURA: solo authenticated
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Products public select" ON public.products;
CREATE POLICY "Products public select"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Products auth insert" ON public.products;
CREATE POLICY "Products auth insert"
  ON public.products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Products auth update" ON public.products;
CREATE POLICY "Products auth update"
  ON public.products FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Products auth delete" ON public.products;
CREATE POLICY "Products auth delete"
  ON public.products FOR DELETE
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 4) PRODUCT_VARIANTS  (mismo esquema que products)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Variants public select" ON public.product_variants;
CREATE POLICY "Variants public select"
  ON public.product_variants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Variants auth insert" ON public.product_variants;
CREATE POLICY "Variants auth insert"
  ON public.product_variants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Variants auth update" ON public.product_variants;
CREATE POLICY "Variants auth update"
  ON public.product_variants FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Variants auth delete" ON public.product_variants;
CREATE POLICY "Variants auth delete"
  ON public.product_variants FOR DELETE
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 5) STORE_SETTINGS
--    SELECT: público (el número de WhatsApp va en el footer público)
--    ESCRITURA: solo authenticated
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Settings public select" ON public.store_settings;
CREATE POLICY "Settings public select"
  ON public.store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Settings auth insert" ON public.store_settings;
CREATE POLICY "Settings auth insert"
  ON public.store_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Settings auth update" ON public.store_settings;
CREATE POLICY "Settings auth update"
  ON public.store_settings FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Settings auth delete" ON public.store_settings;
CREATE POLICY "Settings auth delete"
  ON public.store_settings FOR DELETE
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 6) STORAGE — bucket `product-images`
--    SELECT: público (las imágenes se sirven por URL pública)
--    INSERT/UPDATE/DELETE: solo authenticated (admin sube fotos)
--    Nota: la política usa bucket_id, no el nombre de una tabla
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
CREATE POLICY "Product images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Product images auth insert" ON storage.objects;
CREATE POLICY "Product images auth insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Product images auth update" ON storage.objects;
CREATE POLICY "Product images auth update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Product images auth delete" ON storage.objects;
CREATE POLICY "Product images auth delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ============================================================
-- 7) GRANTs de rol (CAPA 1 vs la capa RLS)
--
-- RLS filtra FILAS, pero el rol primero necesita permiso de TABLA.
-- PostgREST conecta como rol `anon` (sin sesión) o `authenticated`
-- (con JWT). Sin GRANT, da 401 "permission denied" incluso con
-- políticas RLS creadas.
--
--   anon          → solo SELECT (storefront público)
--   authenticated → SELECT + INSERT/UPDATE/DELETE (admin CRUD)
--
-- Idempotente: GRANT se re-ejecuta sin error.
-- ============================================================

-- SELECT (lectura pública + admin)
GRANT SELECT ON public.categories       TO anon, authenticated;
GRANT SELECT ON public.products         TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.store_settings   TO anon, authenticated;

-- ESCRITURA (solo admin autenticado)
GRANT INSERT, UPDATE, DELETE ON public.categories       TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products         TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_settings   TO authenticated;