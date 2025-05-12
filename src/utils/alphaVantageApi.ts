
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      toast({
        title: "API Key Missing",
        description: "Alpha Vantage API key is not configured.",
        variant: "destructive"
      });
      return null;
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      ...params,
      apikey: apiKey,
      function: endpoint,
    });
    
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
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching data from Alpha Vantage:', error);
    toast({
      title: "Data Fetch Error",
      description: error instanceof Error ? error.message : "Failed to fetch market data",
      variant: "destructive"
    });
    return null;
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
  return fetchAlphaVantageData('CRYPTO_QUOTE', {
    symbol,
    market
  });
}

/**
 * Transform Alpha Vantage stock data to our app's Asset format
 */
export function transformStockData(data: any): any {
  if (!data || !data['Global Quote']) return null;
  
  const quote = data['Global Quote'];
  
  return {
    symbol: quote['01. symbol'],
    name: quote['01. symbol'], // Alpha Vantage doesn't provide name in quote
    price: parseFloat(quote['05. price']),
    change_percentage: parseFloat(quote['10. change percent'].replace('%', '')),
    volume: quote['06. volume'],
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
