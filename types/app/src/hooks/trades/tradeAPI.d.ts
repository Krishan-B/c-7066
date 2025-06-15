import { type Trade } from './types';
export declare const fetchTradesByStatus: (status: string | string[]) => Promise<Trade[]>;
export declare const closeTradePosition: (tradeId: string, currentPrice: number) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const cancelTradeOrder: (tradeId: string) => Promise<{
    success: boolean;
    message: string;
}>;
