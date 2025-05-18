/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ContentData } from "@/types/api"
import MainContent from "@/components/common/Content"
import { AlertCircle } from "lucide-react"
import { RouteConfig } from "@/types"

interface AlertProps {
  variant?: "default" | "destructive" | "success"
  children: React.ReactNode
}

const Alert = ({ variant = "default", children }: AlertProps) => {
  const baseStyles = "p-4 rounded-lg flex items-center gap-3"
  const variantStyles = {
    default: "bg-gray-100 border border-gray-200 text-gray-800",
    destructive: "bg-red-50 border border-red-200 text-red-800",
    success: "bg-green-50 border border-green-200 text-green-800",
  }

  return <div className={`${baseStyles} ${variantStyles[variant]}`}>{children}</div>
}

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-semibold">{children}</h3>
)

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm">{children}</p>
)

export default function ContentPage() {
  const searchParams = useSearchParams()
  const [contentData, setContentData] = useState<ContentData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const contentParam = searchParams.get("content")

    if (!contentParam) {
      setError("No content parameter provided in the URL")
      setIsLoading(false)
      return
    }

    try {
      // Decode base64 encoded content using atob
      const decodedContent = atob(contentParam)
      const parsedContent = JSON.parse(decodedContent)
        console.log(parsedContent);
        
      // Validate structure
      if (!validateContentStructure(parsedContent)) {
        setError("Invalid content structure. Please check the data format.")
        setIsValid(false)
        setIsLoading(false)
        return
      }

      // Set the content data if valid
      setContentData(parsedContent)
      setIsValid(true)
      setError(null)
    } catch (err) {
      setError(
        `Error processing content: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      setIsValid(false)
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  // Function to validate the content structure
  function validateContentStructure(data: any): boolean {
    if (!data || typeof data !== "object") return false
    if (!Array.isArray(data)) return false

    for (const item of data) {
      if (typeof item !== "object") return false
      if (typeof item.heading !== "string") return false
      if (!Array.isArray(item.content)) return false

    //   for (const contentItem of item.content) {
    //     if (!validateDocumentContent(contentItem)) return false
    //   }
    }

    return true
  }

  // Function to validate a single DocumentContent item
  function validateDocumentContent(item: any): boolean {
    if (!item || typeof item !== "object") return false
    if (!item.type || !item.content) return false

    switch (item.type) {
      case "paragraph":
      case "heading2":
      case "heading3":
      case "iframe":
        return typeof item.content.data === "string"
      case "image":
        return item.content.data === null || typeof item.content.data === "string"
      case "codeBlock":
        return (
          typeof item.content.data === "string" &&
          (item.content.language === undefined ||
            typeof item.content.language === "string")
        )
      case "quote":
      case "warningBox":
        return typeof item.content.data === "string"
      default:
        return false
    }
  }

  return (
    <div className="w-full max-w-7xl mx-0 sm:mx-auto">
      <div className="py-8 px-4 sm:px-6 lg:px-8 w-full">
        { error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isValid && contentData ? (
          <>
            <div>
              <MainContent
                articleData={{id:'',content_data:contentData,created_at:'',updated_at:'',subtopic_id:''}}
                type="blog"
                routeTopic={null as unknown as RouteConfig}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Waiting for content...
          </div>
        )}
      </div>
    </div>
  )
}