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
  publish_state: 'published' | 'draft' | 'unlisted'
  type: 'docs' | 'posts'
  description: string
  cover_image?: string
  updated_at?: string
  upvotes?: number
  comments_count?: number
  shares_count?: number
  category?: string
  content_ref_id?: string
}

export type FeedData = DocumentData & { user: Partial<User> };
export interface ContentData { heading?: string, content: DocumentContent[] }
export interface ContentRecord {
  id: string
  content_data: ContentData[]
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
  position: number
  content_ref_id?: string
}

export interface Topics {
  id: string
  title: string
  position: number
  icon: string
  content_ref_id?: string
  subTopics: SubTopic[]
}
