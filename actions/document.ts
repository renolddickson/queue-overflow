/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { ApiSingleResponse, ApiResponse, User } from "@/types/api";
import { createClient } from "@/utils/supabase";

export async function fetchData<T>({
  table,
  filter,
  search
}: {
  table: string;
  filter?: Record<string, any>[];
  search?: string
}): Promise<ApiResponse<T>> {
  const supabase = await createClient();
  
  let query = supabase.from(table).select('*', { count: 'exact' });

  if (filter) {
    filter.forEach((filterObj) => {
      Object.entries(filterObj).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    });
  }
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  const { data, count, error } = await query;

  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return { success: true, data: data || [], totalCount: count || 0 };
}

export async function submitData<T>(table: string, formData: Record<string, any>): Promise<ApiResponse<T>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from(table).insert(formData).select()

  if (error) throw new Error(`Insert failed: ${error.message}`)
  return { success: true, data: (data as T[]) || [], totalCount: 0 }
}

export async function updateData<T>(table: string, id: string, formData: Record<string, any>): Promise<ApiResponse<T>> {
  const supabase = await createClient()

  const { data, error } = await supabase.from(table).update(formData).eq("id", id).select()

  if (error) throw new Error(`Update failed: ${error.message}`)
  return { success: true, data: (data as T[]) || [], totalCount: 0 }
}

export async function deleteData(
  table: string,
  id: string
): Promise<ApiResponse<any>> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) throw new Error(`Delete failed: ${error.message}`);
  return { success: true, message: `Record #${id} deleted from ${table}`, data: [], totalCount: 0 };
}

export async function fetchUserData(id: string): Promise<ApiSingleResponse<User>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').select('*').eq('user_id', id).single();
  console.log(data)
  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return { success: true, data: data as User };
}

export async function getUid() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Error fetching UID: ${error.message}`);
  return data.user?.id || null;
}