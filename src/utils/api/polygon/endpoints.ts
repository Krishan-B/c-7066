
import { getPolygonData } from './client';

/**
 * Get ticker details
 */
export async function getTickerDetails(symbol: string) {
  return await getPolygonData(`/v3/reference/tickers/${symbol}`);
}

/**
 * Get previous close for a ticker
 */
export async function getPreviousClose(symbol: string) {
  return await getPolygonData(`/v2/aggs/ticker/${symbol}/prev`);
}

/**
 * Get daily OHLC data for a ticker
 */
export async function getDailyOHLC(symbol: string, from: string, to: string) {
  return await getPolygonData(`/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`);
}

/**
 * Get last trade for a ticker
 */
export async function getLastTrade(symbol: string) {
  return await getPolygonData(`/v2/last/trade/${symbol}`);
}

/**
 * Get last quote for a ticker
 */
export async function getLastQuote(symbol: string) {
  return await getPolygonData(`/v2/last/nbbo/${symbol}`);
}

/**
 * Get company news
 */
export async function getCompanyNews(symbol: string, limit = 10) {
  return await getPolygonData(`/v2/reference/news`, { ticker: symbol, limit });
}
