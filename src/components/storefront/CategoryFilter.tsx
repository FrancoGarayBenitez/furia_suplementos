"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

const pillBase =
  "shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-copper-400/60"

const pillIdle =
  "border-white/10 bg-titanium/50 text-muted-foreground hover:border-copper-500/50 hover:bg-titanium hover:text-foreground"

const pillActive =
  "border-copper-500/70 bg-copper-400/15 text-copper-100 shadow-[inset_0_0_20px_rgba(212,163,115,0.12)]"

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category")

  const selectCategory = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    router.push(`/?${params.toString()}`)
  }

  const options: { slug: string | null; label: string }[] = [
    { slug: null, label: "Todos" },
    ...categories.map((cat) => ({ slug: cat.slug as string | null, label: cat.name })),
  ]

  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
    >
      {options.map((opt) => {
        const isActive = opt.slug === null ? !activeCategory : activeCategory === opt.slug
        return (
          <button
            key={opt.slug ?? "all"}
            type="button"
            aria-pressed={isActive}
            onClick={() => selectCategory(opt.slug)}
            className={cn(pillBase, isActive ? pillActive : pillIdle)}
          >
            {isActive && (
              <span
                aria-hidden
                className="mr-1.5 inline-block size-1.5 rounded-full bg-copper-300 align-middle"
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
