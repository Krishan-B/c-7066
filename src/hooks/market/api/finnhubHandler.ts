
import { 
  getStockQuote as getFinnhubStockQuote,
  getCryptoQuote as getFinnhubCryptoQuote,
  getForexQuote as getFinnhubForexQuote,
  transformStockData as transformFinnhubStockData,
  transformCryptoData as transformFinnhubCryptoData,
  transformForexData as transformFinnhubForexData,
  hasFinnhubApiKey
} from "@/utils/api/finnhub";

import { Asset } from "../types";

export async function fetchFinnhubData(marketTypes: string[], symbols: Record<string, string[]>): Promise<Asset[]> {
  if (!hasFinnhubApiKey()) {
    throw new Error("Finnhub API key not available");
  }
  
  console.log('Fetching data from Finnhub.io');
  const marketData: Asset[] = [];
  
  try {
    // Fetch data for each symbol based on market type
    for (const marketType of marketTypes) {
      if (marketType === 'Stock') {
        for (const symbol of symbols[marketType]) {
          const data = await getFinnhubStockQuote(symbol);
          if (data) {
            const transformedData = transformFinnhubStockData(data, symbol);
            if (transformedData) {
              marketData.push(transformedData);
            }
          }
        }
      } 
      else if (marketType === 'Forex') {
        for (const pair of symbols[marketType]) {
          const [fromCurrency, toCurrency] = pair.split('/');
          const data = await getFinnhubForexQuote(fromCurrency, toCurrency);
          if (data) {
            const transformedData = transformFinnhubForexData(data, fromCurrency, toCurrency);
            if (transformedData) {
              marketData.push(transformedData);
            }
          }
        }
      }
      else if (marketType === 'Crypto') {
        for (const symbol of symbols[marketType]) {
          const data = await getFinnhubCryptoQuote(symbol);
          if (data) {
            const transformedData = transformFinnhubCryptoData(data, symbol);
            if (transformedData) {
              marketData.push(transformedData);
            }
          }
        }
      }
    }
    
    return marketData;
  } catch (error) {
    console.error('Finnhub error:', error);
    throw error;
  }
}
