"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/store/useCartStore"
import { buildOrderMessage, buildWhatsAppUrl, formatPrice } from "@/lib/utils/whatsapp"

type CartProviderProps = {
  whatsappNumber: string
  welcomeMessage?: string
  deliveryInfo?: string
}

export function CartProvider({
  whatsappNumber,
  welcomeMessage,
  deliveryInfo,
}: CartProviderProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [delivery, setDelivery] = useState("")

  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleSend = () => {
    const message = buildOrderMessage(
      items,
      { welcome: welcomeMessage, deliveryInfo },
      { name: name || undefined, delivery: delivery || undefined }
    )
    window.open(buildWhatsAppUrl(whatsappNumber, message), "_blank")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
        aria-label="Abrir carrito"
      >
        <ShoppingCart className="size-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {itemCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Mi carrito</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Tu carrito está vacío.
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 overflow-hidden rounded border bg-muted">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {item.productName}
                          </p>
                          {(item.flavor || item.weightSize) && (
                            <p className="text-xs text-muted-foreground">
                              {[item.flavor, item.weightSize]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            aria-label="Restar"
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            aria-label="Sumar"
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex flex-col gap-4 border-t p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{formatPrice(total)}</span>
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Tu nombre (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Retiro / delivery (opcional)"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                />
              </div>

              <Button onClick={handleSend} className="w-full">
                <Send className="size-4" />
                Enviar por WhatsApp
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
