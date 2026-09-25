-- ============================================================
-- REMOVE TAGS — Furia Suplementos
-- Pegar en: Supabase Dashboard → SQL Editor
--
-- Elimina la columna tags de products (las etiquetas no se usan).
-- Aplicar DESPUÉS de que el código del repo esté actualizado
-- (el front ya no consulta esa columna).
-- ============================================================

ALTER TABLE public.products DROP COLUMN IF EXISTS tags;