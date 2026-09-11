"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type DeleteProductButtonProps = {
  productId: string
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este producto y todas sus variantes?")) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from("product_variants").delete().eq("product_id", productId)
    await supabase.from("products").delete().eq("id", productId)
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive"
      aria-label="Eliminar producto"
    >
      <Trash2 className="size-4" />
    </Button>
  )
}