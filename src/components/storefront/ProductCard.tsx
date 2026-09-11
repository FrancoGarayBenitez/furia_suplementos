import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { slugify } from "@/lib/utils"
import type { ProductVariant } from "@/types"

type ProductCardProps = {
  name: string
  brand: string
  imageUrl: string
  variants: ProductVariant[]
  isActive: boolean
}

export function ProductCard({
  name,
  brand,
  imageUrl,
  variants,
  isActive,
}: ProductCardProps) {
  const available = variants.filter((v) => v.is_available && v.stock > 0)
  const minPrice = available.length
    ? Math.min(...available.map((v) => Number(v.price)))
    : null

  return (
    <Link href={`/product/${slugify(name)}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
        <CardContent className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {brand}
          </span>
          <h3 className="line-clamp-2 font-medium">{name}</h3>
          <div className="mt-1 flex items-center justify-between">
            {minPrice !== null ? (
              <span className="text-base font-bold">
                ${minPrice.toLocaleString("es-AR")}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Consultar
              </span>
            )}
            {!isActive ? (
              <Badge variant="destructive">Inactivo</Badge>
            ) : available.length ? (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                Disponible
              </Badge>
            ) : (
              <Badge variant="outline">Sin stock</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
