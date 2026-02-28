'use server';

import { createClient } from '@/utils/supabase';
import { getUid } from './auth';
import { headers } from 'next/headers';

export async function recordSession(userId: string) {
  const supabase = await createClient();
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || 'Unknown';

  // Basic device detection from user agent
  let deviceType = 'Desktop';
  if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
  if (/tablet/i.test(userAgent)) deviceType = 'Tablet';

  const { error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      ip_address: ip.split(',')[0], // Take the first IP if there's a list
      device_name: deviceType,
      user_agent: userAgent,
      last_active: new Date().toISOString(),
      is_current: true
    });

  if (error) {
    console.error('recordSession error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getActiveSessions() {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { data: [], error: 'Not authorized' };

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active', { ascending: false });

  if (error) {
    console.error('getActiveSessions error:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

export async function revokeSession(sessionId: string) {
  const supabase = await createClient();
  const userId = await getUid();

  if (!userId) return { success: false, error: 'Not authorized' };

  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('revokeSession error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
