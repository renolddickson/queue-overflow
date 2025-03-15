import { DocumentContent } from ".";

export interface ApiResponse<T> {
    data: T[];         // data is an array
    totalCount: number;
    success: boolean;
    message?: string;
  }
  export interface ApiSingleResponse<T> {
    data: T;
    success: boolean;
    message?: string;
  }
  export interface User {
    id: string;
    user_id: string;
    email: string;
    user_name?: string;
    display_name: string;
    profile_image?: string;
    banner_image?: string;
  }
  export interface DocumentData {
    id: string
    title: string
    isPublished: boolean
    type: 'blog' | 'doc'
    description: string
    cover_image?: string
    updated_at?: string
  }

  export type FeedData = DocumentData & { user: Partial<User> };

  export interface ContentRecord {
    id:string
    content_data:{heading:string,content: DocumentContent[]}[]
    subtopic_id:string
    updated_at: string
    created_at: string
  }
  export interface ImageUrl {
    fileName: string
    fileContent: string
  }
  export interface SubTopic {
    id: string
    title: string
    position:number
  }
  
  export interface Topics {
    id: string
    title: string
    position:number
    icon: string
    subTopics: SubTopic[]
  }
  