/**
 * Finnhub API client
 */
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
let FINNHUB_API_KEY: string | undefined;

/**
 * Set the Finnhub API key
 * @param apiKey The API key
 */
export function setFinnhubApiKey(apiKey: string) {
  FINNHUB_API_KEY = apiKey;
}

/**
 * Get the Finnhub API key
 */
export function getFinnhubApiKey(): string | undefined {
  return FINNHUB_API_KEY;
}

/**
 * Check if the Finnhub API key is set
 */
export function hasFinnhubApiKey(): boolean {
  return !!FINNHUB_API_KEY;
}

/**
 * Make a request to the Finnhub API
 * @param endpoint The API endpoint
 * @param params Additional query parameters
 * @returns Response data
 */
async function makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key is not set');
  }

  const queryParams = new URLSearchParams(params);
  queryParams.append('token', FINNHUB_API_KEY);

  const url = `${FINNHUB_BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Finnhub API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error('Finnhub API request failed:', error);
    throw error;
  }
}

// Interface for Finnhub quote response
export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

/**
 * Get a stock quote
 * @param symbol Stock symbol
 */
export async function getStockQuote(symbol: string): Promise<FinnhubQuote> {
  return makeRequest<FinnhubQuote>('/quote', { symbol });
}

/**
 * Get a crypto quote
 * @param symbol Crypto symbol
 */
export async function getCryptoQuote(symbol: string): Promise<FinnhubQuote> {
  return makeRequest<FinnhubQuote>('/quote', { symbol });
}

/**
 * Get a forex quote
 * @param fromCurrency From currency
 * @param _toCurrency To currency
 */
export async function getForexQuote(
  fromCurrency: string,
  _toCurrency: string
): Promise<FinnhubQuote> {
  return makeRequest<FinnhubQuote>('/forex/rates', { base: fromCurrency });
}

/**
 * Fetch market data for multiple symbols
 * @param symbols Array of symbols to fetch
 * @param assetType Type of asset (Stocks, Crypto, etc.)
 */
export async function getMarketData(symbols: string[], assetType: string) {
  console.warn(`Fetching ${assetType} data for symbols:`, symbols);

  const results = [];

  for (const symbol of symbols) {
    try {
      let quote: FinnhubQuote;

      if (assetType === 'Stocks') {
        quote = await getStockQuote(symbol);
      } else if (assetType === 'Crypto') {
        quote = await getCryptoQuote(symbol);
      } else if (assetType === 'Forex') {
        const [fromCurrency] = symbol.split('_');
        quote = await getForexQuote(fromCurrency, '');
      } else {
        quote = await getStockQuote(symbol);
      }

      results.push({
        symbol,
        assetType,
        quote,
      });
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
    }
  }

  return results;
}
