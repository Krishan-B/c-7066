
import { Asset } from '@/hooks/market/types';

const FINNHUB_API_KEY = 'sandbox_cb7s9c2ad3ifqkei5hd0';
const BASE_URL = 'https://finnhub.io/api/v1';

interface StockSymbol {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  isin: string | null;
  mic: string;
  symbol: string;
  type: string;
}

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export const getSymbolsList = async (exchange = 'US'): Promise<StockSymbol[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/stock/symbol?exchange=${exchange}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch symbols: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return [];
  }
};

export const getQuote = async (symbol: string): Promise<FinnhubQuote | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quote: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};

export const getMarketData = async (symbols: string[], marketType: string): Promise<Asset[]> => {
  try {
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        const quote = await getQuote(symbol);
        return { symbol, quote };
      })
    );
    
    // Transform quotes to our Asset format
    return quotes
      .filter((item) => item.quote !== null)
      .map((item) => {
        const quote = item.quote!;
        const formattedVolume = formatVolume(quote.c * 1000000); // Mock volume
        
        return {
          name: item.symbol,
          symbol: item.symbol,
          price: quote.c,
          change_percentage: quote.dp,
          volume: formattedVolume,
          market_type: marketType,
          // Additional fields from the quote
          last_updated: new Date().toISOString()
        };
      });
  } catch (error) {
    console.error('Error in getMarketData:', error);
    return [];
  }
};

function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
}
