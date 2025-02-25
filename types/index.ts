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
  publishDate: string
}

export type ContentType =
  | 'paragraph'
  | 'heading2'
  | 'heading3'
  | 'warningBox'
  | 'codeBlock'
  | 'quote'
  | 'table'
  | 'graph'
  | 'accordion'
  | 'tab';

  interface ContentObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
  
  type ContentArray = ContentObject[];
  
  interface supportTopic {
    id: string
    title: string
  }
  export interface Article {
    meta: ArticleMeta;
    title: string;
    content: DocumentContent[];
    nextTopic?: supportTopic;
    prevTopic?: supportTopic;
    relatedArticles?: supportTopic[];
  }
  
  export interface DocumentContent {
    type: ContentType;
    content: string | ContentObject | ContentArray;
  }

export type PlatformType = "webapp" | "ios" | "android"

export type TOC = {id:string,text:string | null,level:number}