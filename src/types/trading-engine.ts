
export interface TradingOrder {
  id: string;
  user_id: string;
  symbol: string;
  asset_class: string;
  order_type: 'market' | 'entry' | 'stop_loss' | 'take_profit';
  direction: 'buy' | 'sell';
  units: number;
  requested_price: number;
  execution_price?: number;
  position_value: number;
  margin_required: number;
  leverage_ratio: number;
  stop_loss_price?: number;
  take_profit_price?: number;
  expiration_date?: string;
  status: 'pending' | 'executed' | 'cancelled' | 'expired' | 'filled';
  created_at: string;
  executed_at?: string;
  cancelled_at?: string;
  rejected_reason?: string;
  fees: number;
  slippage: number;
}

export interface TradingPosition {
  id: string;
  user_id: string;
  order_id: string;
  symbol: string;
  asset_class: string;
  direction: 'buy' | 'sell';
  units: number;
  entry_price: number;
  current_price: number;
  position_value: number;
  margin_used: number;
  leverage_ratio: number;
  unrealized_pnl: number;
  daily_pnl: number;
  total_fees: number;
  stop_loss_price?: number;
  take_profit_price?: number;
  opened_at: string;
  last_updated: string;
  status: 'open' | 'closed';
}

export interface AccountMetrics {
  id: string;
  user_id: string;
  balance: number;
  bonus: number;
  equity: number;
  used_margin: number;
  available_funds: number;
  unrealized_pnl: number;
  realized_pnl: number;
  total_exposure: number;
  margin_level: number;
  open_positions_count: number;
  pending_orders_count: number;
  last_updated: string;
}

export interface OrderHistory {
  id: string;
  user_id: string;
  order_id: string;
  action: string;
  details: any;
  timestamp: string;
}

export interface PlaceOrderRequest {
  symbol: string;
  asset_class: string;
  order_type: 'market' | 'entry';
  direction: 'buy' | 'sell';
  units: number;
  requested_price: number;
  stop_loss_price?: number;
  take_profit_price?: number;
  expiration_date?: string;
}

export const ASSET_LEVERAGE_CONFIG = {
  stocks: { leverage: 20, margin: 0.05 },
  indices: { leverage: 50, margin: 0.02 },
  commodities: { leverage: 50, margin: 0.02 },
  forex: { leverage: 100, margin: 0.01 },
  crypto: { leverage: 50, margin: 0.02 }
} as const;

export const DEFAULT_TP_SL_CONFIG = {
  stocks: { tp: 0.05, sl: 0.03 },
  indices: { tp: 0.03, sl: 0.02 },
  commodities: { tp: 0.04, sl: 0.03 },
  forex: { tp: 0.02, sl: 0.01 },
  crypto: { tp: 0.08, sl: 0.05 }
} as const;
