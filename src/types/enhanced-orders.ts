
export type OrderCategory = 'primary' | 'stop_loss' | 'take_profit' | 'trailing_stop';

export type EnhancedOrderType = 
  | 'market' 
  | 'limit' 
  | 'stop' 
  | 'stop_limit' 
  | 'stop_loss' 
  | 'take_profit' 
  | 'trailing_stop';

export interface StopLossTakeProfitConfig {
  enableStopLoss: boolean;
  stopLossPrice?: number;
  stopLossDistance?: number;
  enableTakeProfit: boolean;
  takeProfitPrice?: number;
  takeProfitDistance?: number;
  enableTrailingStop: boolean;
  trailingStopDistance?: number;
}

export interface EnhancedOrder {
  id: string;
  user_id: string;
  symbol: string;
  asset_class: string;
  order_type: EnhancedOrderType;
  order_category: OrderCategory;
  direction: 'buy' | 'sell';
  units: number;
  requested_price: number;
  execution_price?: number;
  position_value: number;
  margin_required: number;
  stop_loss_price?: number;
  take_profit_price?: number;
  trailing_stop_distance?: number;
  order_group_id?: string;
  parent_order_id?: string;
  status: string;
  created_at: string;
  executed_at?: string;
  cancelled_at?: string;
  expiration_date?: string;
  rejected_reason?: string;
}

export interface OrderGroup {
  id: string;
  primaryOrder: EnhancedOrder;
  stopLossOrder?: EnhancedOrder;
  takeProfitOrder?: EnhancedOrder;
  trailingStopOrder?: EnhancedOrder;
}
