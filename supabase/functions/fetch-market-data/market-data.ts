
import { type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { assetDefinitions } from "./asset-definitions.ts";

// Asset market data generators mapping
export const assetGenerators = {
  Stock: assetDefinitions.generateStockData,
  Index: assetDefinitions.generateIndexData,
  Commodity: assetDefinitions.generateCommodityData,
  Forex: assetDefinitions.generateForexData,
  Crypto: assetDefinitions.generateCryptoData
};

/**
 * Generates market data for a specific market type
 */
export function generateMarketData(
  market: string, 
  generators: Record<string, () => Array<Record<string, unknown>>>
) {
  if (!generators[market]) {
    throw new Error(`Invalid market type: ${market}`);
  }
  
  const assetDefinitions = generators[market]();
  return generatePriceFluctuations(assetDefinitions, market);
}

/**
 * Updates the database with the generated market data
 */
export async function updateDatabaseWithMarketData(
  marketData: Array<Record<string, unknown>>, 
  supabaseClient: SupabaseClient
) {
  for (const asset of marketData) {
    await supabaseClient
      .from('market_data')
      .upsert({
        symbol: asset.symbol as string,
        name: asset.name as string,
        price: asset.price as number,
        change_percentage: asset.change_percentage as number,
        volume: asset.volume as string,
        market_cap: asset.market_cap as string | undefined,
        market_type: asset.market_type as string,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'symbol' });
  }
}

/**
 * Generates realistic price fluctuations for assets
 */
function generatePriceFluctuations(assets: Array<Record<string, unknown>>, marketType: string) {
  return assets.map(asset => {
    // Generate a random price fluctuation between -3% and +3%
    const randomFluctuation = (Math.random() * 6 - 3) / 100;
    
    // Calculate the new price with the random fluctuation
    const basePrice = typeof asset.base === 'number' ? asset.base : 0;
    const price = parseFloat((basePrice * (1 + randomFluctuation)).toFixed(2));
    
    // Calculate the change percentage (-3% to +3%)
    const changePercentage = parseFloat((randomFluctuation * 100).toFixed(2));
    
    // Generate volume (in billions or millions) based on market capitalization
    const volumeValue = price > 1000 
      ? (Math.random() * 10 + 5).toFixed(1) + 'B' 
      : (Math.random() * 50 + 10).toFixed(1) + 'M';
    
    // Generate market cap for stocks and crypto
    const marketCap = (marketType === 'Stock' || marketType === 'Crypto') 
      ? (price * (Math.random() * 10 + 1) * 1e9).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })
      : undefined;

    // Return the asset with updated values
    return {
      symbol: asset.symbol as string,
      name: asset.name as string,
      price,
      change_percentage: changePercentage,
      volume: volumeValue,
      market_cap: marketCap,
      market_type: marketType
    };
  });
}
