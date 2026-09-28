import Link from "next/link"
import { ArrowRight, BadgeCheck, Flame, MessageCircle, ShieldCheck, Truck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/storefront/SearchBar"
import { CategoryFilter } from "@/components/storefront/CategoryFilter"
import { ProductCard } from "@/components/storefront/ProductCard"
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp"

type SearchParams = {
  search?: string
  category?: string
}

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const [
    { data: categories, error: categoriesError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("store_settings").select("whatsapp_number, welcome_message").limit(1).maybeSingle(),
  ])

  if (categoriesError) console.error("categories:", categoriesError.message)
  if (settingsError) console.error("store_settings:", settingsError.message)

  const whatsappNumber = settings?.whatsapp_number ?? ""
  const waHref = whatsappNumber
    ? buildWhatsAppUrl(whatsappNumber, settings?.welcome_message || "Hola!")
    : null

  let categoryId: string | null = null
  if (params.category) {
    categoryId = (categories ?? []).find((c) => c.slug === params.category)?.id ?? null
  }

  let query = supabase
    .from("products")
    .select(
      "id, category_id, name, brand, description, image_url, is_active, product_variants(id, product_id, flavor, weight_size, price, stock, is_available)"
    )
    .eq("is_active", true)

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }
  if (params.search) {
    const term = params.search
    query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`)
  }

  const { data: products, error: productsError } = await query.order("name")
  if (productsError) console.error("products:", productsError.message)

  const list = products ?? []
  const activeFilter = params.search || params.category

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-white/8">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-ink" />
          <div className="absolute -left-32 -top-28 size-[30rem] rounded-full bg-copper-500/20 blur-[130px]" />
          <div className="absolute -bottom-36 -right-20 size-[26rem] rounded-full bg-ember/10 blur-[140px]" />
          <div className="absolute inset-0 grid-overlay opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
          <div className="noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />
        </div>

        <div className="mx-auto flex min-h-[70svh] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center md:min-h-[80vh]">
          {/* Lockup completo — el tagline se lee a este tamaño */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt="Furia Suplementos"
            width={1600}
            height={1139}
            loading="eager"
            fetchPriority="high"
            className="max-h-32 w-auto max-w-[80vw] object-contain drop-shadow-[0_4px_40px_rgba(212,163,115,0.30)] sm:max-h-36 lg:max-h-40"
          />

          <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-copper-500/30 bg-copper-500/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-copper-200 backdrop-blur-sm">
            <Flame className="size-3.5 text-copper-300" />
            Suplementos deportivos · Argentina
          </span>

          <h1 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Potencia tu <span className="text-gradient-copper">rendimiento</span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Proteínas, creatinas y pre-entrenos listos para el entrenamiento de
            hoy. Armá tu carrito y mandá el pedido por WhatsApp.
          </p>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-copper-400" />
              Envíos a todo el país
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-copper-400" />
              100% original
            </li>
            <li className="flex items-center gap-1.5">
              <BadgeCheck className="size-3.5 text-copper-400" />
              Pedido por WhatsApp
            </li>
          </ul>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="ember"
              size="xl"
              nativeButton={false}
              render={<a href="#catalogo" />}
            >
              Ver catálogo
              <ArrowRight data-icon="inline-end" />
            </Button>
            {waHref && (
              <Button
                variant="outline"
                size="xl"
                nativeButton={false}
                render={<a href={waHref} target="_blank" rel="noopener noreferrer" />}
              >
                <MessageCircle data-icon="inline-start" />
                Pedir por WhatsApp
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Catálogo ─────────────────────────────────────── */}
      <section id="catalogo" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-7 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight sm:text-2xl">
                  Catálogo
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {list.length}{" "}
                  {list.length === 1 ? "producto" : "productos"}
                  {activeFilter ? " con los filtros aplicados" : " disponibles"}
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <SearchBar defaultValue={params.search ?? ""} />
            </div>

            <CategoryFilter categories={categories ?? []} />
          </div>

          {list.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {list.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  brand={product.brand}
                  imageUrl={product.image_url}
                  variants={product.product_variants ?? []}
                  isActive={product.is_active}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-titanium/40 px-6 py-16 text-center">
              <Flame className="size-7 text-copper-500/60" />
              <p className="text-sm text-muted-foreground">
                No se encontraron productos con los filtros seleccionados.
              </p>
              <Link
                href="/"
                className="text-sm font-medium text-copper-300 underline-offset-4 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
