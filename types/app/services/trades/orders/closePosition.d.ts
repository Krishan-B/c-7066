import { type TradeResult } from '../types';
/**
 * Closes an open trade position
 */
export declare function closePosition(tradeId: string, currentPrice: number): Promise<TradeResult>;
