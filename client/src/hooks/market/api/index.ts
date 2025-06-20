// SECURITY FIX: Removed client-side API key management exports
export { DataSource, getAvailableDataSources, determineDataSource } from './apiKeyManager';

// Export secure data fetching handlers (Edge Functions only)
export { fetchEdgeFunctionData } from './edgeFunctionHandler';
export { fetchMarketDataService as fetchMultipleMarketData } from './marketDataServiceHandler';

// DEPRECATED: Direct API handlers removed for security
// All data now flows through secure Supabase Edge Functions
