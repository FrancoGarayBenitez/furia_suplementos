import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductForm } from "@/components/admin/ProductForm"
import { DeleteProductButton } from "@/components/admin/DeleteProductButton"
import { StockToggle } from "@/components/admin/StockToggle"
import { slugify } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select(
      "id, category_id, name, brand, description, tags, image_url, is_active, product_variants(id, product_id, flavor, weight_size, price, stock, is_available)"
    ),
    supabase.from("categories").select("id, name").order("name"),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <ProductForm categories={categories ?? []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          {!products || products.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No hay productos todavía. Creá el primero.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Variantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const category = (categories ?? []).find(
                    (c) => c.id === product.category_id
                  )
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 overflow-hidden rounded border bg-muted">
                            {product.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="secondary">{category.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const variants = product.product_variants ?? []
                          const availableVariants = variants.filter(
                            (v) => v.is_available && Number(v.stock) > 0
                          )
                          const availableStock = availableVariants.reduce(
                            (sum, v) => sum + Number(v.stock ?? 0),
                            0
                          )
                          return (
                            <div>
                              <p className="font-medium">
                                {variants.length}{" "}
                                {variants.length === 1
                                  ? "variante"
                                  : "variantes"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {availableVariants.length} disponibles · stock{" "}
                                {availableStock}
                              </p>
                            </div>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StockToggle
                            productId={product.id}
                            checked={product.is_active}
                          />
                          <Badge
                            variant={
                              product.is_active ? "secondary" : "outline"
                            }
                          >
                            {product.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            nativeButton={false}
                            render={
                              <Link
                                href={`/product/${slugify(product.name)}`}
                                target="_blank"
                              />
                            }
                          >
                            <Eye className="size-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <ProductForm
                            categories={categories ?? []}
                            product={product}
                            variant="ghost"
                          />
                          <DeleteProductButton productId={product.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}