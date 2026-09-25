-- ============================================================
-- SEED DATA — Furia Suplementos
-- Pegar en: Supabase Dashboard → SQL Editor (corre como owner postgres)
--
-- Orden sugerido: 1) seed.sql → 2) enable_rls.sql
-- (el owner bypassa RLS, pero si el seed falla a medias conviene
-- que RLS aún no esté activa para poder depurar)
-- ============================================================

-- ------------------------------------------------------------
-- CATEGORÍAS (ids deterministas para FK legibles)
-- ------------------------------------------------------------
INSERT INTO public.categories (id, name, slug) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Proteínas',   'proteinas'),
  ('00000000-0000-4000-8000-000000000002', 'Creatina',    'creatina'),
  ('00000000-0000-4000-8000-000000000003', 'Pre-Entrenos','pre-entrenos'),
  ('00000000-0000-4000-8000-000000000004', 'Vitaminas',   'vitaminas'),
  ('00000000-0000-4000-8000-000000000005', 'Otras',       'otras');

-- ------------------------------------------------------------
-- PRODUCTOS  (image_url vacío → la app muestra "Sin imagen")
-- Los nombres son únicos → slugify() no colisiona
-- ------------------------------------------------------------
INSERT INTO public.products (id, category_id, name, brand, description, nutritional_info, image_url, is_active) VALUES
  (
    '00000000-0000-4000-8000-000000000011',
    '00000000-0000-4000-8000-000000000001',
    'Whey Protein',
    'Optimum Nutrition',
    'Proteína de suero de leche de rápida absorción. Ideal post-entrenamiento para la recuperación y el mantenimiento de masa muscular. Mezcla fácil con agua, leche o licuados.',
    '{"Porcion": "30 g", "Proteinas": "24 g", "Carbohidratos": "3 g", "Grasas": "1.5 g"}'::jsonb,
    '',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    '00000000-0000-4000-8000-000000000002',
    'Creatina Monohidratada',
    'Universal Nutrition',
    'Creatina monohidratada micronizada para aumentar fuerza, potencia y volumen de entrenamiento. Sin sabor, se disuelve en cualquier bebida.',
    '{"Porcion": "5 g", "Creatina": "5 g", "Carbohidratos": "0 g", "Energia": "0 kcal"}'::jsonb,
    '',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000013',
    '00000000-0000-4000-8000-000000000003',
    'Pre-Workout',
    'Cellucor',
    'Pre-entreno energizante con cafeína, beta-alanina y citrulina para mejorar el rendimiento, la concentración y el bombeo muscular durante la sesión.',
    '{"Porcion": "10 g", "Cafeina": "200 mg", "Beta-alanina": "3.2 g", "Citrulina": "6 g"}'::jsonb,
    '',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000014',
    '00000000-0000-4000-8000-000000000004',
    'Multivitamínico',
    'Nutrilab',
    'Complejo multivitamínico y mineral para cubrir requerimientos diarios. Aporta vitamina D, B12, zinc y magnesio.',
    NULL,
    '',
    true
  );

-- ------------------------------------------------------------
-- VARIANTES  (cada producto necesita ≥1 con precio y stock)
-- ------------------------------------------------------------
INSERT INTO public.product_variants (id, product_id, flavor, weight_size, price, stock, is_available) VALUES
  -- Whey Protein
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000011', 'Chocolate', '1 kg',  58900, 15, true),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000011', 'Vainilla',  '1 kg',  58900, 12, true),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000011', 'Chocolate', '2 kg', 108000,  8, true),
  -- Creatina
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000012', 'Sin sabor', '300 g', 38900, 20, true),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000012', 'Sin sabor', '500 g', 58000, 12, true),
  -- Pre-Workout
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000013', 'Frutos Rojos', '300 g', 48500, 10, true),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000013', 'Limón',       '300 g', 48500,  7, true),
  -- Multivitamínico (variante agotada → sirve para probar el badge "sin stock")
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000014', 'Única', '60 comprimidos', 26900, 25, true),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000014', 'Única', '120 comprimidos', 43900,  0, false);

-- ------------------------------------------------------------
-- STORE SETTINGS  (la app lee la única fila: .limit(1).maybeSingle())
-- ------------------------------------------------------------
INSERT INTO public.store_settings (id, whatsapp_number, welcome_message, delivery_info) VALUES
  (1, '542615939115', '¡Hola! Te preparamos tu pedido de Furia Suplementos.', 'Hacemos envíos a todo el país. CABA y GBA sin cargo de demora. Consultá disponibilidad para el resto.');