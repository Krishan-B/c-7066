import { type Asset } from "../types";
/**
 * Check if there's recent market data in the database
 */
export declare function getRecentMarketData(marketTypes: string[]): Promise<Asset[] | null>;
/**
 * Update market data in the database
 */
export declare function updateMarketDataInDatabase(assets: Asset[]): Promise<void>;
