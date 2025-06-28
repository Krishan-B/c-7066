// Shared types for orders and positions

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  asset_class: string;
  order_type: "market" | "entry";
  direction: "buy" | "sell";
  quantity: number;
  price: number | null;
  status: "pending" | "filled" | "cancelled";
  stop_loss_price: number | null;
  take_profit_price: number | null;
  created_at: string;
  filled_at?: string;
  updated_at?: string;
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  marginRequired: number;
  tp?: number | null;
  sl?: number | null;
  createdAt: string;
  unrealizedPnl: number;
}
