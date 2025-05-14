
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Asset } from "../types.ts";

/**
 * Check if there's recent market data in the cache (database)
 */
export async function checkCachedData(
  supabase: SupabaseClient,
  marketType: string, 
  symbols: string[]
): Promise<Asset[] | null> {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('market_data')
      .select('*')
      .eq('market_type', marketType)
      .in('symbol', symbols)
      .gt('last_updated', new Date(Date.now() - 60000 * 15).toISOString()); // Data not older than 15 minutes
    
    if (!fetchError && existingData && existingData.length === symbols.length) {
      console.log(`Using cached data for ${marketType}`);
      return existingData as Asset[];
    }
    
    return null;
  } catch (error) {
    console.error('Error checking cached data:', error);
    return null;
  }
}
