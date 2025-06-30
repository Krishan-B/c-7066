export interface Position {
  id: string;
  symbol: string;
  direction: string;
  quantity: number;
  entryPrice: number;
  marginRequired: number;
  tp?: number | null;
  sl?: number | null;
  createdAt: string;
  unrealizedPnl: number;
}

export interface OrderRequest {
  symbol: string;
  direction: "buy" | "sell";
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiryDate?: string;
}

export interface OrderUpdate {
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiryDate?: string;
}
