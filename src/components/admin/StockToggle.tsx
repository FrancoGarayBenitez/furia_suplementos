"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Switch } from "@/components/ui/switch"

type StockToggleProps = {
  productId: string
  checked: boolean
}

export function StockToggle({ productId, checked }: StockToggleProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async (value: boolean) => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("products")
      .update({ is_active: value })
      .eq("id", productId)
    router.refresh()
    setLoading(false)
  }

  return (
    <Switch
      checked={checked}
      onCheckedChange={handleToggle}
      disabled={loading}
    />
  )
}