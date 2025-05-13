
import { fetchAlphaVantageData } from "./client";

/**
 * Get stock quote data
 * @param symbol Stock symbol (e.g., AAPL)
 */
export async function getStockQuote(symbol: string) {
  return fetchAlphaVantageData('GLOBAL_QUOTE', { symbol });
}

/**
 * Get forex exchange rate
 * @param fromCurrency From currency code (e.g., USD)
 * @param toCurrency To currency code (e.g., EUR)
 */
export async function getForexRate(fromCurrency: string, toCurrency: string) {
  return fetchAlphaVantageData('CURRENCY_EXCHANGE_RATE', {
    from_currency: fromCurrency,
    to_currency: toCurrency
  });
}

/**
 * Search for securities (stocks, ETFs, mutual funds)
 * @param keywords Search keywords
 */
export async function searchSecurities(keywords: string) {
  return fetchAlphaVantageData('SYMBOL_SEARCH', { keywords });
}

/**
 * Get crypto currency quote
 * @param symbol Crypto symbol (e.g., BTC)
 * @param market Market (e.g., USD)
 */
export async function getCryptoQuote(symbol: string, market: string = 'USD') {
  return fetchAlphaVantageData('CURRENCY_INTRADAY', {
    symbol,
    market,
    interval: '5min',
    outputsize: 'compact'
  });
}
