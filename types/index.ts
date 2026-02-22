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
  | 'iframe'
  | 'image'
  | 'divider';

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
export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export interface CodeBlockContent {
  config: {
    language: string;
    activeFile?: number;
  };
  data: string;
  files?: CodeFile[];
}

export interface ImageBlockContent {
  data: string | null;
  config?: {
    fit?: 'cover' | 'contain' | 'fill';
    caption?: string;
    alt?: string;
    position?: 'left' | 'center' | 'right';
    crop?: any;
  }
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

export type DocumentContent =
  | { type: 'paragraph'; content: { data: string } }
  | { type: 'heading2'; content: { data: string } }
  | { type: 'heading3'; content: { data: string } }
  | { type: 'codeBlock'; content: CodeBlockContent }
  | { type: 'quote'; content: QuotesBlockContent }
  | { type: 'iframe'; content: { data: string } }
  | { type: 'image'; content: ImageBlockContent }
  | { type: 'divider'; content: { data: null } }
  | { type: 'warningBox'; content: WarningBoxContent };

export type PlatformType = "webapp" | "ios" | "android"

export type TOC = {id:string,text:string | null,level:number}