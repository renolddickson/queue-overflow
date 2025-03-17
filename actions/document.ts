/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

import { SubTopic, Topics } from "@/types/api";
import { ApiSingleResponse, ApiResponse, ImageUrl } from "@/types/api";
import { createClient } from "@/utils/supabase";
import { getUid } from "./auth";

export async function fetchData<T>({
  table,
  filter,
}: {
  table: string;
  filter?: Record<string, any>;
  search?: string
}): Promise<ApiResponse<T>> {
  const supabase = await createClient();

  let query = supabase.from(table).select('*', { count: 'exact' });

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
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

  return { success: true, data: (topicsWithSubtopics as Topics[]), totalCount: topicsWithSubtopics.length };
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
  return { success: true, data: topic };
}

export async function deleteTopic(topicId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();
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

  return { success: true, data: subTopic };
}

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

export async function deleteSubTopic(subTopicId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();

  // First, delete all content rows that reference the subtopic
  const { error: contentError } = await supabase
    .from('contents')
    .delete()
    .eq('ref_id', subTopicId);

  if (contentError) {
    throw new Error(`Delete content failed: ${contentError.message}`);
  }

  // Then, delete the subtopic itself
  const { error: subtopicError } = await supabase
    .from('subtopics')
    .delete()
    .eq('id', subTopicId)
    .single();

  if (subtopicError) {
    throw new Error(`Delete subtopic failed: ${subtopicError.message}`);
  }

  return { success: true, data: null };
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

export async function uploadImage(table: string, imageData: ImageUrl): Promise<string> {
  const supabase = await createClient()
  const { fileName, fileContent } = imageData
  const match = fileContent.match(/^data:(.*?);base64,(.*)$/)

  if (!match) {
    throw new Error("Invalid base64 content in image_url")
  }

  const [, contentType, base64Data] = match

  const uniqueFileName = `${Date.now()}_${fileName}`
  const filePath = `${await getUid()}/${uniqueFileName}`

  const { error: fileError } = await supabase.storage.from(table).upload(filePath, Buffer.from(base64Data, "base64"), {
    contentType,
    cacheControl: "3600",
  })

  if (fileError) {
    throw new Error(`File upload failed: ${fileError.message}`)
  }

  const { data: publicUrlData } = supabase.storage.from(table).getPublicUrl(filePath)

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Failed to retrieve public URL")
  }

  return publicUrlData.publicUrl
}

export async function deleteImagesFromStorage(imageLinks: string[]): Promise<void> {
  const supabase = await createClient();

  for (const link of imageLinks) {
    try {
      const url = new URL(link);
      // Split and filter the URL path
      const segments = url.pathname.split('/').filter(Boolean);

      let bucket: string;
      let filePath: string;

      // Check if URL contains the "public" segment
      if (segments[2] === 'object' && segments[3] === 'public') {
        bucket = segments[4];
        filePath = segments.slice(5).join('/');
      } else {
        bucket = segments[3];
        filePath = segments.slice(4).join('/');
      }
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        console.error(`Error deleting image at ${link}: ${error.message}`);
      } else {
        console.log(`Successfully deleted image: ${link}`);
      }
    } catch (err) {
      console.error(`Error processing link ${link}:`, err);
    }
  }
}

export async function fetchAllFeeds(searchData?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('documents')
    .select(`
    id,
    title,
    type,
    description,
    cover_image,
    user:users(user_name, profile_image, display_name)
  `);
  query = query.eq('isPublished', true);

  if (searchData) {
    query = query.or(`title.ilike.%${searchData}%,description.ilike.%${searchData}%`);
  }
  return await query;
}