import { type Asset } from "../types";
/**
 * Fetch market data from the market-data-service edge function
 */
export declare function fetchMarketDataService(marketTypes: string[], symbolMap?: Record<string, string[]>): Promise<Asset[]>;
