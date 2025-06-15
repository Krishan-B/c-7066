import { supabase } from '@/integrations/supabase/client';
import { type Asset } from '../types';

export async function fetchEdgeFunctionData(marketTypes: string[]): Promise<Asset[]> {
  console.warn('Fetching data from Edge Functions');

  try {
    const dataPromises = marketTypes.map(async (type) => {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { market: type },
      });

      if (error) {
        console.error(`Error fetching ${type} data:`, error);
        return [];
      }

      return data?.data || [];
    });

    // Wait for all edge function calls to complete
    const results = await Promise.all(dataPromises);

    // Flatten the array of arrays into a single array
    return results.flat();
  } catch (error) {
    console.error('Edge functions error:', error);
    throw error;
  }
}
