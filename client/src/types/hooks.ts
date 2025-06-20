/**
 * Hook Types
 * Type definitions for all custom hooks in the application
 */
import { type Order, type Position } from '@/shared/schema';

import { type Asset } from '@/hooks/market/types';
import { type ClosedPosition, type PortfolioMetrics, type Transaction } from '@/types/account';

// Portfolio Hooks
export interface UsePortfolioReturn {
  assets: Asset[];
  closedPositions: ClosedPosition[];
  metrics: PortfolioMetrics;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UsePortfolioActionsReturn {
  viewAssetDetails: (asset: Asset) => void;
  exportPortfolio: () => Promise<void>;
  showTaxEvents: () => void;
}

// Market Hooks
export interface UseMarketReturn {
  marketData: Asset[];
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dataSource: string;
  realtimeEnabled: boolean;
  toggleRealtime: () => void;
  refreshData: () => Promise<void>;
}

// Trade Hooks
export interface UseTradeReturn {
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset) => void;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  setOrderType: (type: 'market' | 'limit' | 'stop' | 'stop_limit') => void;
  quantity: string;
  setQuantity: (quantity: string) => void;
  executeTrade: (direction: DirectionEnum) => Promise<void>;
  isExecuting: boolean;
  leverage: number;
  setLeverage: (leverage: number) => void;
  hasStopLoss: boolean;
  setHasStopLoss: (has: boolean) => void;
  stopLossRate: string;
  setStopLossRate: (rate: string) => void;
  hasTakeProfit: boolean;
  setHasTakeProfit: (has: boolean) => void;
  takeProfitRate: string;
  setTakeProfitRate: (rate: string) => void;
}

// Orders Hooks
export interface UseOrdersReturn {
  openPositions: Position[];
  pendingOrders: Order[];
  orderHistory: Order[];
  isLoading: boolean;
  error: Error | null;
  closePosition: (positionId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

// Wallet Hooks
export interface UseWalletReturn {
  balance: {
    total: number;
    available: number;
    locked: number;
  };
  currency: string;
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  deposit: (amount: number, method: string) => Promise<void>;
  withdraw: (amount: number, address: string) => Promise<void>;
}
