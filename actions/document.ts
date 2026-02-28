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

export async function deleteDocument(docId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();

  // 1. Fetch document metadata
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, type, content_ref_id')
    .eq('id', docId)
    .single();

  if (fetchError || !doc) {
    throw new Error(`Fetch document failed: ${fetchError?.message || 'Not found'}`);
  }

  const contentIdsToDelete: string[] = [];

  // 2. Add document's own content reference if it exists
  if (doc.content_ref_id) {
    contentIdsToDelete.push(doc.content_ref_id);
  }

  // 3. Fetch all associated sections (topics/subtopics) to collect their content references
  const { data: sections } = await supabase
    .from('sections')
    .select('id, content_ref_id')
    .eq('document_id', docId);

  if (sections && sections.length > 0) {
    sections.forEach(s => {
      if (s.content_ref_id) contentIdsToDelete.push(s.content_ref_id);
    });

    // 4. Delete all sections associated with this document
    const { error: sectionDeleteError } = await supabase
      .from('sections')
      .delete()
      .eq('document_id', docId);
      
    if (sectionDeleteError) {
      console.warn(`Section deletion warning for doc ${docId}: ${sectionDeleteError.message}`);
    }
  }

  // 5. Delete the document itself
  const { error: docDeleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId);

  if (docDeleteError) throw new Error(`Delete document failed: ${docDeleteError.message}`);

  // 6. Cleanup content references
  if (contentIdsToDelete.length > 0) {
    const uniqueContentIds = Array.from(new Set(contentIdsToDelete));
    await supabase.from('contents').delete().in('id', uniqueContentIds);
  }

  return { success: true, data: null };
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
    icon: "FileText",
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
    subTopics: [],
  };
  return { success: true, data: topic };
}

export async function deleteTopic(topicId: string): Promise<ApiSingleResponse<null>> {
  const supabase = await createClient();

  const { data: subSections } = await supabase
    .from('sections')
    .select('id, content_ref_id')
    .eq('parent_id', topicId);

  const { data: topic } = await supabase
    .from('sections')
    .select('content_ref_id')
    .eq('id', topicId)
    .single();

  await supabase.from('sections').delete().eq('parent_id', topicId);
  const { error } = await supabase.from('sections').delete().eq('id', topicId);

  if (error) throw new Error(`Delete section failed: ${error.message}`);

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

  const { data: section } = await supabase
    .from('sections')
    .select('content_ref_id')
    .eq('id', subTopicId)
    .single();

  const { error } = await supabase.from('sections').delete().eq('id', subTopicId);

  if (error) throw new Error(`Delete section failed: ${error.message}`);

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
      const segments = url.pathname.split('/').filter(Boolean);

      let bucket: string;
      let filePath: string;

      if (segments[2] === 'object' && segments[3] === 'public') {
        bucket = segments[4];
        filePath = segments.slice(5).join('/');
      } else {
        bucket = segments[3];
        filePath = segments.slice(4).join('/');
      }
      await supabase.storage.from(bucket).remove([filePath]);
    } catch (err) {
      console.error(`Error processing link ${link}:`, err);
    }
  }
}

export async function fetchAllFeeds(searchData?: string, category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('documents')
    .select(`
    id,
    title,
    type,
    description,
    cover_image,
    upvotes,
    comments_count,
    created_at,
    user:users(user_id, user_name, profile_image, display_name)
  `)
    .eq('publish_state', 'published')
    .limit(24);

  if (category === 'Following') {
    const userId = await getUid();
    if (!userId) return { data: [], error: 'Not authorized' };
    
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    const followingIds = followData?.map(f => f.following_id) || [];
    if (followingIds.length === 0) return { data: [], success: true };
    
    query = query.in('user_id', followingIds);
  } else if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (searchData) {
    query = query.or(`title.ilike.%${searchData}%,description.ilike.%${searchData}%`);
  }

  const res = await query;
  
  if (res.error) {
    console.error("fetchAllFeeds error (attempting fallback):", res.error);
    const { data, error } = await supabase
      .from('documents')
      .select(`
      id,
      title,
      type,
      description,
      cover_image,
      upvotes,
      comments_count,
      created_at,
      user:users(user_id, user_name, profile_image, display_name)
    `)
      .eq('publish_state', 'published')
      .limit(24);

    if (error) return { data: [], error: error.message };
    return { data: data?.map(item => mapTypeFromDb(item)) || [], success: true };
  }

  return { data: res.data?.map(item => mapTypeFromDb(item)) || [], success: true };
}

export async function getDetailedDocument(docId: string, subId?: string) {
  const supabase = await createClient();

  const { data: document, error: docError } = await supabase
    .from('documents')
    .select(`
      *,
      upvotes,
      comments_count,
      user:users(id, user_id, user_name, profile_image, display_name)
    `)
    .eq('id', docId)
    .single();

  if (docError || !document) return { error: "Document not found", document: null };

  const mappedDoc = mapTypeFromDb(document);
  const actualType = mappedDoc.type;
  let topics: Topics[] = [];
  let articleData = null;
  let contentRefId = null;

  const topicsRes = await fetchTopics(docId);
  topics = topicsRes.data || [];

  if (actualType === 'docs') {
    if (subId) {
      const { data: section } = await supabase
        .from('sections')
        .select('content_ref_id')
        .eq('id', subId)
        .single();
      contentRefId = section?.content_ref_id;
    }

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
    contentRefId = document.content_ref_id;
  }

  if (contentRefId) {
    const { data: content } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentRefId)
      .single();

    if (content) {
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
    const { data, error } = await supabase
      .from('contents')
      .update({ content_data: contentData, updated_at: new Date().toISOString() })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw new Error(`Update content failed: ${error.message}`);
    return { success: true, data };
  } else {
    const { data: newContent, error: contentError } = await supabase
      .from('contents')
      .insert([{ content_data: contentData }])
      .select()
      .single();

    if (contentError) throw new Error(`Insert content failed: ${contentError.message}`);

    const table = type === 'posts' ? 'documents' : 'sections';
    const { error: linkError } = await supabase
      .from(table)
      .update({ content_ref_id: newContent.id })
      .eq('id', entityId);

    if (linkError) throw new Error(`Link content failed: ${linkError.message}`);

    return { success: true, data: newContent };
  }
}

export async function toggleUpvote(docId: string) {
  const supabase = await createClient();
  const userId = await getUid();
  if (!userId) return { success: false, error: 'Please login to upvote' };

  const { data: existing } = await supabase
    .from('document_analytics')
    .select('id')
    .eq('document_id', docId)
    .eq('viewer_id', userId)
    .eq('event_type', 'upvote')
    .maybeSingle();

  const isUpvoted = !!existing;

  if (isUpvoted) {
    // Remove upvote record
    await supabase
      .from('document_analytics')
      .delete()
      .eq('id', existing.id);
    
    // Attempt to decrement count (via RPC or direct update if table permits)
    try {
      await supabase.rpc('decrement_upvotes', { doc_id: docId });
    } catch {
      // Fallback: If RPC fails, try getting current count and updating manually
      const { data: d } = await supabase.from('documents').select('upvotes').eq('id', docId).single();
      if (d) {
        await supabase.from('documents').update({ upvotes: Math.max(0, (d.upvotes || 0) - 1) }).eq('id', docId);
      }
    }
  } else {
    // Add upvote record
    await supabase
      .from('document_analytics')
      .insert({
        document_id: docId,
        viewer_id: userId,
        event_type: 'upvote'
      });
    
    // Attempt to increment count
    try {
      await supabase.rpc('increment_upvotes', { doc_id: docId });
    } catch {
      // Fallback: If RPC fails, try manual update
      const { data: d } = await supabase.from('documents').select('upvotes').eq('id', docId).single();
      if (d) {
        await supabase.from('documents').update({ upvotes: (d.upvotes || 0) + 1 }).eq('id', docId);
      }
    }
  }

  return { success: true, upvoted: !isUpvoted };
}

export async function getUpvoteStatus(docId: string) {
  const supabase = await createClient();
  const userId = await getUid();
  if (!userId) return { upvoted: false };

  const { data } = await supabase
    .from('document_analytics')
    .select('id')
    .eq('document_id', docId)
    .eq('viewer_id', userId)
    .eq('event_type', 'upvote')
    .maybeSingle();

  return { upvoted: !!data };
}
