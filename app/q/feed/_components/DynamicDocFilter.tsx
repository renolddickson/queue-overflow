"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

/** A single filter option (one checkbox/radio) */
type FilterOption = {
  value: string
  label: string
  count?: number
}

/** A group of related filter options (e.g. Category, Subject, Language, etc.) */
type FilterGroup = {
  title: string
  param: string // The query param name (e.g. "category", "subjects", "languages")
  type: "checkbox" | "radio" // Multi-select or single-select
  options: FilterOption[]
}

type DynamicDocFilterProps = {
  filterGroups: FilterGroup[]
  selectedFilters: { [param: string]: string[] }
}

export default function DynamicDocFilter({ filterGroups, selectedFilters }: DynamicDocFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  /**
   * Toggle or set the filter in the query string.
   * For checkboxes, we toggle values in an array.
   * For radio, we set exactly one value.
   */
  const handleFilterChange = (param: string, type: "checkbox" | "radio", value: string) => {
    startTransition(() => {
      // Create a new URLSearchParams instance from the current search params
      const params = new URLSearchParams(searchParams.toString())
      const currentValues = params.get(param)?.split(",") ?? []

      let updatedValues: string[] = []

      if (type === "checkbox") {
        // Toggle the clicked value
        if (currentValues.includes(value)) {
          updatedValues = currentValues.filter((v) => v !== value)
        } else {
          updatedValues = [...currentValues, value]
        }
      } else {
        // Radio: single-select
        updatedValues = [value]
      }

      // If empty, remove the param, else set it
      if (updatedValues.length === 0) {
        params.delete(param)
      } else {
        params.set(param, updatedValues.join(","))
      }

      // Reset pagination
      params.set("page", "1")

      // Update the URL
      router.push(`/q/feed?${params.toString()}`)
    })
  }

  return (
    <aside className="flex flex-col w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
      </div>
      <div className="flex-1 overflow-auto space-y-6 px-4">
        {filterGroups.map((group) => {
          const { title, param, type, options } = group
          const selectedValues = selectedFilters[param] || []

          return (
            <div key={param}>
              <h3 className="text-md font-medium mb-2">{title}</h3>
              {options.map((option) => {
                const isChecked = selectedValues.includes(option.value)
                const inputType = type === "checkbox" ? "checkbox" : "radio"

                return (
                  <label key={option.value} className="flex items-center space-x-2 mb-2">
                    <input
                      type={inputType}
                      name={param} // ensures radio groups behave correctly
                      checked={isChecked}
                      onChange={() => handleFilterChange(param, type, option.value)}
                      disabled={isPending}
                    />
                    <span>
                      {option.label}
                      {option.count !== undefined ? ` (${option.count})` : ""}
                    </span>
                  </label>
                )
              })}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

