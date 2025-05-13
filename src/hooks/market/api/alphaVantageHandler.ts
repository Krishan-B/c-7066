
import { 
  getStockQuote as getAlphaVantageStockQuote,
  getForexRate as getAlphaVantageForexRate,
  getCryptoQuote as getAlphaVantageCryptoQuote,
  transformStockData as transformAlphaVantageStockData, 
  transformForexData as transformAlphaVantageForexData,
  transformCryptoData as transformAlphaVantageCryptoData 
} from "@/utils/api/alphaVantage";

import { Asset } from "../types";

export async function fetchAlphaVantageData(marketTypes: string[], symbols: Record<string, string[]>): Promise<Asset[]> {
  console.log('Fetching data from Alpha Vantage');
  const marketData: Asset[] = [];
  
  try {
    // Fetch data for each symbol based on market type
    for (const marketType of marketTypes) {
      if (marketType === 'Stock') {
        for (const symbol of symbols[marketType]) {
          const data = await getAlphaVantageStockQuote(symbol);
          if (data && !data.error && data['Global Quote']) {
            const transformedData = transformAlphaVantageStockData(data);
            if (transformedData) {
              marketData.push(transformedData);
            }
          }
        }
      } 
      else if (marketType === 'Forex') {
        for (const pair of symbols[marketType]) {
          const [fromCurrency, toCurrency] = pair.split('/');
          const data = await getAlphaVantageForexRate(fromCurrency, toCurrency);
          if (data && !data.error) {
            const transformedData = transformAlphaVantageForexData(data);
            if (transformedData) {
              marketData.push(transformedData);
            }
          }
        }
      }
      else if (marketType === 'Crypto') {
        for (const symbol of symbols[marketType]) {
          const data = await getAlphaVantageCryptoQuote(symbol);
          if (data && !data.error) {
            const transformedData = transformAlphaVantageCryptoData(data);
            if (transformedData) {
              marketData.push(transformedData);
            }
          }
        }
      }
    }
    
    return marketData;
  } catch (error) {
    console.error('Alpha Vantage error:', error);
    throw error;
  }
}
