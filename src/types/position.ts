export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  marginRequired: number;
  tp: number | null;
  sl: number | null;
  createdAt: string;
  unrealizedPnl: number;
}
