import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Base API URL for Alpha Vantage
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetches an API key from Supabase secrets
 */
async function getApiKey(): Promise<string | null> {
  try {
    // Fetch API key from Supabase secrets
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { secretName: 'ALPHA_VANTAGE_API_KEY' }
    });

    if (error || !data?.value) {
      console.error('Failed to retrieve Alpha Vantage API key:', error);
      return null;
    }

    return data.value;
  } catch (error) {
    console.error('Error fetching Alpha Vantage API key:', error);
    return null;
  }
}

/**
 * Makes a request to Alpha Vantage API
 * @param endpoint The endpoint to call
 * @param params Parameters to include in the request
 */
export async function fetchAlphaVantageData(
  endpoint: string, 
  params: Record<string, string>
): Promise<any> {
  try {
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      console.error("API Key Missing - Alpha Vantage API key is not configured.");
      return { error: "API key missing" };
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      ...params,
      apikey: apiKey,
      function: endpoint,
    });
    
    console.log(`Fetching Alpha Vantage data: ${endpoint}`);
    
    // Make the API call
    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API error messages
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (data['Information']) {
      console.info('Alpha Vantage info:', data['Information']);
      // This usually means we hit an API limit
      if (data['Information'].includes('API call frequency')) {
        console.warn("API Rate Limit - Alpha Vantage API rate limit reached. Using simulated data instead.");
        return { error: "Rate limit", information: data['Information'] };
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching data from Alpha Vantage:', error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

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

/**
 * Transform Alpha Vantage stock data to our app's Asset format
 */
export function transformStockData(data: any): any {
  if (!data || !data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) return null;
  
  const quote = data['Global Quote'];
  
  return {
    symbol: quote['01. symbol'],
    name: quote['01. symbol'], // Alpha Vantage doesn't provide name in quote
    price: parseFloat(quote['05. price']),
    change_percentage: parseFloat(quote['10. change percent'].replace('%', '')),
    volume: formatVolume(quote['06. volume']),
    market_type: 'Stock',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Alpha Vantage forex data to our app's Asset format
 */
export function transformForexData(data: any): any {
  if (!data || !data['Realtime Currency Exchange Rate']) return null;
  
  const exchangeRate = data['Realtime Currency Exchange Rate'];
  
  const fromCurrency = exchangeRate['1. From_Currency Code'];
  const toCurrency = exchangeRate['3. To_Currency Code'];
  
  return {
    symbol: `${fromCurrency}${toCurrency}`,
    name: `${fromCurrency}/${toCurrency}`,
    price: parseFloat(exchangeRate['5. Exchange Rate']),
    change_percentage: 0, // Alpha Vantage doesn't provide change in this endpoint
    volume: "N/A",
    market_type: 'Forex',
    last_updated: exchangeRate['6. Last Refreshed']
  };
}

/**
 * Transform Alpha Vantage crypto data to our app's Asset format
 */
export function transformCryptoData(data: any): any {
  if (!data || !data['Time Series Crypto (5min)']) return null;
  
  // Get the most recent data point
  const timeSeriesData = data['Time Series Crypto (5min)'];
  const timestamps = Object.keys(timeSeriesData).sort().reverse();
  
  if (timestamps.length === 0) return null;
  
  const latestData = timeSeriesData[timestamps[0]];
  const prevData = timestamps.length > 1 ? timeSeriesData[timestamps[1]] : null;
  
  const currentPrice = parseFloat(latestData['4. close']);
  let changePercentage = 0;
  
  if (prevData) {
    const prevPrice = parseFloat(prevData['4. close']);
    changePercentage = ((currentPrice - prevPrice) / prevPrice) * 100;
  }
  
  const metaData = data['Meta Data'];
  const symbol = metaData ? metaData['2. Digital Currency Code'] : data.symbol || "CRYPTO";
  const market = metaData ? metaData['4. Market Code'] : "USD";
  
  return {
    symbol: `${symbol}${market}`,
    name: `${symbol}/${market}`,
    price: currentPrice,
    change_percentage: changePercentage,
    volume: formatVolume(latestData['5. volume']),
    market_type: 'Crypto',
    last_updated: timestamps[0]
  };
}

/**
 * Format volume to a readable string (e.g. 1.2B, 45.3M, etc.)
 */
function formatVolume(volumeStr: string): string {
  const volume = parseFloat(volumeStr);
  if (isNaN(volume)) return 'N/A';
  
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(1)}K`;
  } else {
    return `$${volume.toFixed(0)}`;
  }
}
