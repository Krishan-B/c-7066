import { supabase } from "@/integrations/supabase/client";

/**
 * Alpha Vantage API client
 */
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
let ALPHA_VANTAGE_API_KEY: string | undefined;

/**
 * Set the Alpha Vantage API key
 * @param apiKey The API key
 */
export function setAlphaVantageApiKey(apiKey: string) {
  ALPHA_VANTAGE_API_KEY = apiKey;
}

/**
 * Get the Alpha Vantage API key
 */
export function getAlphaVantageApiKey(): string | undefined {
  return ALPHA_VANTAGE_API_KEY;
}

/**
 * Check if the Alpha Vantage API key is set
 */
export function hasAlphaVantageApiKey(): boolean {
  return !!ALPHA_VANTAGE_API_KEY;
}

/**
 * Fetches an API key from Supabase secrets
 */
export async function getApiKey(): Promise<string | null> {
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
  } catch (error: unknown) {
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
): Promise<unknown> {
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
  } catch (error: unknown) {
    console.error('Error fetching Alpha Vantage data:', error);
    return { error: (error instanceof Error ? error.message : String(error)) };
  }
}
