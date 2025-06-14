
import type { Asset } from '@/hooks/market/types';

export const transformFinnhubStockData = (data: any): Asset | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    return {
      symbol: data.symbol || '',
      name: data.name || data.symbol || '',
      price: data.c || 0,
      change_percentage: data.dp || 0,
      market_type: 'Stock', // Fixed: was "Stocks"
      volume: String(data.v || 0),
    };
  } catch (error) {
    console.error('Error transforming Finnhub stock data:', error);
    return null;
  }
};

export const transformFinnhubForexData = (data: any): Asset | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    return {
      symbol: data.symbol || '',
      name: data.symbol || '',
      price: data.c || 0,
      change_percentage: data.dp || 0,
      market_type: 'Forex',
      volume: String(data.v || 0),
    };
  } catch (error) {
    console.error('Error transforming Finnhub forex data:', error);
    return null;
  }
};

export const transformFinnhubCryptoData = (data: any): Asset | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    return {
      symbol: data.symbol || '',
      name: data.symbol || '',
      price: data.c || 0,
      change_percentage: data.dp || 0,
      market_type: 'Crypto',
      volume: String(data.v || 0),
    };
  } catch (error) {
    console.error('Error transforming Finnhub crypto data:', error);
    return null;
  }
};
