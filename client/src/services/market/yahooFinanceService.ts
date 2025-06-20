/**
 * Yahoo Finance Client Service - Phase 0 Integration
 * Client-side service for interacting with Yahoo Finance edge functions
 * Date: June 19, 2025
 */

import { DataSource } from './apiKeyManager';

export interface YahooFinanceQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  marketCap?: number;
  currency: string;
  dataSource: string;
  timestamp: string;
}

export interface YahooFinanceHistoricalData {
  meta: {
    currency: string;
    symbol: string;
    exchangeName: string;
    instrumentType: string;
    firstTradeDate: number;
    regularMarketTime: number;
    gmtoffset: number;
    timezone: string;
    exchangeTimezoneName: string;
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }>;
  };
}

export interface YahooFinanceSearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  sector: string;
  industry: string;
  exchange: string;
  market: string;
  type: string;
}

export interface DataSourceResponse<T> {
  data: T;
  metadata: {
    source: string;
    attempt: number;
    responseTimeMs: number;
    symbolsRequested: number;
    symbolsReturned: number;
    dataType: string;
    dataQuality: {
      isValid: boolean;
      issues: string[];
    };
    rateLimitRemaining: number;
    timestamp: string;
  };
}

export class YahooFinanceService {
  private static readonly YAHOO_FINANCE_ENDPOINT = '/supabase/functions/yahoo-finance-service';
  private static readonly SMART_ROUTER_ENDPOINT = '/supabase/functions/smart-data-router';

  /**
   * Get real-time quotes for multiple symbols
   */
  static async getQuotes(
    symbols: string[],
    options: {
      useCache?: boolean;
      preferredSource?: 'yahoo_finance' | 'polygon' | 'coingecko' | 'auto';
      enableFallback?: boolean;
    } = {}
  ): Promise<YahooFinanceQuote[]> {
    const { useCache = true, preferredSource = 'auto', enableFallback = true } = options;

    try {
      console.log(`Fetching quotes for ${symbols.length} symbols via smart router`);

      const response = await fetch(this.SMART_ROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols,
          dataType: 'quote',
          preferredSource,
          enableFallback,
          useCache,
        }),
      });

      if (!response.ok) {
        throw new Error(`Smart router error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch market data');
      }

      console.log(
        `Retrieved quotes from ${result.metadata.source} in ${result.metadata.responseTimeMs}ms`
      );

      return result.data;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw new Error(
        `Failed to fetch market data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get historical data for a single symbol
   */
  static async getHistoricalData(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo' = '1d',
    period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '1mo'
  ): Promise<YahooFinanceHistoricalData> {
    try {
      console.log(
        `Fetching historical data for ${symbol}, interval: ${interval}, period: ${period}`
      );

      const response = await fetch(this.YAHOO_FINANCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: [symbol],
          dataType: 'history',
          interval,
          period,
        }),
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch historical data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error(
        `Failed to fetch historical data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Search for symbols
   */
  static async searchSymbols(query: string): Promise<YahooFinanceSearchResult[]> {
    try {
      console.log(`Searching for symbols: ${query}`);

      const response = await fetch(this.YAHOO_FINANCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: [query],
          dataType: 'search',
        }),
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance search error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to search symbols');
      }

      return result.data;
    } catch (error) {
      console.error('Error searching symbols:', error);
      throw new Error(
        `Failed to search symbols: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get market data for specific asset classes
   */
  static async getMarketDataByAssetClass(
    assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES',
    limit: number = 10
  ): Promise<YahooFinanceQuote[]> {
    // Predefined symbols for each asset class
    const assetClassSymbols: Record<string, string[]> = {
      FOREX: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'],
      CRYPTO: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'DOTUSD', 'SOLUSD'],
      STOCKS: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
      INDICES: ['SPX500', 'NAS100', 'UK100', 'GER40', 'JPN225'],
      COMMODITIES: ['XAUUSD', 'XAGUSD', 'WTIUSD', 'NATGAS'],
    };

    const symbols = assetClassSymbols[assetClass]?.slice(0, limit) || [];

    if (symbols.length === 0) {
      throw new Error(`No symbols available for asset class: ${assetClass}`);
    }

    return this.getQuotes(symbols, { preferredSource: 'yahoo_finance' });
  }

  /**
   * Get comprehensive market overview
   */
  static async getMarketOverview(): Promise<{
    forex: YahooFinanceQuote[];
    stocks: YahooFinanceQuote[];
    crypto: YahooFinanceQuote[];
    indices: YahooFinanceQuote[];
    commodities: YahooFinanceQuote[];
  }> {
    try {
      console.log('Fetching comprehensive market overview');

      const [forex, stocks, crypto, indices, commodities] = await Promise.all([
        this.getMarketDataByAssetClass('FOREX', 6),
        this.getMarketDataByAssetClass('STOCKS', 5),
        this.getMarketDataByAssetClass('CRYPTO', 5),
        this.getMarketDataByAssetClass('INDICES', 5),
        this.getMarketDataByAssetClass('COMMODITIES', 4),
      ]);

      return {
        forex,
        stocks,
        crypto,
        indices,
        commodities,
      };
    } catch (error) {
      console.error('Error fetching market overview:', error);
      throw new Error(
        `Failed to fetch market overview: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if Yahoo Finance service is available
   */
  static async checkServiceHealth(): Promise<{
    available: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.YAHOO_FINANCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: ['AAPL'],
          dataType: 'quote',
          useCache: false,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          available: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const result = await response.json();

      return {
        available: result.success,
        responseTime,
        error: result.success ? undefined : result.error,
      };
    } catch (error) {
      return {
        available: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export for backward compatibility with existing apiKeyManager
export const YahooFinanceDataSource: DataSource = {
  id: 'YAHOO_FINANCE',
  name: 'Yahoo Finance',
  description:
    'Real-time market data from Yahoo Finance with smart routing and fallback mechanisms',
  isAvailable: true,
  requiresApiKey: false,
  assetClasses: ['FOREX', 'STOCKS', 'CRYPTO', 'INDICES', 'COMMODITIES'],
  features: ['real-time', 'historical', 'search', 'caching', 'fallback'],
  rateLimits: {
    requestsPerMinute: 200,
    requestsPerHour: 10000,
  },
};
