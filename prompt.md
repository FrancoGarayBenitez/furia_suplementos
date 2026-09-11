# Contexto y Directivas del Proyecto: Catálogo Digital de Suplementos Deportivos

## 1. Contexto del Negocio y Objetivo
El cliente es un emprendimiento de venta de suplementos deportivos (proteínas, creatinas, pre-entrenos, etc.) que opera de forma local y gestiona sus ventas por WhatsApp e Instagram. 

**Objetivo:** Desarrollar un e-commerce tipo catálogo digital ("Mobile First") optimizado para velocidad y SEO. Los clientes no realizan el pago dentro de la plataforma; navegan el catálogo, seleccionan productos/variantes (sabores, pesos), arman un carrito local y envían el pedido formateado directamente a WhatsApp. El sistema debe incluir un panel administrador protegido para gestionar productos, variantes y stock.

---

## 2. Stack Tecnológico y Variables de Entorno

- **Framework:** Next.js 15 (App Router, React 19) con TypeScript.
- **Estilos / UI:** Tailwind CSS + Shadcn UI / Lucide React.
- **Estado Global:** Zustand con persistencia en `localStorage` para el carrito.
- **Backend & DB:** Supabase (PostgreSQL, Storage, Auth para el Admin).
- **Despliegue:** Vercel + Supabase.

### Variables de Entorno Requeridas (`.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Esquema de Base de Datos y Seguridad (Supabase)

El esquema en PostgreSQL ya está creado con las siguientes tablas y reglas RLS:

- `categories`: `id` (UUID), `name` (TEXT), `slug` (TEXT).
- `products`: `id` (UUID), `category_id` (UUID FK), `name` (TEXT), `brand` (TEXT), `description` (TEXT), `nutritional_info` (JSONB), `tags` (TEXT[]), `image_url` (TEXT), `is_active` (BOOLEAN).
- `product_variants`: `id` (UUID), `product_id` (UUID FK), `flavor` (TEXT), `weight_size` (TEXT), `price` (NUMERIC), `stock` (INT), `is_available` (BOOLEAN).
- `store_settings`: `id` (INT), `whatsapp_number` (TEXT), `welcome_message` (TEXT), `delivery_info` (TEXT).
- **Storage Bucket:** `product-images` (público para lectura, escritura restringida a usuarios autenticados).

---

## 4. Arquitectura de Directorios A Generar

```text
src/
├── app/
│   ├── (storefront)/        # Layout público (Home, Catálogo, Detalle/Modal, Checkout WA)
│   │   ├── page.tsx          # Home + Buscador + Filtros de categorías y tags
│   │   └── product/[slug]/  # Ficha de producto (SEO / OpenGraph dinámico)
│   ├── admin/               # Layout protegido (Backoffice)
│   │   ├── login/           # Autenticación con Supabase Auth
│   │   └── dashboard/       # CRUD de productos, matriz de variantes y stock
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── storefront/          # ProductCard, CategoryFilter, CartDrawer, WhatsappModal
│   ├── admin/               # ProductForm, VariantManager, StockToggle
│   └── ui/                  # Componentes reutilizables (Button, Input, Badge, Modal)
├── lib/
│   ├── supabase/            # client.ts (Browser), server.ts (SSR), middleware.ts
│   ├── store/               # useCartStore.ts (Zustand con persist)
│   └── utils/               # whatsapp.ts (Generador de URL encodeada con resumen)
└── types/                   # Definiciones de TypeScript (Database & Cart)
```

---

## 5. Requerimientos de Funcionalidad e Implementación

### A. Storefront (Cliente)
1. **Catálogo y Navegación:**
   - Buscador por texto (nombre/marca) y filtro por categorías y etiquetas (`Sin TACC`, `Vegano`, etc.).
   - Tarjetas de producto (`ProductCard`) con imagen, marca, precio desde/mínimo y badge de disponibilidad.
2. **Ficha de Producto y Variantes:**
   - Selector dinámico de variante (Sabor y Presentación/Peso). Al cambiar de variante, debe actualizarse automáticamente el precio y la disponibilidad de stock.
3. **Carrito e Integración con WhatsApp:**
   - Carrito persistente en `localStorage` (Zustand).
   - Generación de enlace a WhatsApp formateado:
     - Formato: `https://wa.me/{numero}?text={mensaje_encodeado}`
     - El mensaje debe incluir: detalle de ítems, sabores, cantidades, total estimado y opción de entrega/nombre opcional.

### B. Panel Administrador (Backoffice)
1. **Autenticación:**
   - Login seguro en `/admin/login` con Supabase Auth y protección de rutas mediante Middleware.
2. **Gestión de Productos y Variantes:**
   - Formulario para crear/editar productos y subir imágenes directamente al bucket `product-images`.
   - Matriz para agregar múltiples variantes (sabor, peso, precio, stock) por producto base.
   - Switch de apagado/encendido rápido para cambiar el estado `is_available` sin eliminar la variante.

---

## 6. Instrucción de Inicio para el Agente

Comienza creando la estructura base de carpetas, configurando los clientes de Supabase (`lib/supabase/client.ts` y `server.ts`), definiendo los tipos de TypeScript en `types/index.ts` y creando el utilitario de formato para WhatsApp en `lib/utils/whatsapp.ts`. Luego procede a construir los componentes del Storefront.