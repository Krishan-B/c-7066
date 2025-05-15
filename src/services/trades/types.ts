// Trade direction
export type TradeDirection = 'buy' | 'sell';

// Trade order types
export type OrderType = 'market' | 'entry';

// Trade status
export type TradeStatus = 'open' | 'pending' | 'closed' | 'cancelled' | 'failed';

// Basic trade data
export interface TradeBase {
  symbol: string;
  direction: TradeDirection;
  units: number;
  userId: string;
}

// Parameters for market orders (immediate execution)
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

// Parameters for entry orders (execution at specified price)
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

// Result of trade operations
export interface TradeResult {
  success: boolean;
  tradeId?: string;
  message: string;
  status: TradeStatus;
}

// Portfolio update parameters
export interface PortfolioUpdateParams {
  userId: string;
  assetId: string;
  amount: number;
  price: number;
  direction: TradeDirection;
}

// Portfolio remove parameters
export interface PortfolioRemoveParams {
  userId: string;
  assetId: string;
}

// Result of portfolio operations
export interface PortfolioUpdateResult {
  success: boolean;
  portfolioId?: string;
  message: string;
}

// Trade model
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
