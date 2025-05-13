
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TradeRequest, UserAccount } from './types.ts';

// Define leverage map
export const LEVERAGE_MAP: Record<string, number> = {
  'Stocks': 20,
  'Indices': 50,
  'Commodities': 50,
  'Forex': 100,
  'Crypto': 50
};

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Calculate margin required for a position
 */
export function calculateMarginRequired(marketType: string, totalAmount: number): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  return totalAmount / leverage;
}

/**
 * Validate the trade request parameters
 */
export function validateTradeRequest(request: TradeRequest): boolean {
  return !!(
    request.assetSymbol &&
    request.assetName &&
    request.marketType &&
    request.units > 0 &&
    request.pricePerUnit > 0 &&
    ['buy', 'sell'].includes(request.tradeType) &&
    ['market', 'entry'].includes(request.orderType)
  );
}

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
