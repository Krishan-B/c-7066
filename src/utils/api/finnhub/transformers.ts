import type { Asset } from '@/hooks/market/types';

interface FinnhubQuote {
  symbol?: string;
  name?: string;
  c?: number; // current price
  dp?: number; // change percentage
  v?: number; // volume
}

export const transformFinnhubStockData = (data: unknown): Asset | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const d = data as FinnhubQuote;
  try {
    return {
      symbol: d.symbol || '',
      name: d.name || d.symbol || '',
      price: d.c || 0,
      change_percentage: d.dp || 0,
      market_type: 'Stock',
      volume: String(d.v || 0),
    };
  } catch (error) {
    console.error('Error transforming Finnhub stock data:', error);
    return null;
  }
};

export const transformFinnhubForexData = (data: unknown): Asset | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const d = data as FinnhubQuote;
  try {
    return {
      symbol: d.symbol || '',
      name: d.symbol || '',
      price: d.c || 0,
      change_percentage: d.dp || 0,
      market_type: 'Forex',
      volume: String(d.v || 0),
    };
  } catch (error) {
    console.error('Error transforming Finnhub forex data:', error);
    return null;
  }
};

export const transformFinnhubCryptoData = (data: unknown): Asset | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const d = data as FinnhubQuote;
  try {
    return {
      symbol: d.symbol || '',
      name: d.symbol || '',
      price: d.c || 0,
      change_percentage: d.dp || 0,
      market_type: 'Crypto',
      volume: String(d.v || 0),
    };
  } catch (error) {
    console.error('Error transforming Finnhub crypto data:', error);
    return null;
  }
};

// Add the specific function signatures that the handlers expect
export const transformStockData = (data: unknown, symbol: string): Asset | null => {
  const transformed = transformFinnhubStockData(data);
  if (transformed) {
    transformed.symbol = symbol;
    transformed.name = symbol; // Use symbol as name for now
  }
  return transformed;
};

export const transformCryptoData = (data: unknown, symbol: string): Asset | null => {
  const transformed = transformFinnhubCryptoData(data);
  if (transformed) {
    transformed.symbol = symbol;
    transformed.name = symbol; // Use symbol as name for now
  }
  return transformed;
};

export const transformForexData = (
  data: unknown,
  fromCurrency: string,
  toCurrency: string
): Asset | null => {
  const transformed = transformFinnhubForexData(data);
  if (transformed) {
    const pairSymbol = `${fromCurrency}/${toCurrency}`;
    transformed.symbol = pairSymbol;
    transformed.name = pairSymbol;
  }
  return transformed;
};
