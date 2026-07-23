"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

type PaginationProps = {
  currentPage: number
  totalPages: number
  currentCategory: string
  currentSearch: string
}

export default function Pagination({ currentPage, totalPages, currentCategory, currentSearch }: PaginationProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams()

      params.set("page", page.toString())

      if (currentCategory !== "All") {
        params.set("category", currentCategory)
      }

      if (currentSearch) {
        params.set("search", currentSearch)
      }

      router.push(`/integrations?${params.toString()}`)
    })
  }

  return (
    <div className="flex justify-center items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

