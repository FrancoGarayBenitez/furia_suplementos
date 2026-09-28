import Link from "next/link"
import { ArrowRight, ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { slugify } from "@/lib/utils"
import { formatPrice } from "@/lib/utils/whatsapp"
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
  const totalStock = available.reduce((sum, v) => sum + Number(v.stock), 0)
  const minPrice = available.length
    ? Math.min(...available.map((v) => Number(v.price)))
    : null
  const soldOut = available.length === 0

  return (
    <Link
      href={`/product/${slugify(name)}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-titanium ring-1 ring-white/8 transition-all duration-300 outline-none hover:ring-copper-400/40 hover:shadow-glow-copper focus-visible:ring-2 focus-visible:ring-copper-400/60"
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-titanium-2 to-ink ${
          soldOut ? "opacity-60 saturate-50" : ""
        }`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="skeleton absolute inset-0" />
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-2.5">
              <span className="flex size-12 items-center justify-center rounded-full border border-copper-500/25 bg-copper-500/5">
                <ImageOff className="size-5 text-copper-500/70" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Sin imagen
              </span>
            </div>
          </>
        )}

        {/* Resplandor inferior de marca */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 bottom-0 h-20 bg-copper-500/25 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="absolute left-2.5 top-2.5">
          {!isActive ? (
            <Badge variant="muted">Inactivo</Badge>
          ) : soldOut ? (
            <Badge variant="muted">Agotado</Badge>
          ) : totalStock <= 3 ? (
            <Badge variant="warning">Últimas {totalStock}</Badge>
          ) : (
            <Badge variant="success">Disponible</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-copper-400/90">
          {brand}
        </span>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {name}
        </h3>

        <div className="mt-auto pt-3">
          {minPrice !== null ? (
            <div className="flex items-baseline gap-1.5">
              {variants.length > 1 && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  desde
                </span>
              )}
              <span className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {formatPrice(minPrice)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Consultar</span>
          )}

          {/* affordance visual: el card entero es el link, esto no es interactivo */}
          <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-copper-300">
              Ver opciones
            </span>
            <ArrowRight className="size-3.5 text-copper-400 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
