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
    name?: string;
    username?: string;
  }