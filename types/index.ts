export interface SubTopic {
  title: string
  isActive?: boolean
  id: string
}

export interface Topics {
  title: string
  icon: string
  id: string
  isActive?: boolean
  subTopics: SubTopic[]
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

export type TOC = {id:string,text:string | null,level:number}