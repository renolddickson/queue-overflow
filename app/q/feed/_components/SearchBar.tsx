"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

type SearchBarProps = {
  currentSearch: string
  currentCategory: string
  currentPage: number
}

export default function SearchBar({ currentSearch, currentCategory, currentPage }: SearchBarProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (query: string) => {
    startTransition(() => {
      const params = new URLSearchParams()

      if (query) {
        params.set("search", query)
      }

      if (currentCategory !== "All") {
        params.set("category", currentCategory)
      }

      // Reset to page 1 when search changes
      params.set("page", "1")

      router.push(`/q/feed?${params.toString()}`)
    })
  }

  return (
    <div className="relative mb-4">
      <Input
        type="text"
        placeholder="Search docs..."
        className="w-full h-10 pl-10 pr-4"
        defaultValue={currentSearch}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      {isPending && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

