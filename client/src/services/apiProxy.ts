import axios, { AxiosError } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api/proxy',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Error types
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Response types
interface QuoteData {
  symbol: string;
  price: number;
  timestamp: number;
}

// Helper to handle API errors consistently
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    return {
      message: error.response.data.message || 'Request failed',
      code: error.response.data.error || 'UNKNOWN_ERROR',
      status: error.response.status,
    };
  }
  return {
    message: error.message,
    code: 'NETWORK_ERROR',
    status: 0,
  };
};

// Helper to check if cached data is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

export const MarketDataService = {
  // Polygon API
  async getQuote(symbol: string): Promise<QuoteData> {
    const cacheKey = `polygon:quote:${symbol}`;
    const cached = cache.get(cacheKey);

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await api.get(`/polygon/quotes/${symbol}`);
      const data = {
        symbol,
        price: response.data.last.price,
        timestamp: response.data.last.timestamp,
      };

      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Alpha Vantage API
  async searchSymbols(query: string): Promise<string[]> {
    const cacheKey = `alphavantage:search:${query}`;
    const cached = cache.get(cacheKey);

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await api.get('/alphavantage/query', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
        },
      });

      const data = response.data.bestMatches.map((match: any) => match['1. symbol']);
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Finnhub API
  async getCompanyProfile(symbol: string): Promise<any> {
    const cacheKey = `finnhub:profile:${symbol}`;
    const cached = cache.get(cacheKey);

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const response = await api.get(`/finnhub/stock/profile2`, {
        params: { symbol },
      });

      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Cache management
  clearCache(): void {
    cache.clear();
  },

  removeCacheEntry(key: string): void {
    cache.delete(key);
  },
};
