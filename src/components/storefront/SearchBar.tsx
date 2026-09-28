"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  const applySearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term.trim()) {
      params.set("search", term.trim())
    } else {
      params.delete("search")
    }
    router.push(`/?${params.toString()}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applySearch(value)
  }

  const handleClear = () => {
    setValue("")
    applySearch("")
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-copper-400"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nombre o marca..."
        aria-label="Buscar productos"
        className="h-12 rounded-full border-white/10 bg-titanium/60 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus-visible:border-copper-400/70 focus-visible:ring-4 focus-visible:ring-copper-400/15"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-copper-400/60 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  )
}
