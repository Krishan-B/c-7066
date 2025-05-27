import { supabase } from '@/integrations/supabase/client';

// Base URL for Polygon.io API
const POLYGON_API_BASE_URL = 'https://api.polygon.io';

// Store API key in memory (not secure for production)
let POLYGON_API_KEY: string | null = null;

/**
 * Set the API key for Polygon.io
 */
export function setPolygonApiKey(apiKey: string): void {
  POLYGON_API_KEY = apiKey;
}

/**
 * Get the API key from Supabase Edge Function
 */
export async function getPolygonApiKey(): Promise<string | null> {
  // Use the cached API key if available
  if (POLYGON_API_KEY) {
    return POLYGON_API_KEY;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { secretName: 'POLYGON_API_KEY' }
    });
    
    if (error) {
      console.error('Error fetching Polygon API key:', error);
      return null;
    }
    
    // Cache the API key
    if (data?.value) {
      POLYGON_API_KEY = data.value;
    }
    
    return POLYGON_API_KEY;
  } catch (error) {
    console.error('Error in getPolygonApiKey:', error);
    return null;
  }
}

/**
 * Check if the Polygon API key is available
 */
export function hasPolygonApiKey(): boolean {
  return !!POLYGON_API_KEY;
}

/**
 * Make a request to the Polygon.io API
 */
export async function polygonRequest<T>(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  try {
    const apiKey = POLYGON_API_KEY || await getPolygonApiKey();
    
    if (!apiKey) {
      throw new Error('Polygon API key not found');
    }
    
    // Build URL with query parameters
    const url = new URL(`${POLYGON_API_BASE_URL}${endpoint}`);
    
    // Add API key to params
    params.apiKey = apiKey;
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    // Make the request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Polygon API error (${response.status}): ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('Error in polygonRequest:', error);
    throw error;
  }
}

/**
 * Helper function for simplified requests
 */
export async function getPolygonData<T>(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  try {
    return await polygonRequest<T>(endpoint, params);
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return null;
  }
}
