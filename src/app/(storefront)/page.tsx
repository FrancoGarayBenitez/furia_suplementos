import { createClient } from "@/lib/supabase/server"
import { SearchBar } from "@/components/storefront/SearchBar"
import { CategoryFilter } from "@/components/storefront/CategoryFilter"
import { ProductCard } from "@/components/storefront/ProductCard"

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

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name")

  if (categoriesError) console.error("categories:", categoriesError.message)

  let categoryId: string | null = null
  if (params.category) {
    const activeCategory = (categories ?? []).find(
      (c) => c.slug === params.category
    )
    categoryId = activeCategory?.id ?? null
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Suplementos Deportivos
        </h1>
        <p className="text-muted-foreground">
          Los mejores productos para tu entrenamiento. Pedí por WhatsApp.
        </p>
        <div className="max-w-md">
          <SearchBar defaultValue={params.search ?? ""} />
        </div>
        <CategoryFilter categories={categories ?? []} />
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
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
        <div className="py-16 text-center text-muted-foreground">
          No se encontraron productos con los filtros seleccionados.
        </div>
      )}
    </div>
  )
}
