
import { 
  getLastQuote,
  getLastTrade,
  getTickerDetails,
  getPreviousClose,
  transformTickerToAsset,
  transformQuoteToAsset,
  transformStockData,
  transformCryptoData,
  transformForexData,
  hasPolygonApiKey
} from "@/utils/api/polygon";

import { Asset } from "../types";

// Wrapper functions to match the expected function signatures
export async function getStockQuote(symbol: string): Promise<any> {
  try {
    const tickerDetails = await getTickerDetails(symbol);
    const lastQuoteData = await getLastQuote(symbol);
    const previousCloseData = await getPreviousClose(symbol);
    
    return {
      results: {
        ticker: symbol,
        name: tickerDetails?.results?.name || symbol,
        last: lastQuoteData?.results,
        todaysChange: previousCloseData?.results?.c 
          ? (lastQuoteData?.results?.ap - previousCloseData?.results?.c) / previousCloseData?.results?.c * 100
          : 0
      }
    };
  } catch (error) {
    console.error(`Error getting stock quote for ${symbol}:`, error);
    return null;
  }
}

export async function getCryptoQuote(symbol: string): Promise<any> {
  try {
    const tickerDetails = await getTickerDetails(symbol);
    const lastTradeData = await getLastTrade(symbol);
    
    return {
      results: {
        ticker: symbol,
        name: tickerDetails?.results?.name || symbol,
        last: lastTradeData?.results,
        todaysChange: 0 // We don't have previous close for crypto in this simple implementation
      }
    };
  } catch (error) {
    console.error(`Error getting crypto quote for ${symbol}:`, error);
    return null;
  }
}

export async function getForexQuote(fromCurrency: string, toCurrency: string): Promise<any> {
  try {
    // Construct the forex pair symbol
    const symbol = `C:${fromCurrency}${toCurrency}`;
    const lastQuoteData = await getLastQuote(symbol);
    
    return {
      results: {
        ticker: `${fromCurrency}/${toCurrency}`,
        name: `${fromCurrency}/${toCurrency}`,
        last: lastQuoteData?.results,
        todaysChange: 0 // We don't have previous close for forex in this simple implementation
      }
    };
  } catch (error) {
    console.error(`Error getting forex quote for ${fromCurrency}/${toCurrency}:`, error);
    return null;
  }
}

export async function fetchPolygonData(marketTypes: string[], symbols: Record<string, string[]>): Promise<Asset[]> {
  if (!hasPolygonApiKey()) {
    throw new Error("Polygon API key not available");
  }
  
  console.log('Fetching data from Polygon.io');
  const marketData: Asset[] = [];
  
  try {
    // Fetch data for each symbol based on market type
    for (const marketType of marketTypes) {
      if (marketType === 'Stock') {
        for (const symbol of symbols[marketType]) {
          const data = await getStockQuote(symbol);
          const transformedData = transformStockData(data);
          if (transformedData) {
            marketData.push(transformedData);
          }
        }
      } 
      else if (marketType === 'Forex') {
        for (const pair of symbols[marketType]) {
          const [fromCurrency, toCurrency] = pair.split('/');
          const data = await getForexQuote(fromCurrency, toCurrency);
          const transformedData = transformForexData(data);
          if (transformedData) {
            marketData.push(transformedData);
          }
        }
      }
      else if (marketType === 'Crypto') {
        for (const symbol of symbols[marketType]) {
          const data = await getCryptoQuote(symbol);
          const transformedData = transformCryptoData(data);
          if (transformedData) {
            marketData.push(transformedData);
          }
        }
      }
    }
    
    return marketData;
  } catch (error) {
    console.error('Polygon.io error:', error);
    throw error;
  }
}
