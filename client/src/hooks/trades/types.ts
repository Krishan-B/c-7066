import { type DirectionEnum, type OrderStatusEnum, type OrderTypeEnum } from '@/types/schema';

import { type MarketType } from '../market/types';

export interface Trade {
  id: string;
  asset_symbol: string;
  asset_name: string;
  market_type: MarketType;
  units: number;
  price_per_unit: number;
  total_amount: number;
  trade_type: DirectionEnum;
  order_type: OrderTypeEnum;
  status: OrderStatusEnum;
  stop_loss: number | null;
  take_profit: number | null;
  expiration_date: string | null;
  created_at: string;
  executed_at: string | null;
  closed_at: string | null;
  pnl: number | null;
  current_price?: number;
  current_pnl?: number;
}

export interface TradeManagementState {
  openPositions: Trade[];
  pendingOrders: Trade[];
  closedTrades: Trade[];
  loading: {
    open: boolean;
    pending: boolean;
    closed: boolean;
  };
}

export interface TradeManagement extends TradeManagementState {
  fetchOpenPositions: () => Promise<void>;
  fetchPendingOrders: () => Promise<void>;
  fetchClosedTrades: () => Promise<void>;
  closePosition: (
    tradeId: string,
    currentPrice: number
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  cancelOrder: (tradeId: string) => Promise<{
    success: boolean;
    message: string;
  }>;
}
