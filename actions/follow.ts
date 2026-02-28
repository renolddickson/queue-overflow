'use server';

import { createClient } from '@/utils/supabase';
import { getUid } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * Toggles follow status for a user
 */
export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const followerId = await getUid();

  if (!followerId) {
    return { success: false, error: 'Not authorized' };
  }

  if (followerId === targetUserId) {
    return { success: false, error: 'You cannot follow yourself' };
  }

  // Check if already following
  const { data: existingFollow, error: checkError } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', targetUserId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return { success: false, error: checkError.message };
  }

  if (existingFollow) {
    // Unfollow
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', targetUserId);

    if (deleteError) return { success: false, error: deleteError.message };
    
    revalidatePath(`/author/@${targetUserId}`);
    return { success: true, followed: false };
  } else {
    // Follow
    const { error: insertError } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: targetUserId
      });

    if (insertError) return { success: false, error: insertError.message };
    
    revalidatePath(`/author/@${targetUserId}`);
    return { success: true, followed: true };
  }
}

/**
 * Checks if current user follows a target user
 */
export async function getFollowStatus(targetUserId: string) {
  const supabase = await createClient();
  const followerId = await getUid();

  if (!followerId) return { followed: false };

  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', targetUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('getFollowStatus error:', error);
    return { followed: false };
  }

  return { followed: !!data };
}

/**
 * Gets follow counts for a user
 */
export async function getFollowStats(userId: string) {
  const supabase = await createClient();

  const [followersRes, followingRes] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
  ]);

  return {
    followers: followersRes.count || 0,
    following: followingRes.count || 0
  };
}

/**
 * Gets the list of authors followed by the current user
 */
export async function getFollowedAuthors() {
  const supabase = await createClient();
  const followerId = await getUid();

  if (!followerId) return { data: [], error: 'Not authorized' };

  const { data, error } = await supabase
    .from('follows')
    .select(`
      following:users!follows_following_id_fkey (
        user_id,
        user_name,
        display_name,
        profile_image
      )
    `)
    .eq('follower_id', followerId);

  if (error) {
    console.error('getFollowedAuthors error:', error);
    return { data: [], error: error.message };
  }

  // Flatten the response and fetch latest content for each
  const authors = await Promise.all((data?.map((item: any) => item.following) || []).map(async (author: any) => {
    const { data: latestDoc } = await supabase
      .from('documents')
      .select('id, title, created_at, type')
      .eq('user_id', author.user_id)
      .eq('publish_state', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    return {
      ...author,
      latest_content: latestDoc || null
    };
  }));

  return { data: authors };
}
