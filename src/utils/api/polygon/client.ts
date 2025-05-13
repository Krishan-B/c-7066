
/**
 * Polygon.io API client
 */

const POLYGON_BASE_URL = 'https://api.polygon.io';
let POLYGON_API_KEY: string | undefined;

/**
 * Set the Polygon.io API key
 * @param apiKey The API key
 */
export function setPolygonApiKey(apiKey: string) {
  POLYGON_API_KEY = apiKey;
}

/**
 * Get the Polygon.io API key
 */
export function getPolygonApiKey(): string | undefined {
  return POLYGON_API_KEY;
}

/**
 * Check if the Polygon.io API key is set
 */
export function hasPolygonApiKey(): boolean {
  return !!POLYGON_API_KEY;
}

interface PolygonRequestOptions {
  endpoint: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Make a request to the Polygon.io API
 * @param options Request options
 * @returns Response data
 */
export async function fetchPolygonData<T>(options: PolygonRequestOptions): Promise<T> {
  if (!POLYGON_API_KEY) {
    throw new Error('Polygon API key is not set');
  }

  const { endpoint, params = {} } = options;
  
  // Append API key to params
  const queryParams = new URLSearchParams();
  queryParams.append('apiKey', POLYGON_API_KEY);
  
  // Add additional params
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });
  
  const url = `${POLYGON_BASE_URL}${endpoint}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Polygon API error (${response.status}): ${errorText}`);
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    console.error('Polygon API request failed:', error);
    throw error;
  }
}
