# PROGRESS.md — Furia Suplementos

## Contexto
E-commerce tipo catálogo digital ("Mobile First") de suplementos deportivos. Stack: **Next.js 16 + React 19 + TypeScript**, Tailwind v4 + **Shadcn UI (base-ui)**, Zustand, Supabase (PostgreSQL/Auth/Storage). Despliegue: Vercel + Supabase. **Sin pago on-site** — carrito local → pedido formateado a WhatsApp.

## Variables env (`.env.local`, ya presentes)
- `NEXT_PUBLIC_SUPABASE_URL=https://sxqmfludltyjnifjngld.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aXaiIuMvQNbuBMBp1ykNug_APgDFzuT`
- `NEXT_PUBLIC_SITE_URL` — **PENDIENTE**: no está seteado. `metadataBase` cae en `http://localhost:3000`; hay que definirlo antes del deploy para que la URL absoluta del OG no resuelva a localhost.

## DB Supabase (con datos)
- `categories`: id(uuid), name, slug
- `products`: id, category_id(fk), name, brand, description, nutritional_info(jsonb), image_url, is_active
- `product_variants`: id, product_id(fk), flavor, weight_size, price(numeric), stock(int), is_available
- `store_settings`: id(int), whatsapp_number, welcome_message, delivery_info
- **Storage bucket**: `product-images` (lectura pública, escritura autenticada)
- **RLS ACTIVA + GRANTs** en las 4 tablas y bucket (sección 7 de `enable_rls.sql`). Seed aplicado (categorías/productos/variantes/settings). Admin user creado vía Auth panel (`admin@furia.com`).

**IMPORTANTE schema gap**: `products` NO tiene columna `slug`. Las URLs usan `slugify(name)` derivado en runtime (➜ refactor pendiente).

## Decisions claves (crítico)
- **Shadcn UI v4 usa `@base-ui/react`** (NO Radix). APIs base-ui: `value`/`onValueChange` (Select, checkbox), `checked`/`onCheckedChange` (Switch), `open`/`onOpenChange` (Dialog/Sheet), componente `render` en vez de `asChild` (Button+Link).
- **Next 16**: `middleware.ts` está deprecado → renombrado a **`proxy.ts`** (Node runtime). Proxy = check optimista; autorización REAL en capa de datos (layout `getUser()`).
- En `layout.tsx`: `LayoutProps<"/">` global (no importable). Solo compila vía `next build`/`next dev` (genera `.next/types`); `tsc --noEmit` standalone falla si falta `.next/types`.
- Supabase clients SIN generic `Database` (las relaciones collapseaban a `never`). Queries con relaciones usan casts explícitos a `ProductDetail`.
- Tipos de DB definidos en `src/types/index.ts`.

## Estructura actual
```
src/
├── proxy.ts                  # Protege /admin/* (getUser real) → /login
├── app/
│   ├── layout.tsx, globals.css (tokens shadcn v4 + brand Cobre)
│   ├── icon.png               # Favicon 512×512 (recorte de la llama)
│   ├── (storefront)/
│   │   ├── layout.tsx         # Header/footer, CartProvider, Toaster, fetch store_settings
│   │   ├── page.tsx           # Home SSR: hero CSS-only + search?=category? filtros
│   │   ├── opengraph-image.tsx# OG 1200×630 con ImageResponse (logo real embebido)
│   │   └── product/[slug]/page.tsx  # Ficha SSR + metadata OG
│   ├── (auth)/login/page.tsx # /login público (client, fuera de admin/)
│   └── admin/
│       ├── layout.tsx        # getUser → redirect si no auth, logout
│       └── dashboard/page.tsx # Tabla productos + CRUD
├── components/
│   ├── ui/ (shadcn: button,input,badge,card,dialog,select,switch,label,sheet,tabs,table,sonner,textarea,avatar,dropdown-menu,separator)
│   ├── storefront/ (ProductCard, SearchBar, CategoryFilter, TagFilter, VariantSelector, CartProvider)
│   └── admin/ (ProductForm, VariantManager, StockToggle, DeleteProductButton, AdminLogoutButton)
├── lib/
│   ├── utils.ts              # cn(), slugify()
│   ├── store/useCartStore.ts # Zustand persist "furia-cart"
│   ├── utils/whatsapp.ts     # buildOrderMessage, buildWhatsAppUrl, formatPrice
│   └── supabase/{client,server}.ts
└── types/index.ts
```

## Completado (Fases 0–5)
- **F0**: shadcn init + 16 componentes, cn(), Supabase clients, tipos DB, proxy.ts
- **F1**: layout storefront, Home SSR con filtros (search/category URL), ProductCard, SearchBar, CategoryFilter
- **F2**: ficha product `[slug]` SSR + generateMetadata OG, VariantSelector (sabor/peso → precio/stock)
- **F3**: useCartStore Zustand, WhatsApp util, CartProvider (drawer, total, envío wa.me)
- **F4**: login email+pass, admin layout getUser, logout
- **F5**: dashboard productos, ProductForm (upload imagen bucket), VariantManager, StockToggle, DeleteProductButton

CI verde: `npx eslint src/`, `npx tsc --noEmit`, `npx next build` (rutas: `/`, `/login`, `/product/[slug]`, `/admin/dashboard`, proxy).

### Fix loop 307 en admin
El login vivía en `src/app/admin/login/` → `admin/layout.tsx` lo envolvía y `redirect("/admin/login")` ciclaba en 307 al no haber sesión. Fix: mudado a `src/app/(auth)/login/page.tsx` (rute group → URL `/login`, fuera del árbol protegido). `proxy.ts` simplificado (todo `/admin/*` protegido, destino `/login`), `AdminLogoutButton` → `/login`. Build muestra `/login` estático y `/admin/dashboard` dinámico. ⚠️ el re-login rompe los bookmarks de `/admin/login` (viejos 307 → ahora 404/redirect).

## Completado (Fase 6 — RLS + Seed)
Archivos:
- `supabase/seed.sql` — 5 categorías, 4 productos (Whey, Creatina, Pre-Workout, Multivitamínico), variantes con precios ARS/stock (una agotada a propósito), `store_settings id=1` whatsapp `542615939115`. IDs deterministas …-001 …-109 (FK legibles). `image_url` vacío → placeholder "Sin imagen".
- `supabase/enable_rls.sql` — idempotente: RLS ON en 4 tablas + SELECT público + escritura solo `authenticated`; storage bucket `product-images` SELECT público, INSERT/UPDATE/DELETE autenticado. Incluye **sección 7: GRANTs** (anon SELECT; authenticated SELECT + INSERT/UPDATE/DELETE).
- `src/app/layout.tsx` — metadata "Furia Suplementos" + `lang="es"`.
- `next.config.ts` — `allowedDevOrigins: ['192.168.2.201']` (CORS LAN dev).

**Ejecutado por el usuario en Supabase Dashboard:** seed + RLS + GRANTs aplicados sin errores; `admin@furia.com` creado en Authentication → Users.

### Fix POST-seed (aplicado)
Síntoma: seed + RLS OK pero el home no mostraba productos. Causa: **401 "permission denied for table"** — rol `anon`/`authenticated` sin GRANT de tabla (capas GRANT ≠ RLS; el error se enmascaraba por `if (!data) return null`). Fix: GRANTs anexados a `enable_rls.sql` + logs de error en `(storefront)/page.tsx`, `(storefront)/layout.tsx` y `product/[slug]/page.tsx` (`const { data, error }` + `console.error`).

### Testing CRUD — resultados y fixes (POST-Fase 6)
Checklist manual ejecutado (con seed + RLS + GRANTs activos):
1. Home lista SSR con seed visible ✔ (valida SELECT público)
2. Login `/login` → `/admin/dashboard` ✔ (sin loop 307)
3. Ficha `/product/[slug]` + VariantSelector ➜ falta confirmar filtros y carrito (abajo)
4. Carrito → WhatsApp hacia `wa.me/542615939115` ➜ falta end-to-end
5. **Crear producto**: sin imagen/variantes → *antes guardaba igual*; con el fix, **bloqueado con mensaje de error** ✔
6. **Crear completo** (imagen + variantes) ✔
7. **Editar** ✔ — bug: el select mostraba el **id** en vez del nombre (fix abajo)
8. **Toggle activo/inactivo** ✔ (desaparece/reaparece en `/`)
9. **Eliminar** ✔
10. **Seguridad**: sin login, DELETE vía devtools → ➜ falta el test positivo (debe fallar con 401/403)

Bugs encontrados y corregidos durante el testing:
- **Select de categoría renderizaba el id** (`ProductForm.tsx`) → fix: `<SelectValue>` con **render-prop** `(value) => categories.find(c => c.id === value)?.name ?? ""`. Causa raíz: `Select.Value` de base-ui resuelve el label desde `items` del store; sin `items`, cae a `serializeValue(value)` (muestra el valor crudo).
- **Sin validación al crear** (`ProductForm.tsx`) → `handleSave` ahora valida: nombre obligatorio, categoría obligatoria, ≥1 variante real (filas vacías filtradas vía `cleanedVariants`), toda variante con precio > 0. `saveVariants(supabase, id, items)` recibe el array limpio (no persiste filas fantasma).
- **Dashboard sin visibilidad de variantes** (`dashboard/page.tsx`) → columna "Variantes" ahora `N variantes · X disponibles · stock Y`.
- **Warning Base UI `nativeButton`** (`dashboard/page.tsx`) → botón "Ver" usa `nativeButton={false}` (su `render` es un `<a>`/Link, no un `<button>` nativo).

CI verde tras cada cambio: `npx eslint src/`, `npx next build`.

### Desglose de stock por variante en dashboard
El "stock Y" de la columna Variantes es el total **solo de variantes activas** (`is_available && stock > 0`, coincide con el contador "disponibles"). Si se quiere el stock individual por variante (ej: "Chocolate 1kg: 15 / Vainilla 1kg: 12") habría que expandir la fila o tooltip — sin decidir.

### Imágenes por variante (pendiente de decisión)
Hoy 1 imagen por producto (`products.image_url`), compartida por todas sus variantes. Opciones:
- **A (recomendado)**: mantener 1 imagen por producto — suficiente para suplementos.
- **B**: columna `image_url` en `product_variants` (nullable, fallback a la del producto). Migración + seed + VariantManager + VariantSelector + ficha + cart.

### Tests manuales que faltan
- Filtros search/category en `/`.
- Carrito → WhatsApp end-to-end (`wa.me/542615939115`).
- **Seguridad (RLS)**: sin login, DELETE/INSERT vía devtools en `products` → debe fallar 401/403 (rol anon sin GRANT de escritura).

## Completado (Fase 7 — Rediseño visual Dark Cobre)

Rediseño completo mobile-first con estética **Dark Premium Cobre/Titanio**. Sin cambios de lógica de negocio: mismas queries Supabase, mismo `useCartStore`, mismo checkout `wa.me`.

### Decisiones de diseño (acordadas)
- **Dark-only**: `<html class="dark">`, `colorScheme: "dark"`, `themeColor: #09090B`. La paleta de `:root` (light) queda inerte como shadcn lo requiere.
- **Semántica de color**: cobre = branding/navegación/links · **naranja `#FF5500` = agregar al carrito** · **verde `#22C55E` = WhatsApp/carrito**. Antes el botón de compra era verde (confundía "Comprar" con "Contactar").
- Se mantiene Geist; **no** se migra a `next/image` (se conserva `<img>` + `eslint-disable`).
- `ProductCard` sigue siendo **Server Component** y todo el card es un `Link`; el CTA "Ver opciones" es un `span` (nunca un botón anidado).
- **Hero CSS-only** (glows + grilla + noise). `images/imagen_marca.jpg` **no** es un hero (es el mismo logo sobre negro) → queda sin usar, no se borra.
- **OG dinámico** vía `ImageResponse`, no asset estático.

### Paleta (tokens en `globals.css`)
Brand: `--color-ink #09090B`, `--color-ink-soft #0C0C0E`, `--color-titanium-2 #141417`, `--color-titanium-3 #1C1C21`, escala `--color-copper-{200,300,400,500,600,700}`, `--color-ember`, `--color-neon`, `--color-neon-soft`, `--color-lime`.
Shadcn: `--primary #D4A373`, `--accent #FF5500`, `--ring #C88A58`, `--secondary #EFD4B8`, borders `white/8` e inputs `white/10`.
Utilidades nuevas: `glass`, `glass-panel`, `glow-copper`, `glow-ember`, `text-gradient-copper`, `grid-overlay`, `noise`, `no-scrollbar`, `skeleton`.

### Archivos tocados
- `src/app/globals.css` — reescrito: tokens brand + shadcn, base dark, utilidades.
- `src/app/layout.tsx` — `class="dark"`, `viewport` tipado, `metadataBase`.
- `src/app/icon.png` — **nuevo**: favicon 512×512 recortado de la llama.
- `src/app/(storefront)/layout.tsx` — navbar glass `h-16` con logo, footer con logo completo, `<Toaster />` montado.
- `src/app/(storefront)/page.tsx` — hero CSS-only + catálogo responsive.
- `src/app/(storefront)/product/[slug]/page.tsx` — breadcrumb, 2 columnas con imagen sticky, badges de stock, descripción, tabla nutricional.
- `src/app/(storefront)/opengraph-image.tsx` — **nuevo**: 1200×630, lee `public/brand/logo.png`.
- `src/components/storefront/ProductCard.tsx`, `SearchBar.tsx`, `CategoryFilter.tsx`, `VariantSelector.tsx` (pills en lugar de `Select`, CTA desktop + barra sticky móvil), `CartProvider.tsx` (drawer derecho, steppers, inputs opcionales).
- `src/components/ui/button.tsx` (+ variantes `copper|ember|neon`, tamaño `xl`), `badge.tsx` (+ `success|warning|muted`), `sonner.tsx` (theme fijo dark, sin `next-themes`).

### Assets de marca
- `public/brand/logo.png` — logo oficial `1600×1139` transparente (llama + wordmark gótico + tagline).
- `public/brand/logo-lockup.png` — **derivado generado** para navbar (recorte sin tagline). ⚠️ generado por análisis de píxeles, **no verificado visualmente**.
- `src/app/icon.png` — recorte 512×512 de la llama. ⚠️ también sin verificación visual.
- El logo original es **claro**: sobre superficies oscuras gana contraste. Solo usarlo con `drop-shadow` cobre, nunca con texto al lado.

### Bugs corregidos en esta fase
- `img src` de `ImageResponse` no acepta `Buffer` con el tipo nuevo de Node (`NonSharedBuffer` no asignable a `Blob`) → se pasa el PNG como data URI base64.
- `next build` advertía `metadataBase` no seteado (la URL del OG resolvía a localhost) → agregado con fallback a `NEXT_PUBLIC_SITE_URL`.
- `Toaster` no estaba montado en ningún lado → los toasts de `VariantSelector` no se veían. Montado en `(storefront)/layout.tsx`.
- `sonner.tsx` usaba `useTheme()` de `next-themes` sin `ThemeProvider` en el árbol → ahora `theme="dark"` fijo.
- `VariantSelector` usaba `selectedVariant!` (non-null assertion) →derivado a `price`/`stock` opcionales.

### Contraste (WCAG 2.1, verificado con script propio)
Los 15 pares principales dan **≥ 4.5:1 (AA)**: cobre/ink 8.80:1 · ink/cobre 8.64:1 · ink/ember 6.10:1 · ink/neon 8.58:1 · muted/titanium 7.17:1 · foreground/titanium 17.61:1 · destructive/ink 5.29:1. Sin colores light hardcodeados remanentes (solo overlays `white/5-10` sobre superficie oscura, correctos).

CI verde: `npx eslint src/` (0 errores, 0 warnings) y `npx next build`. Rutas generadas: `/`, `/product/[slug]`, `/icon.png`, `/opengraph-image-utz4wr`, `/login`, `/admin/dashboard`.

## Pendiente
### Fase 6b — Deploy (diferido, luego del testing manual)
1. Commit → repo GitHub (web; no hay `gh` ni `vercel` CLI instalados) → push.
2. Import en Vercel → copiar `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` → deploy.
3. **Setear `NEXT_PUBLIC_SITE_URL`** con el dominio real (para la URL absoluta del OG).
4. Verificar flujo completo en prod (login admin, upload imagen, pedido WhatsApp).

### Verificación visual pendiente
- Inspeccionar a ojo `public/brand/logo-lockup.png` y `src/app/icon.png` (recortes generados por script, nunca vistos).
- Smoke test del hero, barra sticky de compra en móvil, drawer del carrito y del OG renderizado.

### Próximos posibles (post-testing)
- **slug en products**: hoy `slugify(name)` en runtime; si 2 productos comparten nombre colisionan. Ideal: columna `slug` única.
- **DeleteProductButton no borra la imagen del bucket** → archivos huérfanos (deuda conocida, no bloqueante).
- **Admin edit de store_settings/categorías**: no hay UI; hoy solo seed/consulta directa.

### Decisión tomada: se mantienen los UUID
PK/FK quedan como **uuid** (globalmente únicos, no enumerables vía REST, nativos de Postgres; `gen_random_uuid()`). El largo no impacta en UX: las URLs públicas usan `slug`, el uuid solo viaja en carrito/queries. Los ids legibles del seed (…-001) son conveniencia del demo, no producción.

### Etiquetas (tags) eliminadas
Ninguna referencia queda en el sistema: columna `products.tags` dropeada (`supabase/remove_tags.sql` — pegarlo en SQL Editor), seed sin `tags`, `TagFilter.tsx` borrado, filtro `?tag=` fuera del home, badges de ficha eliminados, input "Etiquetas" fuera del ProductForm, tipo `tags` removido de `src/types/index.ts`.

## Comandos
- Dev: `npm run dev`
- Lint: `npx eslint src/`
- Typecheck: `npx tsc --noEmit` (requiere `.next/types` previo via build)
- Build: `npx next build`