export type TradeDirection = 'buy' | 'sell';
export type OrderType = 'market' | 'entry';
export type TradeStatus = 'open' | 'pending' | 'closed' | 'cancelled' | 'failed';
export interface TradeBase {
    symbol: string;
    direction: TradeDirection;
    units: number;
    userId: string;
}
export interface MarketOrderParams {
    symbol: string;
    direction: 'buy' | 'sell';
    units: number;
    currentPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    userId: string;
    assetCategory?: string;
}
export interface EntryOrderParams {
    symbol: string;
    direction: 'buy' | 'sell';
    units: number;
    currentPrice: number;
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    expiration?: string;
    userId: string;
    assetCategory?: string;
}
export interface TradeResult {
    success: boolean;
    tradeId?: string;
    message: string;
    status: TradeStatus;
}
export interface PortfolioUpdateParams {
    userId: string;
    assetId: string;
    amount: number;
    price: number;
    direction: TradeDirection;
}
export interface PortfolioRemoveParams {
    userId: string;
    assetId: string;
}
export interface PortfolioUpdateResult {
    success: boolean;
    portfolioId?: string;
    message: string;
}
export interface Trade {
    id: string;
    user_id: string;
    asset_symbol: string;
    direction: TradeDirection;
    order_type: OrderType;
    units: number;
    price_per_unit: number;
    current_price?: number;
    stop_loss?: number;
    take_profit?: number;
    status: TradeStatus;
    open_date: string;
    close_date?: string;
    close_price?: number;
    pnl?: number;
    expiration_date?: string;
}
