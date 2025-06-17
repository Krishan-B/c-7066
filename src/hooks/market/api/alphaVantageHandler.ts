import {
  getCryptoQuote as getAlphaVantageCryptoQuote,
  getForexRate as getAlphaVantageForexRate,
  getStockQuote as getAlphaVantageStockQuote,
  transformCryptoData as transformAlphaVantageCryptoData,
  transformForexData as transformAlphaVantageForexData,
  transformStockData as transformAlphaVantageStockData,
} from '@/utils/api/alphaVantage';

import { type Asset } from '../types';

// Define proper types for Alpha Vantage responses
interface AlphaVantageResponse {
  error?: string;
  'Global Quote'?: unknown;
  'Realtime Currency Exchange Rate'?: unknown;
  [key: string]: unknown;
}

export async function fetchAlphaVantageData(
  marketTypes: string[],
  symbols: Record<string, string[]>
): Promise<Asset[]> {
  console.warn('Fetching data from Alpha Vantage');
  const marketData: Asset[] = [];

  try {
    // Fetch data for each symbol based on market type
    for (const marketType of marketTypes) {
      if (marketType === 'Stock') {
        for (const symbol of symbols[marketType]) {
          try {
            const data = (await getAlphaVantageStockQuote(symbol)) as AlphaVantageResponse;
            if (data && !data.error && data['Global Quote']) {
              const transformedData = transformAlphaVantageStockData(data);
              if (transformedData && isValidAsset(transformedData)) {
                marketData.push(transformedData as Asset);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch stock data for ${symbol}:`, error);
          }
        }
      } else if (marketType === 'Forex') {
        for (const pair of symbols[marketType]) {
          try {
            const [fromCurrency, toCurrency] = pair.split('/');
            const data = (await getAlphaVantageForexRate(
              fromCurrency,
              toCurrency
            )) as AlphaVantageResponse;
            if (data && !data.error) {
              const transformedData = transformAlphaVantageForexData(data);
              if (transformedData && isValidAsset(transformedData)) {
                marketData.push(transformedData as Asset);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch forex data for ${pair}:`, error);
          }
        }
      } else if (marketType === 'Crypto') {
        for (const symbol of symbols[marketType]) {
          try {
            const data = (await getAlphaVantageCryptoQuote(symbol)) as AlphaVantageResponse;
            if (data && !data.error) {
              const transformedData = transformAlphaVantageCryptoData(data);
              if (transformedData && isValidAsset(transformedData)) {
                marketData.push(transformedData as Asset);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch crypto data for ${symbol}:`, error);
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

// Helper function to validate if an object is a valid Asset
function isValidAsset(obj: unknown): obj is Asset {
  return (
    obj &&
    typeof obj.symbol === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.change_percentage === 'number' &&
    typeof obj.market_type === 'string' &&
    typeof obj.volume === 'string'
  );
}
