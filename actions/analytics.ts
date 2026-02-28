'use server';

import { createClient } from '@/utils/supabase';
import { getUid } from './auth';

/**
 * Tracks a document view or engagement event
 */
export async function trackEvent(documentId: string, eventType: 'view' | 'share' | 'upvote' = 'view', metadata: any = {}) {
  const supabase = await createClient();
  const viewerId = await getUid();

  // Prevent duplicate views for logged-in users
  if (viewerId && eventType === 'view') {
    const { data: existingView } = await supabase
      .from('document_analytics')
      .select('id')
      .eq('document_id', documentId)
      .eq('viewer_id', viewerId)
      .eq('event_type', 'view')
      .limit(1)
      .maybeSingle();

    if (existingView) {
      return { success: true, message: 'View already tracked' };
    }
  }

  const { error } = await supabase
    .from('document_analytics')
    .insert({
      document_id: documentId,
      viewer_id: viewerId, // Can be null for anonymous
      event_type: eventType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      }
    });

  if (error) {
    console.error('trackEvent error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Fetches analytics for the current user's documents
 */
export async function getAnalyticsStats() {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { data: [], error: 'Not authorized' };

  const { data, error } = await supabase
    .from('documents')
    .select(`
      id,
      title,
      type,
      views:document_analytics(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAnalyticsStats error:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}
