// SECURITY FIX: Removed client-side API key management
// All external API calls now go through secure Supabase Edge Functions
// UPDATED: Yahoo Finance Integration - Phase 0 Final Task

export interface DataSource {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  requiresApiKey: boolean;
  assetClasses: string[];
  features: string[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// Define the data source enum - now supporting Yahoo Finance integration
export enum DataSourceType {
  YAHOO_FINANCE = 'yahoo_finance',
  SMART_ROUTER = 'smart_router',
  POLYGON_EDGE = 'polygon_edge',
  FINNHUB_EDGE = 'finnhub_edge',
  ALPHA_VANTAGE_EDGE = 'alpha_vantage_edge',
  MARKET_DATA_SERVICE = 'market_data_service',
}

// Available data sources with Yahoo Finance as primary
export const AVAILABLE_DATA_SOURCES: DataSource[] = [
  {
    id: 'YAHOO_FINANCE',
    name: 'Yahoo Finance',
    description: 'Primary data source with comprehensive market coverage and smart routing',
    isAvailable: true,
    requiresApiKey: false,
    assetClasses: ['FOREX', 'STOCKS', 'CRYPTO', 'INDICES', 'COMMODITIES'],
    features: ['real-time', 'historical', 'search', 'caching', 'fallback'],
    rateLimits: {
      requestsPerMinute: 200,
      requestsPerHour: 10000,
    },
  },
  {
    id: 'SMART_ROUTER',
    name: 'Smart Data Router',
    description: 'Intelligent routing between multiple data sources with automatic fallback',
    isAvailable: true,
    requiresApiKey: false,
    assetClasses: ['FOREX', 'STOCKS', 'CRYPTO', 'INDICES', 'COMMODITIES'],
    features: ['smart-routing', 'fallback', 'quality-validation', 'performance-optimization'],
    rateLimits: {
      requestsPerMinute: 300,
      requestsPerHour: 15000,
    },
  },
  {
    id: 'POLYGON_EDGE',
    name: 'Polygon (Edge Function)',
    description: 'High-quality financial data via secure edge function',
    isAvailable: true,
    requiresApiKey: false,
    assetClasses: ['FOREX', 'STOCKS', 'CRYPTO'],
    features: ['real-time', 'high-accuracy'],
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 2000,
    },
  },
  {
    id: 'MARKET_DATA_SERVICE',
    name: 'Legacy Market Data Service',
    description: 'Multi-provider market data service (legacy)',
    isAvailable: true,
    requiresApiKey: false,
    assetClasses: ['FOREX', 'STOCKS', 'CRYPTO', 'INDICES', 'COMMODITIES'],
    features: ['multi-provider', 'caching'],
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 5000,
    },
  },
];

// SECURITY: No longer accepting or storing API keys on client side
// All API keys are now managed securely in Supabase environment variables

export const getAvailableDataSources = (): DataSource[] => {
  return AVAILABLE_DATA_SOURCES.filter((source) => source.isAvailable);
};

export const getDataSourceById = (id: string): DataSource | undefined => {
  return AVAILABLE_DATA_SOURCES.find((source) => source.id === id);
};

export const getDataSourcesByAssetClass = (assetClass: string): DataSource[] => {
  return AVAILABLE_DATA_SOURCES.filter(
    (source) => source.isAvailable && source.assetClasses.includes(assetClass)
  );
};

// Always use edge functions for security - Yahoo Finance as primary
export const determineDataSource = async (
  assetClass?: string,
  preferHighReliability: boolean = true
): Promise<{ dataSource: DataSourceType; fallbacks: DataSourceType[] }> => {
  if (preferHighReliability) {
    // Use smart router for high reliability with automatic fallback
    return {
      dataSource: DataSourceType.SMART_ROUTER,
      fallbacks: [DataSourceType.YAHOO_FINANCE, DataSourceType.MARKET_DATA_SERVICE],
    };
  }

  // Primary: Use Yahoo Finance for best performance and coverage
  return {
    dataSource: DataSourceType.YAHOO_FINANCE,
    fallbacks: [DataSourceType.SMART_ROUTER, DataSourceType.POLYGON_EDGE],
  };
};

export const getOptimalDataSource = (assetClass: string): DataSourceType => {
  switch (assetClass) {
    case 'FOREX':
      return DataSourceType.YAHOO_FINANCE; // Best forex coverage
    case 'CRYPTO':
      return DataSourceType.SMART_ROUTER; // Smart routing for crypto
    case 'STOCKS':
      return DataSourceType.YAHOO_FINANCE; // Comprehensive stock data
    case 'INDICES':
      return DataSourceType.YAHOO_FINANCE; // Best indices coverage
    case 'COMMODITIES':
      return DataSourceType.YAHOO_FINANCE; // Good commodities data
    default:
      return DataSourceType.SMART_ROUTER; // Safe default with fallback
  }
};
