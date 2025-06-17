import { supabase } from '@/integrations/supabase/client';

import { type Asset } from '../types';

/**
 * Check if there's recent market data in the database
 */
export async function getRecentMarketData(marketTypes: string[]): Promise<Asset[] | null> {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('market_data')
      .select('*')
      .in('market_type', marketTypes)
      .gt('last_updated', new Date(Date.now() - 60000 * 15).toISOString()); // Data not older than 15 minutes

    // If we have enough recent data (at least 3 items per market type), use it
    const minExpectedItems = marketTypes.length * 3;
    if (!fetchError && existingData && existingData.length >= minExpectedItems) {
      console.warn(`Using cached data for ${marketTypes.join(', ')}`, existingData);
      return existingData as Asset[];
    }

    return null;
  } catch (error) {
    console.error('Error fetching recent market data:', error);
    return null;
  }
}

/**
 * Update market data in the database
 */
export async function updateMarketDataInDatabase(assets: Asset[]): Promise<void> {
  try {
    for (const asset of assets) {
      await supabase.from('market_data').upsert(
        {
          symbol: asset.symbol,
          name: asset.name,
          price: asset.price,
          change_percentage: asset.change_percentage,
          volume: asset.volume,
          market_cap: asset.market_cap || 'N/A',
          market_type: asset.market_type,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'symbol' }
      );
    }
    console.warn(`Updated ${assets.length} assets in the database`);
  } catch (error) {
    console.error('Error updating market data in database:', error);
  }
}
