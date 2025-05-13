
import { fetchFinnhubData } from './client';

/**
 * Get a stock quote from Finnhub
 * @param symbol Stock symbol
 * @returns Stock quote data
 */
export async function getStockQuote(symbol: string) {
  return fetchFinnhubData({
    endpoint: '/quote',
    params: { symbol }
  });
}

/**
 * Get a crypto quote from Finnhub
 * @param symbol Crypto symbol (e.g., 'BINANCE:BTCUSDT')
 * @returns Crypto quote data
 */
export async function getCryptoQuote(symbol: string) {
  // Finnhub requires crypto symbols to be prefixed with an exchange
  const formattedSymbol = symbol.includes(':') ? symbol : `BINANCE:${symbol}USD`;
  return fetchFinnhubData({
    endpoint: '/quote',
    params: { symbol: formattedSymbol }
  });
}

/**
 * Get a forex quote from Finnhub
 * @param fromCurrency The base currency
 * @param toCurrency The quote currency
 * @returns Forex quote data
 */
export async function getForexQuote(fromCurrency: string, toCurrency: string) {
  const symbol = `OANDA:${fromCurrency}_${toCurrency}`;
  return fetchFinnhubData({
    endpoint: '/quote',
    params: { symbol }
  });
}

/**
 * Search for symbols using Finnhub
 * @param query Search query
 * @returns Array of matching symbols
 */
export async function searchSymbols(query: string) {
  return fetchFinnhubData({
    endpoint: '/search',
    params: { q: query }
  });
}

/**
 * Get company profile information
 * @param symbol Company symbol
 * @returns Company profile data
 */
export async function getCompanyProfile(symbol: string) {
  return fetchFinnhubData({
    endpoint: '/stock/profile2',
    params: { symbol }
  });
}

/**
 * Get market news from Finnhub
 * @param category News category
 * @param minId Minimum news ID (optional)
 * @returns Array of news items
 */
export async function getMarketNews(category: string = 'general', minId?: number) {
  const params: Record<string, string | number> = { category };
  if (minId) {
    params.minId = minId;
  }
  
  return fetchFinnhubData({
    endpoint: '/news',
    params
  });
}
