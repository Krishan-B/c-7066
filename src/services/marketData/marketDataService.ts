import { env } from '@/config/env';

export interface MarketDataResponse {
  symbol: string;
  price: number;
  timestamp: number;
  bid?: number;
  ask?: number;
  volume?: number;
}

export class MarketDataService {
  private static instance: MarketDataService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = env.MARKET_DATA_BASE_URL;
    this.apiKey = env.MARKET_DATA_API_KEY;
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private async fetchWithAuth(endpoint: string, params: Record<string, string> = {}) {
    const queryParams = new URLSearchParams({
      ...params,
      apikey: this.apiKey
    });

    const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Market data API error: ${response.statusText}`);
    }
    return response.json();
  }

  public async getPrice(symbol: string): Promise<MarketDataResponse> {
    try {
      const data = await this.fetchWithAuth('/price', { symbol });
      return {
        symbol,
        price: data.price,
        timestamp: data.timestamp,
        bid: data.bid,
        ask: data.ask,
        volume: data.volume
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }

  public async getMultiplePrices(symbols: string[]): Promise<MarketDataResponse[]> {
    try {
      const data = await this.fetchWithAuth('/prices', {
        symbols: symbols.join(',')
      });
      return data.map((item: any) => ({
        symbol: item.symbol,
        price: item.price,
        timestamp: item.timestamp,
        bid: item.bid,
        ask: item.ask,
        volume: item.volume
      }));
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const marketDataService = MarketDataService.getInstance();