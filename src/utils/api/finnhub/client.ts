
/**
 * Finnhub.io API client
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

interface FinnhubRequestOptions {
  endpoint: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Make a request to the Finnhub API
 * @param options Request options
 * @returns Response data
 */
export async function fetchFinnhubData<T>(options: FinnhubRequestOptions): Promise<T> {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key is not set');
  }

  const { endpoint, params = {} } = options;
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  // Add additional params
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });
  
  // Add API key
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
