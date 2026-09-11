import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CartProvider } from "@/components/storefront/CartProvider"

export const metadata: Metadata = {
  title: {
    default: "Furia Suplementos - Suplementos Deportivos",
    template: "%s | Furia Suplementos",
  },
  description:
    "Catálogo de suplementos deportivos: proteínas, creatinas, pre-entrenos y más. Envío por WhatsApp.",
}

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient()
  const { data: settings, error: settingsError } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle()

  if (settingsError) console.error("store_settings:", settingsError.message)

  const whatsappNumber = settings?.whatsapp_number ?? ""

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Furia<span className="text-primary">Suplementos</span>
          </Link>
          <CartProvider
            whatsappNumber={whatsappNumber}
            welcomeMessage={settings?.welcome_message}
            deliveryInfo={settings?.delivery_info}
          />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4">
          © {new Date().getFullYear()} Furia Suplementos. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  )
}
