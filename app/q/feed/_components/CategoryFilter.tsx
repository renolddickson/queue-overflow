"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

type CategoryFilterProps = {
  categories: string[]
  selectedCategory: string
}

export default function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleCategoryChange = (category: string) => {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search)

      if (category === "All") {
        params.delete("category")
      } else {
        params.set("category", category)
      }

      // Reset to page 1 when category changes
      params.set("page", "1")

      router.push(`/q/feed?${params.toString()}`)
    })
  }

  return (
    <aside className="flex flex-col w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Categories</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 p-4 pt-0">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              className="w-full justify-start text-sm py-1 px-2 h-auto"
              onClick={() => handleCategoryChange(category)}
              disabled={isPending}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  )
}

