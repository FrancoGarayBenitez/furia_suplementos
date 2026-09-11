"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

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

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => selectCategory(null)}
        className={cn(
          "rounded-full border px-3 py-1 text-sm transition-colors",
          !activeCategory
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input hover:bg-muted"
        )}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => selectCategory(cat.slug)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            activeCategory === cat.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input hover:bg-muted"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
