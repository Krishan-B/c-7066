
import { 
  getStockQuote as getPolygonStockQuote,
  getCryptoQuote as getPolygonCryptoQuote,
  getForexQuote as getPolygonForexQuote,
  transformStockData as transformPolygonStockData,
  transformCryptoData as transformPolygonCryptoData,
  transformForexData as transformPolygonForexData,
  hasPolygonApiKey
} from "@/utils/api/polygon";

import { Asset } from "../types";

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
          const data = await getPolygonStockQuote(symbol);
          const transformedData = transformPolygonStockData(data);
          if (transformedData) {
            marketData.push(transformedData);
          }
        }
      } 
      else if (marketType === 'Forex') {
        for (const pair of symbols[marketType]) {
          const [fromCurrency, toCurrency] = pair.split('/');
          const data = await getPolygonForexQuote(fromCurrency, toCurrency);
          const transformedData = transformPolygonForexData(data);
          if (transformedData) {
            marketData.push(transformedData);
          }
        }
      }
      else if (marketType === 'Crypto') {
        for (const symbol of symbols[marketType]) {
          const data = await getPolygonCryptoQuote(symbol);
          const transformedData = transformPolygonCryptoData(data);
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
