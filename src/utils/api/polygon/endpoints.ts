
import { fetchPolygonData } from './client';

// Common types
export interface PolygonTickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik: string;
  composite_figi: string;
  share_class_figi: string;
  last_updated_utc: string;
}

// Stock quote types
export interface PolygonStockQuote {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: {
    t: number;  // timestamp
    n: number;  // trade count
    c: number;  // close price
    h: number;  // high price
    l: number;  // low price
    o: number;  // open price
    v: number;  // volume
    vw: number; // volume weighted price
  }[];
  status: string;
  request_id: string;
  count: number;
}

// Crypto quote types
export interface PolygonCryptoQuote {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: {
    t: number;  // timestamp
    n: number;  // trade count
    c: number;  // close price
    h: number;  // high price
    l: number;  // low price
    o: number;  // open price
    v: number;  // volume
    vw: number; // volume weighted price
  }[];
  status: string;
  request_id: string;
  count: number;
}

// Forex quote types
export interface PolygonForexQuote {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: {
    t: number;  // timestamp
    n: number;  // trade count
    c: number;  // close price
    h: number;  // high price
    l: number;  // low price
    o: number;  // open price
    v: number;  // volume
    vw: number; // volume weighted price
  }[];
  status: string;
  request_id: string;
  count: number;
}

/**
 * Get stock quote data from Polygon
 * @param symbol Stock symbol (e.g., AAPL)
 */
export async function getStockQuote(symbol: string): Promise<PolygonStockQuote> {
  // Get previous trading day
  const today = new Date();
  let previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);
  
  // Format as YYYY-MM-DD
  const date = previousDay.toISOString().split('T')[0];
  
  return fetchPolygonData<PolygonStockQuote>({
    endpoint: `/v2/aggs/ticker/${symbol}/range/1/day/${date}/${date}`,
  });
}

/**
 * Get crypto quote data from Polygon
 * @param symbol Crypto symbol (e.g., X:BTCUSD)
 */
export async function getCryptoQuote(symbol: string): Promise<PolygonCryptoQuote> {
  // Format symbol for Polygon API
  const formattedSymbol = symbol.includes('X:') ? symbol : `X:${symbol}`;
  
  // Get previous day
  const today = new Date();
  let previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);
  
  // Format as YYYY-MM-DD
  const date = previousDay.toISOString().split('T')[0];
  
  return fetchPolygonData<PolygonCryptoQuote>({
    endpoint: `/v2/aggs/ticker/${formattedSymbol}/range/1/day/${date}/${date}`,
  });
}

/**
 * Get forex quote data from Polygon
 * @param fromCurrency From currency code (e.g., EUR)
 * @param toCurrency To currency code (e.g., USD)
 */
export async function getForexQuote(fromCurrency: string, toCurrency: string): Promise<PolygonForexQuote> {
  const symbol = `C:${fromCurrency}${toCurrency}`;
  
  // Get previous day
  const today = new Date();
  let previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);
  
  // Format as YYYY-MM-DD
  const date = previousDay.toISOString().split('T')[0];
  
  return fetchPolygonData<PolygonForexQuote>({
    endpoint: `/v2/aggs/ticker/${symbol}/range/1/day/${date}/${date}`,
  });
}

/**
 * Search for tickers
 * @param query Search query
 * @param market Market type (stocks, crypto, fx)
 */
export async function searchTickers(query: string, market?: string) {
  const params: Record<string, string | number | boolean> = {
    search: query,
    active: true,
    sort: 'ticker',
    order: 'asc',
    limit: 10,
  };
  
  if (market) {
    params.market = market;
  }
  
  return fetchPolygonData({
    endpoint: '/v3/reference/tickers',
    params,
  });
}
