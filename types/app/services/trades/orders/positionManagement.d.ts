import { type TradeResult } from '../types';
/**
 * Close an open position at the current market price
 */
export declare function closePosition(tradeId: string, currentPrice: number): Promise<TradeResult>;
/**
 * Cancel a pending order
 */
export declare function cancelPendingOrder(tradeId: string): Promise<TradeResult>;
