
import { supabase } from "@/integrations/supabase/client";
import { type Asset } from "../types";

/**
 * Fetch market data from the market-data-service edge function
 */
export async function fetchMarketDataService(
  marketTypes: string[],
  symbolMap?: Record<string, string[]>
): Promise<Asset[]> {
  console.log('Fetching data from Market Data Service');
  
  try {
    // If no specific symbols are provided, fetch all for each market type
    const allResults: Asset[] = [];
    
    for (const marketType of marketTypes) {
      // Get symbols for this market type or use default
      const symbols = symbolMap?.[marketType] || getDefaultSymbols(marketType);
      
      const { data, error } = await supabase.functions.invoke('market-data-service', {
        body: { marketType, symbols }
      });
      
      if (error) {
        console.error(`Error fetching ${marketType} data:`, error);
        continue;
      }
      
      if (data?.data && Array.isArray(data.data)) {
        allResults.push(...data.data);
      }
    }
    
    return allResults;
  } catch (error) {
    console.error('Market data service error:', error);
    throw error;
  }
}

/**
 * Get default symbols for each market type
 */
function getDefaultSymbols(marketType: string): string[] {
  switch (marketType.toLowerCase()) {
    case 'stock':
    case 'stocks':
      return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    case 'crypto':
    case 'cryptocurrency':
      return ['BTCUSD', 'ETHUSD', 'XRPUSD', 'ADAUSD', 'SOLUSD'];
    case 'forex':
      return ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
    case 'index':
    case 'indices':
      return ['^GSPC', '^DJI', '^IXIC', '^FTSE', '^N225']; // S&P 500, Dow, Nasdaq, FTSE, Nikkei
    case 'commodity':
    case 'commodities':
      return ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F']; // Gold, Silver, Crude Oil, Natural Gas, Copper
    default:
      return [];
  }
}
