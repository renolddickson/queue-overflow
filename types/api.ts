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
    name?: string;
    username?: string;
  }
  export interface DocumentData {
    id: string
    title: string
    description: string
    cover_image: string
    updated_at: string
  }