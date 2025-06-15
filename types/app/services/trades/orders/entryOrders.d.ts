import { type TradeResult, type EntryOrderParams } from '../types';
/**
 * Place an entry order (limit/stop) through the Supabase edge function
 */
export declare function placeEntryOrder(params: EntryOrderParams): Promise<TradeResult>;
