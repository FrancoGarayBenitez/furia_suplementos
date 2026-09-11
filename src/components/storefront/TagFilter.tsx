"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function TagFilter({
  tags,
  activeTag,
}: {
  tags: string[]
  activeTag: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectTag = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set("tag", tag)
    } else {
      params.delete("tag")
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => selectTag(activeTag === tag ? null : tag)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            activeTag === tag
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input hover:bg-muted"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
