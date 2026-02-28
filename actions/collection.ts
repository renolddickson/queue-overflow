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
