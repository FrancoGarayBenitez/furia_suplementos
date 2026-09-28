"use client"

import { useMemo, useState } from "react"
import { Check, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils/whatsapp"
import { useCartStore } from "@/lib/store/useCartStore"
import type { ProductVariant } from "@/types"

type VariantSelectorProps = {
  productId: string
  productName: string
  brand: string
  imageUrl: string
  variants: ProductVariant[]
}

const pillBase =
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-copper-400/60"

const pillIdle =
  "border-white/10 bg-titanium/50 text-muted-foreground hover:border-copper-500/50 hover:text-foreground"

const pillActive =
  "border-copper-500/70 bg-copper-400/15 text-copper-100 shadow-[inset_0_0_20px_rgba(212,163,115,0.12)]"

const flavorOf = (v: ProductVariant) => v.flavor ?? "Sin sabor"
const weightOf = (v: ProductVariant) => v.weight_size ?? "Única"
const inStock = (v: ProductVariant) => v.is_available && Number(v.stock) > 0

export function VariantSelector({
  productId,
  productName,
  brand,
  imageUrl,
  variants,
}: VariantSelectorProps) {
  const flavors = useMemo(
    () => Array.from(new Set(variants.map(flavorOf))),
    [variants]
  )

  const [flavor, setFlavor] = useState<string>(flavors[0] ?? "")

  const weights = useMemo(
    () =>
      Array.from(
        new Set(
          variants.filter((v) => flavorOf(v) === flavor).map(weightOf)
        )
      ),
    [variants, flavor]
  )

  const [weight, setWeight] = useState<string>(weights[0] ?? "")

  const selectedVariant = variants.find(
    (v) => flavorOf(v) === flavor && weightOf(v) === weight
  )

  const available = selectedVariant ? inStock(selectedVariant) : false
  const stock = selectedVariant ? Number(selectedVariant.stock) : 0
  const price = selectedVariant ? Number(selectedVariant.price) : null

  const addToCart = useCartStore((s) => s.addItem)

  const handleFlavorChange = (next: string) => {
    setFlavor(next)
    const nextWeights = Array.from(
      new Set(variants.filter((v) => flavorOf(v) === next).map(weightOf))
    )
    setWeight(nextWeights[0] ?? "")
  }

  const handleAddToCart = () => {
    if (!selectedVariant || !available) return
    addToCart({
      variantId: selectedVariant.id,
      productId,
      productName,
      brand,
      flavor: selectedVariant.flavor,
      weightSize: selectedVariant.weight_size,
      price: Number(selectedVariant.price),
      imageUrl,
    })
    toast.success("Agregado al carrito", {
      description: [productName, selectedVariant.flavor, selectedVariant.weight_size]
        .filter(Boolean)
        .join(" · "),
    })
  }

  const flavorsFor = (f: string) => variants.filter((v) => flavorOf(v) === f)

  return (
    <div className="flex flex-col gap-5">
      {flavors.length > 1 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Sabor
          </span>
          <div className="flex flex-wrap gap-2">
            {flavors.map((f) => {
              const isActive = f === flavor
              const anyStock = flavorsFor(f).some(inStock)
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleFlavorChange(f)}
                  className={cn(
                    pillBase,
                    isActive ? pillActive : pillIdle,
                    !anyStock && "opacity-45"
                  )}
                >
                  {isActive && <Check className="size-3.5 shrink-0" />}
                  {f}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {weights.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Presentación
          </span>
          <div className="flex flex-wrap gap-2">
            {weights.map((w) => {
              const isActive = w === weight
              const variant = variants.find(
                (v) => flavorOf(v) === flavor && weightOf(v) === w
              )
              const ok = variant ? inStock(variant) : false
              return (
                <button
                  key={w}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setWeight(w)}
                  className={cn(
                    pillBase,
                    isActive ? pillActive : pillIdle,
                    !ok && "opacity-45"
                  )}
                >
                  {isActive && <Check className="size-3.5 shrink-0" />}
                  {w}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {selectedVariant ? formatPrice(Number(selectedVariant.price)) : "Consultar"}
        </span>
        {selectedVariant &&
          (available ? (
            stock <= 3 ? (
              <Badge variant="warning">Últimas {stock}</Badge>
            ) : (
              <Badge variant="success">Disponible</Badge>
            )
          ) : (
            <Badge variant="muted">Agotado</Badge>
          ))}
      </div>

      {!available && selectedVariant && (
        <p className="-mt-2 text-sm text-muted-foreground">
          Este producto no está disponible actualmente. Escribinos y te
          avisamos cuando vuelva.
        </p>
      )}

      {/* CTA de escritorio */}
      <Button
        variant="ember"
        size="xl"
        className="hidden w-full md:inline-flex"
        disabled={!available}
        onClick={handleAddToCart}
      >
        <ShoppingCart data-icon="inline-start" />
        Agregar al carrito
      </Button>

      {/* Barra sticky de compra en mobile */}
      {available && (
        <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-white/10 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="text-lg font-black text-foreground">
                {price !== null ? formatPrice(price) : "—"}
              </span>
            </div>
            <Button
              variant="ember"
              size="lg"
              className="h-12 flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart data-icon="inline-start" />
              Agregar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
