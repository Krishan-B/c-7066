import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Initialize cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class FinanceApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/proxy',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          console.warn('Rate limit reached for financial API');
        }
        return Promise.reject(error);
      }
    );
  }

  private getCacheKey(path: string, params?: Record<string, any>): string {
    return `${path}:${JSON.stringify(params || {})}`;
  }

  private isCacheValid(cacheEntry: { timestamp: number }): boolean {
    return Date.now() - cacheEntry.timestamp < CACHE_TTL;
  }

  private async fetchWithCache<T>(path: string, params?: Record<string, any>): Promise<T> {
    const cacheKey = this.getCacheKey(path, params);
    const cached = cache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    const response: AxiosResponse<T> = await this.client.get(path, { params });
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    return response.data;
  }

  // Polygon API Methods
  async getStockQuote(symbol: string) {
    return this.fetchWithCache(`/polygon/stocks/${symbol}/quotes/latest`);
  }

  async getStockCandles(symbol: string, timeframe: string) {
    return this.fetchWithCache(`/polygon/stocks/${symbol}/candles`, { timeframe });
  }

  // Alpha Vantage API Methods
  async getCompanyOverview(symbol: string) {
    return this.fetchWithCache('/alphavantage/query', {
      function: 'OVERVIEW',
      symbol,
    });
  }

  async getEarnings(symbol: string) {
    return this.fetchWithCache('/alphavantage/query', {
      function: 'EARNINGS',
      symbol,
    });
  }

  // Finnhub API Methods
  async getCompanyNews(symbol: string) {
    return this.fetchWithCache(`/finnhub/company-news/${symbol}`);
  }

  async getMarketSentiment(symbol: string) {
    return this.fetchWithCache(`/finnhub/sentiment/${symbol}`);
  }
}

export const financeApi = new FinanceApiClient();
