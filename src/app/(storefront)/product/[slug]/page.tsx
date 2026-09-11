import type { Metadata } from "next"
import { notFound } from "next/navigation"
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
      "id, category_id, name, brand, description, nutritional_info, tags, image_url, is_active, categories(id, name, slug), product_variants(id, product_id, flavor, weight_size, price, stock, is_available)"
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.categories?.[0]?.name ?? ""}
            </span>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <VariantSelector
            productId={product.id}
            productName={product.name}
            brand={product.brand}
            imageUrl={product.image_url}
            variants={variants}
          />

          {product.description && (
            <div className="mt-4 border-t pt-4">
              <h2 className="mb-2 font-medium">Descripción</h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.nutritional_info &&
            Object.keys(product.nutritional_info).length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h2 className="mb-2 font-medium">Información nutricional</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {Object.entries(product.nutritional_info).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b pb-1">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
