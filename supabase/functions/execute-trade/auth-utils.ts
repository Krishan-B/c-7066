
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { type UserAccount } from './types.ts';

/**
 * Get Supabase client
 */
export function getSupabaseClient() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Get user from auth token
 */
export async function getUserFromToken(supabase: any, authHeader: string | null): Promise<{ user: any; error: any }> {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1]);
  
  if (error || !user) {
    return { user: null, error: 'Invalid token or user not found' };
  }
  
  return { user, error: null };
}

/**
 * Get user account data
 */
export async function getUserAccount(supabase: any, userId: string): Promise<{ account: UserAccount | null; error: any }> {
  const { data: accountData, error: accountError } = await supabase
    .from('user_account')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (accountError) {
    return { account: null, error: `Failed to get account data: ${accountError.message}` };
  }
  
  return { account: accountData, error: null };
}
