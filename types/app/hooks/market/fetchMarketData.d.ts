import { type Asset } from './types';
/**
 * Fetch market data by market type
 * In a real implementation, this would make API calls to fetch live market data
 */
export declare function fetchMarketData(marketType: string | string[]): Promise<Asset[]>;
