/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

import { SubTopic, Topics } from "@/types/api";
import { ApiSingleResponse, ApiResponse, ImageUrl } from "@/types/api";
import { createClient } from "@/utils/supabase";
import { getUid } from "./auth";

const TYPE_MAP: Record<string, string> = {
  'posts': 'post',
  'docs': 'doc',
  'post': 'posts',
  'doc': 'docs'
};

const mapTypeForDb = (data: any) => {
  if (data.type && TYPE_MAP[data.type] && (data.type === 'posts' || data.type === 'docs')) {
    return { ...data, type: TYPE_MAP[data.type] };
  }
  return data;
};

const mapTypeFromDb = (data: any) => {
  if (data && data.type && TYPE_MAP[data.type] && (data.type === 'post' || data.type === 'doc')) {
    return { ...data, type: TYPE_MAP[data.type] };
  }
  return data;
};

export async function fetchData<T>({
  table,
  filter,
  select = '*',
}: {
  table: string;
  filter?: Record<string, any>;
  search?: string;
  select?: string;
}): Promise<ApiResponse<T>> {
  const supabase = await createClient();

  let query = supabase.from(table).select(select, { count: 'exact' });

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      let val = value;
      if (table === 'documents' && key === 'type' && TYPE_MAP[value]) {
        val = TYPE_MAP[value];
      }
      query = query.eq(key, val);
    });
  }

  const { data, count, error } = await query;

  if (error) throw new Error(`Fetch failed: ${error.message}`);

  const mappedData = table === 'documents'
    ? (data || []).map(item => mapTypeFromDb(item))
    : (data || []);

  return { success: true, data: mappedData as T[], totalCount: count || 0 };
}

export async function submitData<T>(table: string, formData: Record<string, any>): Promise<ApiResponse<T>> {
  const supabase = await createClient()
  const dataToInsert = table === 'documents' ? mapTypeForDb(formData) : formData;
  const { data, error } = await supabase.from(table).insert(dataToInsert).select()

  if (error) throw new Error(`Insert failed: ${error.message}`)

  const mappedData = table === 'documents'
    ? (data || []).map(item => mapTypeFromDb(item))
    : (data || []);

  return { success: true, data: (mappedData as T[]), totalCount: 0 }
}

export async function updateData<T>(table: string, id: string, formData: Record<string, any>): Promise<ApiResponse<T>> {
  const supabase = await createClient()
  const dataToUpdate = table === 'documents' ? mapTypeForDb(formData) : formData;
  const { data, error } = await supabase.from(table).update(dataToUpdate).eq("id", id).select()

  if (error) throw new Error(`Update failed: ${error.message}`)

  const mappedData = table === 'documents'
    ? (data || []).map(item => mapTypeFromDb(item))
    : (data || []);

  return { success: true, data: (mappedData as T[]), totalCount: 0 }
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
    .from('sections')
    .select('id, title, position, parent_id')
    .eq('document_id', docId)
    .order('position', { ascending: true });

  if (error) throw new Error(`Fetch failed: ${error.message}`);

  const rootSections = data?.filter(s => !s.parent_id) || [];
  const topicsWithSubtopics: Topics[] = rootSections.map(topic => ({
    id: topic.id,
    title: topic.title,
    icon: "FileText", // Default icon as it's missing in new schema
    position: topic.position,
    subTopics: (data?.filter(s => s.parent_id === topic.id) || [])
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
    .from('sections')
    .insert([{ document_id: docId, title: newTopic.title, position: newTopic.position }])
    .select('*')
    .single();

  if (error) throw new Error(`Add section failed: ${error.message}`);
  if (!data) throw new Error("No data returned after adding section");

  const topic: Topics = {
    id: data['id'],
    title: data['title'],
    icon: "FileText",
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
    .from('sections')
    .update({ title: updatedFields.title, position: updatedFields.position })
    .eq('id', topicId)
    .select('*')
    .single();

  if (error) throw new Error(`Update section failed: ${error.message}`);
  if (!data) throw new Error("No data returned after update section");

  const topic: Topics = {
    id: data['id'],
    title: data['title'],
    icon: "FileText",
    position: data['position'],
    subTopics: [], // Subtopics are handled separately or fetched again
  };
  return { success: true, data: topic };
}

export async function deleteTopic(topicId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();

  // 1. Get all sub-sections to find their content_ref_ids
  const { data: subSections } = await supabase
    .from('sections')
    .select('id, content_ref_id')
    .eq('parent_id', topicId);

  // 2. Get the main topic's content_ref_id
  const { data: topic } = await supabase
    .from('sections')
    .select('content_ref_id')
    .eq('id', topicId)
    .single();

  // 3. Delete sub-sections
  const { error: subError } = await supabase
    .from('sections')
    .delete()
    .eq('parent_id', topicId);
  if (subError) throw new Error(`Delete sub-sections failed: ${subError.message}`);

  // 4. Delete the main section
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', topicId);

  if (error) throw new Error(`Delete section failed: ${error.message}`);

  // 5. Cleanup contents
  const contentIdsToCleanup = [
    ...(topic?.content_ref_id ? [topic.content_ref_id] : []),
    ...(subSections?.map(s => s.content_ref_id).filter(Boolean) || [])
  ];

  if (contentIdsToCleanup.length > 0) {
    await supabase.from('contents').delete().in('id', contentIdsToCleanup);
  }

  return { success: true, data: null };
}

export async function addSubTopic(
  topicId: string,
  newSubTopic: { title: string; position: number }
): Promise<ApiSingleResponse<SubTopic>> {
  const supabase = await createClient();

  // Get document_id from parent section
  const { data: parent } = await supabase.from('sections').select('document_id').eq('id', topicId).single();
  if (!parent) throw new Error("Parent section not found");

  const { data, error } = await supabase
    .from('sections')
    .insert([{
      parent_id: topicId,
      document_id: parent.document_id,
      title: newSubTopic.title,
      position: newSubTopic.position
    }])
    .select('*')
    .single();

  if (error) throw new Error(`Add sub-section failed: ${error.message}`);
  if (!data) throw new Error("No data returned after adding sub-section");

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
    .from('sections')
    .update(updatedFields)
    .eq('id', subTopicId)
    .select('*')
    .single();

  if (error) throw new Error(`Update sub-section failed: ${error.message}`);
  if (!data) throw new Error("No data returned after update sub-section");

  const subTopic: SubTopic = {
    id: data['id'],
    title: data['title'],
    position: data['position'],
  };

  return { success: true, data: subTopic };
}

export async function deleteSubTopic(subTopicId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();

  // Get the content_ref_id before deleting the section
  const { data: section } = await supabase
    .from('sections')
    .select('content_ref_id')
    .eq('id', subTopicId)
    .single();

  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', subTopicId);

  if (error) {
    throw new Error(`Delete section failed: ${error.message}`);
  }

  // Cleanup content if exists
  if (section?.content_ref_id) {
    await supabase.from('contents').delete().eq('id', section.content_ref_id);
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
  query = query.eq('publish_state', 'published');

  if (searchData) {
    query = query.or(`title.ilike.%${searchData}%,description.ilike.%${searchData}%`);
  }
  
  query = query.limit(24);

  const res = await query;
  if (res.data) {
    res.data = res.data.map(item => mapTypeFromDb(item));
  }
  return res;
}

/**
 * Optimized server function to fetch document details, structure, and content
 */
export async function getDetailedDocument(docId: string, subId?: string) {
  const supabase = await createClient();

  // 1. Fetch document metadata with user info
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select(`
      *,
      user:users(id, user_name, profile_image, display_name)
    `)
    .eq('id', docId)
    .single();

  if (docError || !document) {
    console.error("Document fetch error:", docError);
    return { error: "Document not found", document: null };
  }

  const mappedDoc = mapTypeFromDb(document);
  const actualType = mappedDoc.type; // 'docs' or 'posts'
  let topics: Topics[] = [];
  let articleData = null;
  let contentRefId = null;

  // 2. Always fetch topics structure from sections
  const topicsRes = await fetchTopics(docId);
  topics = topicsRes.data || [];

  if (actualType === 'docs') {
    // 3. For multi-page docs, try to fetch content for requested subtopic
    if (subId) {
      const { data: section } = await supabase
        .from('sections')
        .select('content_ref_id')
        .eq('id', subId)
        .single();
      contentRefId = section?.content_ref_id;
    }

    // Fallback: If no subId or no specific content, use document-level content or first section
    if (!contentRefId) {
      contentRefId = document.content_ref_id;
    }

    if (!contentRefId && topics.length > 0 && topics[0].subTopics.length > 0) {
      const firstSubId = topics[0].subTopics[0].id;
      const { data: firstSection } = await supabase
        .from('sections')
        .select('content_ref_id')
        .eq('id', firstSubId)
        .single();
      contentRefId = firstSection?.content_ref_id;
    }
  } else {
    // 4. For posts, use document's content_ref_id
    contentRefId = document.content_ref_id;
  }

  if (contentRefId) {
    const { data: content, error: contentError } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentRefId)
      .single();

    if (!contentError && content) {
      articleData = content;
    }
  }

  return {
    document: mappedDoc,
    topics,
    articleData,
    type: actualType as 'docs' | 'posts'
  };
}

export async function fetchContentByRef(type: 'posts' | 'docs', entityId: string): Promise<ApiSingleResponse<any | null>> {
  const supabase = await createClient();

  let contentRefId = null;
  if (type === 'posts') {
    const { data } = await supabase.from('documents').select('content_ref_id').eq('id', entityId).single();
    contentRefId = data?.content_ref_id;
  } else {
    const { data } = await supabase.from('sections').select('content_ref_id').eq('id', entityId).single();
    contentRefId = data?.content_ref_id;
  }

  if (!contentRefId) return { success: true, data: null };

  const { data: content, error } = await supabase
    .from('contents')
    .select('*')
    .eq('id', contentRefId)
    .single();

  if (error) return { success: false, data: null, message: error.message };
  return { success: true, data: content };
}

export async function saveContent(type: 'posts' | 'docs', entityId: string, contentData: any, contentId?: string) {
  const supabase = await createClient();

  if (contentId) {
    // Update existing content
    const { data, error } = await supabase
      .from('contents')
      .update({ content_data: contentData, updated_at: new Date().toISOString() })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw new Error(`Update content failed: ${error.message}`);
    return { success: true, data };
  } else {
    // Create new content
    const { data: newContent, error: contentError } = await supabase
      .from('contents')
      .insert([{ content_data: contentData }])
      .select()
      .single();

    if (contentError) throw new Error(`Insert content failed: ${contentError.message}`);

    // Link it
    const table = type === 'posts' ? 'documents' : 'sections';
    const { error: linkError } = await supabase
      .from(table)
      .update({ content_ref_id: newContent.id })
      .eq('id', entityId);

    if (linkError) throw new Error(`Link content failed: ${linkError.message}`);

    return { success: true, data: newContent };
  }
}
