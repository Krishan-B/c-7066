
// @ts-expect-error: Deno-specific module import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { type UserAccount, type SupabaseClientType } from './types.ts';

// Add type declarations for Deno runtime
declare global {
  interface DenoEnv {
    get(key: string): string | undefined;
  }
  
  const Deno: {
    env: DenoEnv;
  };
}

/**
 * Get Supabase client
 */
export function getSupabaseClient(): SupabaseClientType {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Get user from auth token
 */
export async function getUserFromToken(
  supabase: SupabaseClientType, 
  authHeader: string | null
): Promise<{ user: unknown; error: string | null }> {
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
export async function getUserAccount(
  supabase: SupabaseClientType, 
  userId: string
): Promise<{ account: UserAccount | null; error: string | null }> {
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
