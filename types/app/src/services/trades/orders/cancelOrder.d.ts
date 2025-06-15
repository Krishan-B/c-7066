import { type TradeResult } from '../types';
/**
 * Cancels a pending order
 */
export declare function cancelPendingOrder(tradeId: string): Promise<TradeResult>;
