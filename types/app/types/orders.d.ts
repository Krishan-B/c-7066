export interface BaseOrder {
    id: string;
    symbol: string;
    asset: string;
    amount: number;
    status: 'completed' | 'pending' | 'canceled' | 'active';
    date: string;
}
export interface OpenTrade extends BaseOrder {
    openRate: number;
    direction: 'Buy' | 'Sell';
    units: number;
    marketRate: number;
    marketValue: number;
    totalPnl: number;
    stopLoss: number | null;
    takeProfit: number | null;
    openDate: string;
}
export interface PendingOrder extends BaseOrder {
    orderRate: number;
    direction: 'Buy' | 'Sell';
    units: number;
    marketRate: number;
    stopLoss: number | null;
    takeProfit: number | null;
    orderDate: string;
}
export interface ClosedTrade extends BaseOrder {
    openRate: number;
    closeRate: number;
    direction: 'Buy' | 'Sell';
    units: number;
    marketValue: number;
    totalPnl: number;
    stopLoss: number | null;
    takeProfit: number | null;
    openDate: string;
    closeDate: string;
}
export interface OrderHistory extends BaseOrder {
    orderRate: number;
    direction: 'Buy' | 'Sell';
    units: number;
    stopLoss: number | null;
    takeProfit: number | null;
    orderDate: string;
    closeDate: string;
}
export type Order = OpenTrade | PendingOrder | ClosedTrade | OrderHistory;
