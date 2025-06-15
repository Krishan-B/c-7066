import { type TradeResult, type MarketOrderParams } from '../types';
/**
 * Execute a market order through the Supabase edge function
 */
export declare function executeMarketOrder(params: MarketOrderParams): Promise<TradeResult>;
