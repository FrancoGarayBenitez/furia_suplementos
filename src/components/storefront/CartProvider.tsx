"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, MessageCircle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
        className="glass-panel relative inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-foreground transition-colors hover:border-copper-500/50 hover:text-copper-200 focus-visible:ring-2 focus-visible:ring-copper-400/60 focus-visible:outline-none"
        aria-label={`Abrir carrito${itemCount ? `, ${itemCount} productos` : ""}`}
      >
        <ShoppingCart className="size-5" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-neon px-1 text-[10px] font-black text-ink ring-2 ring-ink">
            {itemCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-ink/95 backdrop-blur-xl data-[side=right]:w-full data-[side=right]:border-white/10 data-[side=right]:sm:max-w-md">
          <SheetHeader className="border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <SheetTitle className="text-lg font-bold uppercase tracking-tight">
                Tu carrito
              </SheetTitle>
              {itemCount > 0 && (
                <span className="rounded-full bg-copper-400/15 px-2 py-0.5 text-xs font-semibold text-copper-200">
                  {itemCount}
                </span>
              )}
            </div>
            <SheetDescription>
              {items.length > 0
                ? "Revisá tu pedido y mandalo por WhatsApp."
                : "Todavía no agregaste productos."}
            </SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <span className="flex size-16 items-center justify-center rounded-full border border-copper-500/25 bg-copper-500/5">
                <Flame className="size-7 text-copper-500/70" />
              </span>
              <p className="text-sm text-muted-foreground">
                Tu carrito está vacío. Explorá el catálogo y armá tu pedido.
              </p>
              <Button
                variant="copper"
                size="lg"
                nativeButton={false}
                render={<Link href="/" />}
                onClick={() => setOpen(false)}
              >
                Ver catálogo
              </Button>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3 rounded-xl bg-titanium/60 p-3 ring-1 ring-white/8"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-titanium-2 ring-1 ring-white/10">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Flame className="size-4 text-copper-500/50" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-copper-400/90">
                          {item.brand}
                        </p>
                        <p className="truncate text-sm font-semibold leading-tight text-foreground">
                          {item.productName}
                        </p>
                        {(item.flavor || item.weightSize) && (
                          <p className="truncate text-xs text-muted-foreground">
                            {[item.flavor, item.weightSize]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:ring-2 focus-visible:ring-copper-400/60 focus-visible:outline-none"
                        aria-label={`Eliminar ${item.productName}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="flex size-8 items-center justify-center rounded-full border border-white/10 text-foreground transition-colors hover:border-copper-500/60 hover:text-copper-200 focus-visible:ring-2 focus-visible:ring-copper-400/60 focus-visible:outline-none"
                          aria-label="Restar unidad"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="flex size-8 items-center justify-center rounded-full border border-white/10 text-foreground transition-colors hover:border-copper-500/60 hover:text-copper-200 focus-visible:ring-2 focus-visible:ring-copper-400/60 focus-visible:outline-none"
                          aria-label="Sumar unidad"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-auto flex flex-col gap-4 border-t border-white/8 bg-ink-soft/60 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Total estimado
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Envío y forma de pago se coordinan por chat.
                  </p>
                </div>
                <span className="text-2xl font-black tracking-tight text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Tu nombre (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Tu nombre"
                  className="h-10 rounded-xl border-white/10 bg-titanium/60"
                />
                <Input
                  placeholder="Retiro / delivery (opcional)"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  aria-label="Retiro o delivery"
                  className="h-10 rounded-xl border-white/10 bg-titanium/60"
                />
              </div>

              <Button
                variant="neon"
                size="xl"
                className="w-full"
                onClick={handleSend}
              >
                <MessageCircle data-icon="inline-start" />
                Pedir por WhatsApp
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
