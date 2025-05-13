
import { Asset } from "../types";
import { supabase } from '@/integrations/supabase/client';
import { getLastQuote, getLastTrade, getDailyOHLC } from "@/utils/api/polygon";
import { transformTickerToAsset, transformQuoteToAsset } from "@/utils/api/polygon/transformers";

const fetchPolygonData = async (endpoint: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-polygon-data', {
      body: { endpoint }
    });
    
    if (error) throw new Error(`Polygon API error: ${error.message}`);
    return data;
  } catch (error) {
    console.error(`Error fetching Polygon data from ${endpoint}:`, error);
    throw error;
  }
};

// Fetch stock data from Polygon API
export const fetchStockData = async (symbols: string[]): Promise<Asset[]> => {
  try {
    const assets: Asset[] = [];
    
    for (const symbol of symbols) {
      // Fetch last quote for the stock
      const quoteData = await fetchPolygonData(`/v2/last/nbbo/${symbol}`);
      
      if (quoteData && quoteData.results) {
        const lastQuote = quoteData.results;
        const tradeData = await fetchPolygonData(`/v2/last/trade/${symbol}`);
        const lastTrade = tradeData?.results || null;
        
        // Get previous day data for change calculation
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const fromDate = yesterday.toISOString().split('T')[0];
        const toDate = today.toISOString().split('T')[0];
        
        const dailyData = await fetchPolygonData(`/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}`);
        
        // Create asset from combined data
        const asset = transformTickerToAsset({
          ticker: symbol,
          lastQuote,
          lastTrade,
          todaysChange: dailyData?.results?.[0]?.c || 0,
          volume: dailyData?.results?.[0]?.v || 0
        });
        
        if (asset) {
          assets.push(asset);
        }
      }
    }
    
    return assets;
  } catch (error) {
    console.error('Error fetching stock data from Polygon:', error);
    return [];
  }
};

// Fetch crypto data from Polygon API
export const fetchCryptoData = async (symbols: string[]): Promise<Asset[]> => {
  try {
    const assets: Asset[] = [];
    
    for (const symbol of symbols) {
      // Format symbol for crypto (e.g., BTC-USD)
      const cryptoSymbol = symbol.includes('-') ? symbol : `${symbol}-USD`;
      
      // Fetch last quote for the crypto
      const quoteData = await fetchPolygonData(`/v2/last/crypto/${cryptoSymbol}`);
      
      if (quoteData && quoteData.results) {
        const asset = transformQuoteToAsset(quoteData.results, symbol);
        if (asset) {
          assets.push(asset);
        }
      }
    }
    
    return assets;
  } catch (error) {
    console.error('Error fetching crypto data from Polygon:', error);
    return [];
  }
};

// Fetch forex data from Polygon API
export const fetchForexData = async (symbols: string[]): Promise<Asset[]> => {
  try {
    const assets: Asset[] = [];
    
    for (const symbol of symbols) {
      // Format symbol for forex (e.g., EUR/USD)
      const forexSymbol = symbol.includes('/') ? symbol : `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;
      
      // Fetch last quote for the forex pair
      const quoteData = await fetchPolygonData(`/v2/last/currency/${forexSymbol}`);
      
      if (quoteData && quoteData.results) {
        const asset = transformQuoteToAsset(quoteData.results, symbol);
        if (asset) {
          assets.push(asset);
        }
      }
    }
    
    return assets;
  } catch (error) {
    console.error('Error fetching forex data from Polygon:', error);
    return [];
  }
};
