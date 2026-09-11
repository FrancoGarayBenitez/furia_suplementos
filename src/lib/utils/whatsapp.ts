import type { CartItem } from "@/types"

export type OrderDetails = {
  name?: string
  delivery?: string
}

export function formatPrice(value: number): string {
  return `$${value.toLocaleString("es-AR")}`
}

export function buildOrderMessage(
  items: CartItem[],
  settings: { welcome?: string; deliveryInfo?: string },
  details?: OrderDetails
): string {
  const lines: string[] = []

  if (settings.welcome) {
    lines.push(settings.welcome)
    lines.push("")
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  lines.push("🛒 *MI PEDIDO*")
  lines.push("----------------------------")

  items.forEach((item) => {
    const variant =
      [item.flavor, item.weightSize].filter(Boolean).join(" · ") || "Única"
    const subtotal = formatPrice(item.price * item.quantity)
    lines.push(
      `• ${item.brand} ${item.productName}`
    )
    if (variant) {
      lines.push(`   ${variant}`)
    }
    lines.push(
      `   ${item.quantity} x ${formatPrice(item.price)} = ${subtotal}`
    )
  })

  lines.push("----------------------------")
  lines.push(`*TOTAL ESTIMADO: ${formatPrice(total)}*`)

  if (details?.name) {
    lines.push("")
    lines.push(`👤 *Nombre:* ${details.name}`)
  }

  if (details?.delivery) {
    lines.push(`🚚 *Entrega:* ${details.delivery}`)
  }

  if (settings.deliveryInfo) {
    lines.push("")
    lines.push(settings.deliveryInfo)
  }

  lines.push("")
  lines.push("Gracias! 🙌")

  return lines.join("\n")
}

export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/\D/g, "")
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
