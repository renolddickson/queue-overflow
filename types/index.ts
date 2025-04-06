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
  | 'iframe';

  export interface supportTopic {
    id: string
    title: string
  }
  export type RouteConfig = {next:supportTopic | null,prev:supportTopic | null}
  export interface Article {
    meta: ArticleMeta;
    title: string;
    content: DocumentContent[];
    routeTopic?: RouteConfig;
    relatedArticles?: supportTopic[];
  }
 export type DocumentContent =
  | { type: 'paragraph'; content: { data: string } }
  | { type: 'heading2'; content: { data: string } }
  | { type: 'heading3'; content: { data: string } }
  | { type: 'codeBlock'; content: CodeBlockContent }
  | { type: 'quote'; content: QuotesBlockContent }
  | { type: 'iframe'; content: { data: string } }
  | { type: 'warningBox'; content: WarningBoxContent };

export type PlatformType = "webapp" | "ios" | "android"

export type TOC = {id:string,text:string | null,level:number}

export interface CodeBlockContent {
  config: {
    language: string;
  };
  data: string;
}

export interface QuotesBlockContent {
  config: {
    author?: string;
  };
  data: string;
}

export interface WarningBoxContent {
  config: {
    type: 'info' | 'warning' | 'error' | 'note' | 'tip';
    design: 1 | 2
  };
  data: string;
}