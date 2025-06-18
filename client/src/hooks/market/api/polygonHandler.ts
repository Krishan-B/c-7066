import { supabase } from '@/integrations/supabase/client';

import { transformTickerToAsset } from '@/utils/api/polygon/transformers';

import { type Asset } from '../types';

interface PolygonQuoteResult {
  p?: number; // price
  a?: number; // ask price (for forex)
  c?: number; // close price (for daily)
  v?: number; // volume (for daily)
}
interface PolygonResultsWrapper {
  results?: PolygonQuoteResult[] | PolygonQuoteResult;
}

const fetchPolygonData = async (endpoint: string): Promise<PolygonResultsWrapper> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-polygon-data', {
      body: { endpoint },
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
        const lastQuote = quoteData.results as PolygonQuoteResult;
        const tradeData = await fetchPolygonData(`/v2/last/trade/${symbol}`);
        const lastTrade = (tradeData?.results as PolygonQuoteResult) || null;

        // Get previous day data for change calculation
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const fromDate = yesterday.toISOString().split('T')[0];
        const toDate = today.toISOString().split('T')[0];

        const dailyData = await fetchPolygonData(
          `/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}`
        );

        // Create asset from combined data
        const asset = transformTickerToAsset({
          ticker: symbol,
          lastQuote,
          lastTrade,
          todaysChange: (Array.isArray(dailyData?.results) ? dailyData.results[0]?.c : 0) || 0,
          volume: (Array.isArray(dailyData?.results) ? dailyData.results[0]?.v : 0) || 0,
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
        const quote = quoteData.results as PolygonQuoteResult;

        // Transform directly to our Asset format
        const asset: Asset = {
          symbol: cryptoSymbol,
          name: getCryptoName(cryptoSymbol),
          price: quote.p || 0,
          change_percentage: 0, // Polygon doesn't provide this directly
          market_type: 'Crypto',
          volume: formatLargeNumber(10000000 + Math.random() * 100000000), // Simulated volume
          market_cap: formatLargeNumber((quote.p || 0) * (10000000 + Math.random() * 1000000000)), // Simulated market cap
          last_updated: new Date().toISOString(),
        };

        assets.push(asset);
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
      const forexSymbol = symbol.includes('/')
        ? symbol
        : `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;

      // Fetch last quote for the forex pair
      const quoteData = await fetchPolygonData(`/v2/last/currency/${forexSymbol}`);
      if (quoteData && quoteData.results) {
        const quote = quoteData.results as PolygonQuoteResult;

        // Transform directly to our Asset format
        const asset: Asset = {
          symbol: forexSymbol,
          name: forexSymbol,
          price: quote.p || quote.a || 0,
          change_percentage: 0, // Polygon doesn't provide this directly
          market_type: 'Forex',
          volume: formatLargeNumber(50000000 + Math.random() * 500000000), // Simulated volume
          last_updated: new Date().toISOString(),
        };

        assets.push(asset);
      }
    }

    return assets;
  } catch (error) {
    console.error('Error fetching forex data from Polygon:', error);
    return [];
  }
};

// Helper functions
function getCryptoName(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'BTC-USD': 'Bitcoin',
    'ETH-USD': 'Ethereum',
    'BNB-USD': 'Binance Coin',
    'ADA-USD': 'Cardano',
    'DOGE-USD': 'Dogecoin',
    'XRP-USD': 'Ripple',
    'DOT-USD': 'Polkadot',
    'LTC-USD': 'Litecoin',
    'LINK-USD': 'Chainlink',
    'BCH-USD': 'Bitcoin Cash',
  };
  return symbolMap[symbol] || symbol;
}

function formatLargeNumber(num: number): string {
  // Format large numbers for volume and market cap
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}
