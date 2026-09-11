"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCartStore } from "@/lib/store/useCartStore"
import type { ProductVariant } from "@/types"

type VariantSelectorProps = {
  productId: string
  productName: string
  brand: string
  imageUrl: string
  variants: ProductVariant[]
}

export function VariantSelector({
  productId,
  productName,
  brand,
  imageUrl,
  variants,
}: VariantSelectorProps) {
  const flavors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.flavor ?? "Sin sabor"))),
    [variants]
  )

  const [flavor, setFlavor] = useState<string>(flavors[0] ?? "")

  const weights = Array.from(
    new Set(
      variants
        .filter((v) => (v.flavor ?? "Sin sabor") === flavor)
        .map((v) => v.weight_size ?? "Única")
    )
  )

  const [weight, setWeight] = useState<string>(weights[0] ?? "")

  const selectedVariant: ProductVariant | undefined = variants.find(
    (v) =>
      (v.flavor ?? "Sin sabor") === flavor &&
      (v.weight_size ?? "Única") === weight
  )

  const available = selectedVariant?.is_available && selectedVariant.stock > 0

  const addToCart = useCartStore((s) => s.addItem)

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
  }

  return (
    <div className="flex flex-col gap-4">
      {flavors.length > 1 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Sabor</label>
          <Select
            value={flavor}
            onValueChange={(v) => {
              setFlavor(v as string)
              const newWeights = Array.from(
                new Set(
                  variants
                    .filter((x) => (x.flavor ?? "Sin sabor") === (v as string))
                    .map((x) => x.weight_size ?? "Única")
                )
              )
              setWeight(newWeights[0] ?? "")
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {flavors.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {weights.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Presentación</label>
          <Select value={weight} onValueChange={(v) => setWeight(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weights.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">
          {selectedVariant
            ? `$${Number(selectedVariant.price).toLocaleString("es-AR")}`
            : "Consultar"}
        </div>
        {selectedVariant && (
          <Badge variant={available ? "secondary" : "outline"}>
            {available ? "Disponible" : "Sin stock"}
          </Badge>
        )}
      </div>

      {!available && selectedVariant && (
        <p className="text-sm text-destructive">
          Este producto no está disponible actualmente.
        </p>
      )}

      <Button disabled={!available} onClick={handleAddToCart} className="w-full">
        Agregar al carrito
      </Button>
    </div>
  )
}
