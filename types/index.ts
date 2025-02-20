import type React from "react"
export interface NavigationItem {
  title: string
  isActive?: boolean
}

export interface NavigationSection {
  title: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
  items: NavigationItem[]
}

export interface ArticleMeta {
  readingTime: string
  publishDate: string
  level: "Beginner" | "Intermediate" | "Advanced"
}

export interface Article {
  meta: ArticleMeta
  title: string
  content: string
  topics: string[]
  relatedArticles: string[]
}

export type PlatformType = "webapp" | "ios" | "android"

