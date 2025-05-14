
import { supabase } from "@/integrations/supabase/client";
import { Asset } from '@/hooks/market/types';
import { WatchlistFetchOptions } from './types';

export async function fetchWatchlistData(options: WatchlistFetchOptions = {}): Promise<Asset[]> {
  try {
    console.log("Fetching watchlist data");
    
    const { limit = 50, marketTypes = ['Stock', 'Index', 'Commodity', 'Forex', 'Crypto'] } = options;
    
    // Get featured assets from each market type
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .in('market_type', marketTypes)
      .order('market_type', { ascending: true })
      .order('last_updated', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching watchlist data:", error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Found ${data.length} watchlist assets`);
      return data as Asset[];
    }

    // If no data in Supabase yet, call the functions to populate it
    console.log("No watchlist data found, fetching fresh data");
    
    await Promise.all([
      supabase.functions.invoke('fetch-market-data', { body: { market: 'Stock' } }),
      supabase.functions.invoke('fetch-market-data', { body: { market: 'Crypto' } }),
      supabase.functions.invoke('fetch-market-data', { body: { market: 'Forex' } }),
      supabase.functions.invoke('fetch-market-data', { body: { market: 'Index' } }),
      supabase.functions.invoke('fetch-market-data', { body: { market: 'Commodity' } })
    ]);
    
    // Try to fetch again after populating
    const { data: refreshedData, error: refreshError } = await supabase
      .from('market_data')
      .select('*')
      .in('market_type', marketTypes)
      .order('market_type', { ascending: true })
      .limit(limit);

    if (!refreshError && refreshedData && refreshedData.length > 0) {
      console.log(`Fetched ${refreshedData.length} refreshed watchlist assets`);
      return refreshedData as Asset[];
    }

    // Fallback to default data
    return getFallbackData();
  } catch (error: any) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

// Extracted fallback data function
export function getFallbackData(): Asset[] {
  return [
    { 
      name: "Bitcoin", 
      symbol: "BTCUSD", 
      price: 67543.21, 
      change_percentage: 2.4, 
      market_type: "Crypto", 
      volume: "$42.1B" 
    },
    { 
      name: "Apple Inc.", 
      symbol: "AAPL", 
      price: 189.56, 
      change_percentage: 0.8, 
      market_type: "Stock", 
      volume: "$4.2B" 
    },
    { 
      name: "S&P 500", 
      symbol: "US500", 
      price: 5204.34, 
      change_percentage: 0.4, 
      market_type: "Index", 
      volume: "$5.1B" 
    },
    { 
      name: "EUR/USD", 
      symbol: "EURUSD", 
      price: 1.0934, 
      change_percentage: -0.12, 
      market_type: "Forex", 
      volume: "$98.3B" 
    },
    { 
      name: "Gold", 
      symbol: "XAUUSD", 
      price: 2325.60, 
      change_percentage: 1.3, 
      market_type: "Commodity", 
      volume: "$15.8B" 
    },
  ];
}
