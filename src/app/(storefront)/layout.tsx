import type { Metadata } from "next"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { CartProvider } from "@/components/storefront/CartProvider"
import { Toaster } from "@/components/ui/sonner"
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp"

export const metadata: Metadata = {
  title: {
    default: "Furia Suplementos - Suplementos Deportivos",
    template: "%s | Furia Suplementos",
  },
  description:
    "Catálogo de suplementos deportivos: proteínas, creatinas, pre-entrenos y más. Envío por WhatsApp.",
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "")
  if (!d) return ""
  const local = d.startsWith("549") ? d.slice(3) : d.startsWith("54") ? d.slice(2) : d
  const area = local.slice(0, 3)
  const rest = local.slice(3)
  return `${area} ${rest.slice(0, 3)}-${rest.slice(3)}`
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
  const waHref = whatsappNumber
    ? buildWhatsAppUrl(whatsappNumber, settings?.welcome_message || "Hola!")
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-40 border-b border-white/8">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper-500/45 to-transparent" />
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link
            href="/"
            aria-label="Furia Suplementos — inicio"
            className="flex shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-copper-400/60 rounded-lg"
          >
            {/* Lockup sin tagline: la proportion horizontal no entra en 64px */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-lockup.png"
              alt="Furia Suplementos"
              width={1390}
              height={987}
              className="h-11 w-auto object-contain drop-shadow-[0_2px_14px_rgba(212,163,115,0.35)]"
            />
          </Link>

          <div className="flex items-center gap-2">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-foreground transition-colors hover:border-neon/40 hover:bg-neon/10 hover:text-neon-soft sm:inline-flex"
              >
                <MessageCircle className="size-4 text-neon" />
                {formatPhone(whatsappNumber)}
              </a>
            )}
            <CartProvider
              whatsappNumber={whatsappNumber}
              cartWelcomeMessage={settings?.cart_welcome_message}
              deliveryInfo={settings?.delivery_info}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-white/8 bg-ink-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xs">
              {/* Lockup completo: acá el tagline sí se lee */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="Furia Suplementos"
                width={1600}
                height={1139}
                className="h-20 w-auto object-contain"
              />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Suplementos deportivos de alta performance. Armá tu pedido y
                mandalo por WhatsApp.
              </p>
            </div>

            {waHref && (
              <div className="max-w-xs">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-400">
                  Contacto
                </h3>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-neon-soft"
                >
                  <MessageCircle className="size-4 text-neon" />
                  {formatPhone(whatsappNumber)}
                </a>
                {settings?.delivery_info && (
                  <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                    {settings.delivery_info}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 border-t border-white/8 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Furia Suplementos. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>

      <Toaster position="top-center" />
    </div>
  )
}
