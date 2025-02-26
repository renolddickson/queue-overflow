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

  export interface supportTopic {
    id: string
    title: string
  }
  export type RouteConfig = {next:supportTopic,previous:supportTopic}
  export interface Article {
    meta: ArticleMeta;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: DocumentContent<any>[];
    routeTopic?: RouteConfig;
    relatedArticles?: supportTopic[];
  }
  
  export interface DocumentContent<T> {
    type: ContentType;
    content: {
      config: T;
      data: T;
    };
  }

export type PlatformType = "webapp" | "ios" | "android"

export type TOC = {id:string,text:string | null,level:number}