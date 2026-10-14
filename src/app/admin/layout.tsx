import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Toaster } from "@/components/ui/sonner"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="font-bold">Furia Suplementos · Admin</span>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/admin/dashboard"
                className="rounded px-2 py-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                Productos
              </Link>
              <Link
                href="/admin/settings"
                className="rounded px-2 py-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                Configuración
              </Link>
            </nav>
          </div>
          <AdminLogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  )
}