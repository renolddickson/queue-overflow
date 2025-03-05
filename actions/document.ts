/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { SubTopic, Topics } from "@/types";
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
  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return { success: true, data: data as User };
}

export async function getUid() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Error fetching UID: ${error.message}`);
  return data.user?.id || null;
}

export async function fetchTopics(docId: string): Promise<ApiResponse<Topics>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('topics')
    .select('id, title, icon, position, subtopics:subtopics(id, title, position)')
    .eq('document_id', docId)
    .order('position', { ascending: true });

  if (error) throw new Error(`Fetch failed: ${error.message}`);

  const topicsWithSubtopics: Topics[] = data?.map(topic => ({
    id: topic.id,
    title: topic.title,
    icon: topic.icon,
    position: topic.position,
    subTopics: (topic.subtopics || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        position: sub.position
      })),
  })) || [];

  return { success: true, data:( topicsWithSubtopics as Topics[]), totalCount: topicsWithSubtopics.length };
}

export async function addTopic(
  docId: string,
  newTopic: { title: string; icon: string; position: number }
): Promise<ApiSingleResponse<Topics>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('topics')
    .insert([{ document_id: docId, ...newTopic }])
    .select('*')
    .single();

  if (error) throw new Error(`Add topic failed: ${error.message}`);
  if (!data) throw new Error("No data returned after adding topic");

  const topic: Topics = {
    id: data['id'],
    title: data['title'],
    icon: data['icon'],
    position: data['position'],
    subTopics: [],
  };

  return { success: true, data: topic };
}

// Update an existing topic
export async function updateTopic(
  topicId: string,
  updatedFields: { title?: string; icon?: string; position?: number }
): Promise<ApiSingleResponse<Topics>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('topics')
    .update(updatedFields)
    .eq('id', topicId)
    .select('*')
    .single();

  if (error) throw new Error(`Update topic failed: ${error.message}`);
  if (!data) throw new Error("No data returned after update topic");
  // Note: We do not update subtopics in this call.
  const topic: Topics = {
    id: data['id'],
    title: data['title'],
    icon: data['icon'],
    position: data['position'],
    subTopics: data['subtopics'] || [],
  };
  return { success: true, data: topic};
}

// Delete a topic (and its subtopics)
export async function deleteTopic(topicId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();

  // Delete subtopics first if cascade is not enabled.
  const { error: subError } = await supabase
    .from('subtopics')
    .delete()
    .eq('topic_id', topicId);
  if (subError) throw new Error(`Delete subtopics failed: ${subError.message}`);

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId)
    .single();

  if (error) throw new Error(`Delete topic failed: ${error.message}`);
  return { success: true, data: null };
}

// Add a new subtopic to a topic
export async function addSubTopic(
  topicId: string,
  newSubTopic: { title: string; position: number }
): Promise<ApiSingleResponse<SubTopic>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subtopics')
    .insert([{ topic_id: topicId, ...newSubTopic }])
    .select('*')
    .single();

  if (error) throw new Error(`Add subtopic failed: ${error.message}`);
  if (!data) throw new Error("No data returned after adding subtopic");

  const subTopic: SubTopic = {
    id: data['id'],
    title: data['title'],
    position: data['position'],
  };

  return { success: true, data: subTopic};
}

// Update an existing subtopic
export async function updateSubTopic(
  subTopicId: string,
  updatedFields: { title?: string; position?: number }
): Promise<ApiSingleResponse<SubTopic>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subtopics')
    .update(updatedFields)
    .eq('id', subTopicId)
    .select('*')
    .single();

  if (error) throw new Error(`Update subtopic failed: ${error.message}`);
  if (!data) throw new Error("No data returned after update subtopic");

  const subTopic: SubTopic = {
    id: data['id'],
    title: data['title'],
    position: data['position'],
  };
  
  return { success: true, data: subTopic };
}

// Delete a subtopic
export async function deleteSubTopic(subTopicId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subtopics')
    .delete()
    .eq('id', subTopicId)
    .single();

  if (error) throw new Error(`Delete subtopic failed: ${error.message}`);
  return { success: true, data: null};
}

export async function bulkDeleteData(
  table: string,
  ids: string[]
): Promise<ApiResponse<any>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .delete()
    .in('id', ids);

  if (error) throw new Error(`Bulk delete failed: ${error.message}`);
  return { success: true, message: 'Items deleted successfully', data: data || [], totalCount: 0 };
}

export async function fetchBySubTopicId<T>(
  table: string,
  field: string,
  subTopicId: string
): Promise<ApiSingleResponse<T | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(field, subTopicId)
    .maybeSingle();

  if (error) throw new Error(`Fetch single data failed: ${error.message}`);
  return { success: true, data: data as T | null };
}

