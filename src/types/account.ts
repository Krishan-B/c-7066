
import { Asset as MarketAsset } from '@/hooks/market/types';

export interface AccountMetrics {
  balance: number;
  equity: number;
  unrealizedPL: number;
  marginLevel: number;
  usedMargin: number;
  realizedPL: number;
  availableFunds: number;
  exposure: number;
  bonus: number;
  buyingPower: number;
  margin?: number;
  openPositions?: number;
  profitLoss?: number;
}

export interface MetricItem {
  label: string;
  value: string;
  tooltip: string;
}

// Extend the MarketAsset with account-specific properties
export interface Asset extends MarketAsset {
  amount: number;
  entryPrice: number;
  value: number;
  change: number;
  pnl: number;
  pnlPercentage: number;
}

export interface ClosedPosition {
  id: string;
  symbol: string;
  name: string;
  openDate: string;
  closeDate: string;
  entryPrice: number;
  exitPrice: number;
  amount: number;
  pnl: number;
  pnlPercentage: number;
}

export interface AllocationData {
  name: string;
  value: number;
  color: string;
}

export interface PerformanceData {
  date: string;
  value: number;
}

export interface PortfolioData {
  totalValue: number;
  cashBalance: number;
  lockedFunds: number;
  totalPnL?: number;
  totalPnLPercentage?: number;
  dayChange?: number;
  dayChangePercentage?: number;
  assets: Asset[];
  closedPositions?: any[];
  allocationData?: AllocationData[];
  performanceData?: PerformanceData[];
  performance?: {
    allTimeReturn: number;
    monthlyReturn: number;
    weeklyReturn: number;
    dailyReturn: number;
  };
  monthlyReturns?: any[];
}
