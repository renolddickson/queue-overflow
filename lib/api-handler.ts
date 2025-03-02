
'use server'

import { ApiSingleResponse,ApiResponse, User } from "@/types/api";
import { createClient } from "@/utils/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitData<T>(table: string, formData: Record<string, any>): Promise<ApiResponse<T>> {
    const supabase = await createClient()
    const { data, error } = await supabase.from(table).insert(formData).select()
  
    if (error) throw new Error(`Insert failed: ${error.message}`)
    return { success: true, data: (data as T[]) || [], totalCount: 0 }
}
export async function fetchUserData(id:string): Promise<ApiSingleResponse<User>> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*').eq('user_id', id).single();
  
    if (error) throw new Error(`Fetch failed: ${error.message}`);
    return { success: true, data: data as User };
  }
  export async function getUid() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw new Error(`Error fetching UID: ${error.message}`);
    return data.user?.id || null;
  }