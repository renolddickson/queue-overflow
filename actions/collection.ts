'use server';

import { createClient } from '@/utils/supabase';
import { getUid } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new collection
 */
export async function createCollection(name: string, description?: string, isPublic: boolean = false) {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { success: false, error: 'Not authorized' };

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description,
      is_public: isPublic
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/profile');
  return { success: true, data };
}

/**
 * Adds a document to a collection
 */
export async function addDocumentToCollection(collectionId: string, documentId: string) {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { success: false, error: 'Not authorized' };

  // First check if the document actually exists in the database
  const { data: docExists, error: docCheckError } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .single();

  if (docCheckError || !docExists) {
    return { success: false, error: 'Document not found or no longer exists' };
  }

  const { error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      document_id: documentId
    });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Already in collection' };
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Fetches collections for the current user
 */
export async function getMyCollections() {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { data: [], error: 'Not authorized' };

  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      items:collection_items(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getMyCollections error:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

/**
 * Deletes a collection
 */
export async function deleteCollection(id: string) {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { success: false, error: 'Not authorized' };

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/profile');
  return { success: true };
}

/**
 * Ensures the default "Save for later" collection exists for the user
 */
export async function ensureSaveForLaterCollection() {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { success: false, error: 'Not authorized' };

  // Check if it exists
  const { data: existing, error: fetchError } = await supabase
    .from('collections')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Save for later')
    .single();

  if (existing) return { success: true, data: existing };

  // Create it
  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: 'Save for later',
      description: 'Default collection for items to read later',
      is_public: false
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/collection');
  return { success: true, data };
}

/**
 * Checks which collections a document belongs to for the current user
 */
export async function getDocumentCollections(documentId: string) {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { data: [], error: 'Not authorized' };

  const { data, error } = await supabase
    .from('collection_items')
    .select(`
      collection_id,
      collections!inner(user_id)
    `)
    .eq('document_id', documentId)
    .eq('collections.user_id', userId);

  if (error) return { data: [], error: error.message };
  
  return { data: data.map((item: { collection_id: string }) => item.collection_id) };
}

/**
 * Fetches a specific collection by ID along with its saved documents
 */
export async function getCollectionById(id: string) {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { data: null, items: [], error: 'Not authorized' };

  // Fetch the collection
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (colError || !collection) {
    return { data: null, items: [], error: colError?.message || 'Collection not found' };
  }

  // Fetch items with joined document and user data
  const { data: items, error: itemsError } = await supabase
    .from('collection_items')
    .select(`
      id,
      document_id,
      created_at,
      document:documents(
        id,
        title,
        type,
        description,
        cover_image,
        upvotes,
        comments_count,
        created_at,
        user:users(user_id, user_name, profile_image, display_name)
      )
    `)
    .eq('collection_id', id)
    .order('created_at', { ascending: false });

  if (itemsError) {
    console.error('getCollectionById items fetch error detail:', JSON.stringify(itemsError, null, 2));
    return { 
      data: collection, 
      items: [], 
      error: itemsError.message || JSON.stringify(itemsError) || 'Error loading collection items' 
    };
  }

  // Map document types and flatten structure
  const formattedItems = (items || [])
    .filter((item: any) => item.document) // Ensure document exists
    .map((item: any) => {
      // Handle potential array wrapping from supabase joins
      const doc = Array.isArray(item.document) ? item.document[0] : item.document;
      const user = Array.isArray(doc.user) ? doc.user[0] : doc.user;
      
      let mappedType = doc.type;
      if (mappedType === 'post') mappedType = 'posts';
      if (mappedType === 'doc') mappedType = 'docs';

      return {
        ...doc,
        type: mappedType,
        user: user
      };
    });

  return { data: collection, items: formattedItems, error: null };
}
