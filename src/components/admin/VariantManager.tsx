"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export type VariantInput = {
  id?: string
  flavor: string
  weight_size: string
  price: string
  stock: string
  is_available: boolean
}

type VariantManagerProps = {
  variants: VariantInput[]
  onChange: (variants: VariantInput[]) => void
}

export function VariantManager({ variants, onChange }: VariantManagerProps) {
  const addVariant = () => {
    onChange([
      ...variants,
      {
        flavor: "",
        weight_size: "",
        price: "",
        stock: "",
        is_available: true,
      },
    ])
  }

  const updateVariant = (index: number, patch: Partial<VariantInput>) => {
    onChange(
      variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    )
  }

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Variantes</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="size-4" />
          Agregar
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin variantes. Agregá al menos una con precio y stock.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? index}
              className="rounded-lg border p-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Sabor</Label>
                  <Input
                    value={variant.flavor}
                    onChange={(e) =>
                      updateVariant(index, { flavor: e.target.value })
                    }
                    placeholder="Chocolate"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Presentación</Label>
                  <Input
                    value={variant.weight_size}
                    onChange={(e) =>
                      updateVariant(index, { weight_size: e.target.value })
                    }
                    placeholder="1kg"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Precio</Label>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(index, { price: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, { stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={variant.is_available}
                    onCheckedChange={(checked) =>
                      updateVariant(index, { is_available: checked })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    Disponible
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeVariant(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Eliminar variante"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}