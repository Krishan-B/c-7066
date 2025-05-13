
import { TradeDirection } from "@/hooks/useTradeCalculations";

export type OrderType = 'market' | 'entry';

export interface TradeParams {
  assetSymbol: string;
  assetName: string;
  marketType: string;
  units: number;
  pricePerUnit: number;
  tradeType: TradeDirection;
  orderType: OrderType;
  stopLoss?: number | null;
  takeProfit?: number | null;
  expirationDate?: Date | null;
}

export interface OrderResult {
  success: boolean;
  tradeId?: string;
  message: string;
}
