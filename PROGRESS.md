# PROGRESS.md — Furia Suplementos

## Contexto
E-commerce tipo catálogo digital ("Mobile First") de suplementos deportivos. Stack: **Next.js 16 + React 19 + TypeScript**, Tailwind v4 + **Shadcn UI (base-ui)**, Zustand, Supabase (PostgreSQL/Auth/Storage). Despliegue: Vercel + Supabase. **Sin pago on-site** — carrito local → pedido formateado a WhatsApp.

## Variables env (`.env.local`, ya presentes)
- `NEXT_PUBLIC_SUPABASE_URL=https://sxqmfludltyjnifjngld.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aXaiIuMvQNbuBMBp1ykNug_APgDFzuT`

## DB Supabase (tablas ya creadas, vacías)
- `categories`: id(uuid), name, slug
- `products`: id, category_id(fk), name, brand, description, nutritional_info(jsonb), tags(text[]), image_url, is_active
- `product_variants`: id, product_id(fk), flavor, weight_size, price(numeric), stock(int), is_available
- `store_settings`: id(int), whatsapp_number, welcome_message, delivery_info
- **Storage bucket**: `product-images` (lectura pública, escritura autenticada)
- **No RLS creada aún** — validar antes de deploy

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
│   ├── layout.tsx, globals.css (CSS vars shadcn v4)
│   ├── (storefront)/
│   │   ├── layout.tsx        # Header/footer, CartProvider, fetch store_settings
│   │   ├── page.tsx          # Home SSR: search?=category?=tag filtros
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
- **F1**: layout storefront, Home SSR con filtros (search/category/tag URL), ProductCard, SearchBar, CategoryFilter, TagFilter
- **F2**: ficha product `[slug]` SSR + generateMetadata OG, VariantSelector (sabor/peso → precio/stock)
- **F3**: useCartStore Zustand, WhatsApp util, CartProvider (drawer, total, envío wa.me)
- **F4**: login email+pass, admin layout getUser, logout
- **F5**: dashboard productos, ProductForm (upload imagen bucket), VariantManager, StockToggle, DeleteProductButton

CI verde: `npx eslint src/`, `npx tsc --noEmit`, `npx next build` (rutas: `/`, `/login`, `/product/[slug]`, `/admin/dashboard`, proxy).

### Fix loop 307 en admin
El login vivía en `src/app/admin/login/` → `admin/layout.tsx` lo envolvía y `redirect("/admin/login")` ciclaba en 307 al no haber sesión. Fix: mudado a `src/app/(auth)/login/page.tsx` (rute group → URL `/login`, fuera del árbol protegido). `proxy.ts` simplificado (todo `/admin/*` protegido, destino `/login`), `AdminLogoutButton` → `/login`. Build muestra `/login` estático y `/admin/dashboard` dinámico. ⚠️ el re-login rompe los bookmarks de `/admin/login` (viejos 307 → ahora 404/redirect).

## Completado (Fase 6 — RLS + Seed, parcial)
**Deploy queda FUERA de alcance por ahora** — primero testing manual.

Archivos nuevos:
- `supabase/seed.sql` — 5 categorías, 4 productos (Whey, Creatina, Pre-Workout, Multivitamínico), variantes con precios ARS/stock (una agotada a propósito), `store_settings id=1` whatsapp `542615939115`. IDs deterministas …-001 …-109 (FK legibles). `image_url` vacío → placeholder "Sin imagen".
- `supabase/enable_rls.sql` — idempotente: RLS ON en 4 tablas + SELECT público + escritura solo `authenticated`; storage bucket `product-images` SELECT público, INSERT/UPDATE/DELETE autenticado.
- `src/app/layout.tsx` — metadata "Furia Suplementos" + `lang="es"`.

**Pendiente manual del usuario** (no automatizable sin su cuenta):
1. Supabase Dashboard → SQL Editor: 1º `supabase/seed.sql`, 2º `supabase/enable_rls.sql`.
2. Supabase Dashboard → Authentication → Add user: `admin@furia.com` + password.
3. Testing manual (ver checklist abajo) con `npm run dev`.

### Fix POST-seed (IMPORTANTE, aplicar ya)
Síntoma: seed + RLS ejecutados OK, pero el home no muestra productos. Causa: **401 "permission denied for table"** — el rol `anon`/`authenticated` no tenía GRANT de tabla (capas GRANT ≠ RLS; el error se enmascaraba por `if (!data) return null`). Fix ya aplicado en repo:
- `supabase/enable_rls.sql` — se anexó sección 7 con GRANTs (anon SELECT; authenticated SELECT + INSERT/UPDATE/DELETE). **Volver a pegar el archivo completo en SQL Editor**.
- Logs de error agregados en `(storefront)/page.tsx`, `(storefront)/layout.tsx` y `product/[slug]/page.tsx` (`const { data, error }` + `console.error`) para que fallos futuros no queden mudos.
- `next.config.ts` — `allowedDevOrigins: ['192.168.2.201']` (CORS LAN, lo agregó el usuario).
- `src/app/layout.tsx` — metadata "Furia Suplementos" + `lang="es"`.

Origen del bug: las tablas se crearon sin GRANTs para anon/authenticated; el 401 existía desde el inicio pero las tablas vacías lo ocultaban (mismo mensaje que "sin resultados").

Checklist testing manual con RLS activo:
1. Home lista SSR con seed visible (valida SELECT público).
2. Filtros search/category/tag.
3. Ficha `/product/[slug]` (tags, nutricional, VariantSelector).
4. Carrito → WhatsApp hacia `wa.me/542615939115`.
5. Login `admin@furia.com` (cookie JWT → rol `authenticated`).
6. CRUD producto+variantes (escritura RLS).
7. Upload imagen al bucket.
8. StockToggle / Delete.
9. **Seguridad**: sin login, intentar DELETE vía devtools → debe fallar (RLS bloquea anon).

## Pendiente
### Fase 6b — Deploy (diferido, luego del testing manual)
1. Commit → repo GitHub (web; no hay `gh` ni `vercel` CLI instalados) → push.
2. Import en Vercel → copiar `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` → deploy.
3. Home con metadata correcta ya lista (name "Furia Suplementos").
4. Verificar flujo completo en prod (login admin, upload imagen, pedido WhatsApp).

### Próximos posibles (post-testing)
- **slug en products**: hoy `slugify(name)` en runtime; si 2 productos comparten nombre colisionan. Ideal: columna `slug` única.
- **DeleteProductButton no borra la imagen del bucket** → archivos huérfanos (deuda conocida, no bloqueante).
- **Admin edit de store_settings/categorías**: no hay UI; hoy solo seed/consulta directa.

## Comandos
- Dev: `npm run dev`
- Lint: `npx eslint src/`
- Typecheck: `npx tsc --noEmit` (requiere `.next/types` previo via build)
- Build: `npx next build`