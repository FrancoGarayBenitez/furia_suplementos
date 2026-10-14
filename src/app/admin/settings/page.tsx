import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "@/components/admin/SettingsForm"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings, error } = await supabase
    .from("store_settings")
    .select("whatsapp_number, welcome_message, cart_welcome_message, delivery_info")
    .limit(1)
    .maybeSingle()

  if (error) console.error("store_settings:", error.message)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Configuración</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Datos de la tienda</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            key={`${settings?.whatsapp_number}-${settings?.welcome_message}-${settings?.cart_welcome_message}-${settings?.delivery_info}`}
            initial={{
              whatsapp_number: settings?.whatsapp_number ?? "",
              welcome_message: settings?.welcome_message ?? "",
              cart_welcome_message: settings?.cart_welcome_message ?? "",
              delivery_info: settings?.delivery_info ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
