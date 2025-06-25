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
}
