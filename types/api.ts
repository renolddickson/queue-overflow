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
    image?: string;
    user_name?: string;
  }
  export interface DocumentData {
    id: string
    title: string
    description: string
    cover_image: string
    updated_at: string
  }

  export interface ContentRecord {
    id:string
    content_data:{heading:string,content: DocumentContent[]}[]
    subtopic_id:string
    updated_at: string
    created_at: string
  }