
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

// Interface for Finnhub quote response to validate incoming data
interface FinnhubQuote {
  c: number;        // Current price
  d: number;        // Change
  dp: number;       // Percent change
  h: number;        // High price of the day
  l: number;        // Low price of the day
  o: number;        // Open price of the day
  pc: number;       // Previous close price
  t: number;        // Timestamp
}

// Validate the Finnhub quote data structure
function isValidFinnhubQuote(data: unknown): data is FinnhubQuote {
  if (!data || typeof data !== 'object') return false;
  
  const quote = data as Record<string, unknown>;
  
  return (
    typeof quote.c === 'number' &&
    typeof quote.d === 'number' &&
    typeof quote.dp === 'number' &&
    typeof quote.h === 'number' &&
    typeof quote.l === 'number' &&
    typeof quote.o === 'number' &&
    typeof quote.pc === 'number' &&
    typeof quote.t === 'number'
  );
}

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
          const response = await getFinnhubStockQuote(symbol);
          if (response && isValidFinnhubQuote(response)) {
            const transformedData = transformFinnhubStockData(response, symbol);
            if (transformedData) {
              marketData.push(transformedData);
            }
          } else {
            console.warn(`Invalid data format for stock ${symbol}:`, response);
          }
        }
      } 
      else if (marketType === 'Forex') {
        for (const pair of symbols[marketType]) {
          const [fromCurrency, toCurrency] = pair.split('/');
          const response = await getFinnhubForexQuote(fromCurrency, toCurrency);
          if (response && isValidFinnhubQuote(response)) {
            const transformedData = transformFinnhubForexData(response, fromCurrency, toCurrency);
            if (transformedData) {
              marketData.push(transformedData);
            }
          } else {
            console.warn(`Invalid data format for forex ${pair}:`, response);
          }
        }
      }
      else if (marketType === 'Crypto') {
        for (const symbol of symbols[marketType]) {
          const response = await getFinnhubCryptoQuote(symbol);
          if (response && isValidFinnhubQuote(response)) {
            const transformedData = transformFinnhubCryptoData(response, symbol);
            if (transformedData) {
              marketData.push(transformedData);
            }
          } else {
            console.warn(`Invalid data format for crypto ${symbol}:`, response);
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
