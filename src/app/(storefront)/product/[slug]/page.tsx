import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, ImageOff } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { VariantSelector } from "@/components/storefront/VariantSelector"
import { slugify } from "@/lib/utils"
import type { ProductDetail } from "@/types"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} - Furia Suplementos`,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
      type: "website",
    },
  }
}

async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, category_id, name, brand, description, nutritional_info, image_url, is_active, categories(id, name, slug), product_variants(id, product_id, flavor, weight_size, price, stock, is_available)"
    )
    .eq("is_active", true)

  if (error) console.error("getProductBySlug:", error.message)
  if (!data) return null
  const found = data.find((p) => slugify(p.name) === slug)
  if (!found) return null

  return found as unknown as ProductDetail
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return notFound()
  }

  const variants = product.product_variants ?? []
  const available = variants.filter((v) => v.is_available && Number(v.stock) > 0)
  const totalStock = available.reduce((sum, v) => sum + Number(v.stock), 0)
  const category = product.categories?.[0]
  const nutrition = Object.entries(product.nutritional_info ?? {})

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-28 md:pb-12">
      <nav aria-label="Miga de pan" className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-copper-300">
          Inicio
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        {category && (
          <>
            <Link
              href={`/?category=${category.slug}`}
              className="truncate transition-colors hover:text-copper-300"
            >
              {category.name}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" />
          </>
        )}
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-titanium-2 to-ink ring-1 ring-white/8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-16 bottom-0 h-40 bg-copper-500/15 blur-3xl"
            />
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="relative h-full w-full object-contain p-8 sm:p-12"
              />
            ) : (
              <div className="relative flex aspect-square flex-col items-center justify-center gap-3">
                <div className="skeleton absolute inset-0" />
                <span className="relative flex size-16 items-center justify-center rounded-full border border-copper-500/25 bg-copper-500/5">
                  <ImageOff className="size-6 text-copper-500/70" />
                </span>
                <span className="relative text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Sin imagen
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link href={`/?category=${category.slug}`}>
                  <Badge variant="outline" className="border-copper-500/40 text-copper-300">
                    {category.name}
                  </Badge>
                </Link>
              )}
              {available.length === 0 ? (
                <Badge variant="muted">Agotado</Badge>
              ) : totalStock <= 3 ? (
                <Badge variant="warning">Últimas {totalStock}</Badge>
              ) : (
                <Badge variant="success">Disponible</Badge>
              )}
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-copper-400/90">
              {product.brand}
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl">
              {product.name}
            </h1>
          </div>

          <VariantSelector
            productId={product.id}
            productName={product.name}
            brand={product.brand}
            imageUrl={product.image_url}
            variants={variants}
          />

          {product.description && (
            <section className="border-t border-white/8 pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-400">
                Descripción
              </h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </section>
          )}

          {nutrition.length > 0 && (
            <section className="border-t border-white/8 pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-400">
                Información nutricional
              </h2>
              <dl className="mt-3 overflow-hidden rounded-2xl bg-titanium/50 ring-1 ring-white/8">
                {nutrition.map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${
                      i > 0 ? "border-t border-white/6" : ""
                    }`}
                  >
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="text-right font-medium text-foreground">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
