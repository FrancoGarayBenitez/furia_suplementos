"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type SettingsFormProps = {
  initial: {
    whatsapp_number: string
    welcome_message: string
    cart_welcome_message: string
    delivery_info: string
  }
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter()
  const [whatsapp, setWhatsapp] = useState(
    initial.whatsapp_number.replace(/^549/, "")
  )
  const [welcome, setWelcome] = useState(initial.welcome_message)
  const [cartWelcome, setCartWelcome] = useState(initial.cart_welcome_message)
  const [delivery, setDelivery] = useState(initial.delivery_info)
  const [loading, setLoading] = useState(false)

  const digits = whatsapp.replace(/\D/g, "")
  const phoneValid = digits.length >= 8

  const handleSave = async () => {
    if (!phoneValid) {
      toast.error("Ingresá un número de WhatsApp válido")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("store_settings")
      .update({
        whatsapp_number: "549" + digits,
        welcome_message: welcome.trim(),
        cart_welcome_message: cartWelcome.trim(),
        delivery_info: delivery.trim(),
      })
      .eq("id", 1)
    setLoading(false)
    if (error) {
      toast.error("Error al guardar: " + error.message)
      return
    }
    toast.success("Configuración actualizada")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="wa">Número de WhatsApp</Label>
        <div className="flex items-stretch">
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            +54 9
          </span>
          <Input
            id="wa"
            className="rounded-l-none border-l-0"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
            placeholder="261 258-0755"
            inputMode="tel"
          />
        </div>
        {whatsapp && !phoneValid ? (
          <p className="text-xs text-destructive">
            Ingresá el código de área y el número (mínimo 8 dígitos)
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="welcome">Mensaje de bienvenida</Label>
        <Input
          id="welcome"
          value={welcome}
          onChange={(e) => setWelcome(e.target.value)}
          placeholder="¡Hola! Te preparamos tu pedido."
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cart-welcome">Mensaje para pedidos</Label>
        <Input
          id="cart-welcome"
          value={cartWelcome}
          onChange={(e) => setCartWelcome(e.target.value)}
          placeholder="¡Hola! Te paso mi pedido."
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="delivery">Información de envíos</Label>
        <Textarea
          id="delivery"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
          placeholder="Hacemos envíos a todo el país..."
          rows={3}
        />
      </div>
      <Button onClick={handleSave} disabled={loading || !phoneValid}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  )
}
