import { type Asset } from '@/hooks/market/types';

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

// Export the Asset type so components can import it
export { type Asset };

export type AccountType = 'DEMO' | 'LIVE' | 'CONTEST';

export interface TradingAccount {
  id: string;
  user_id: string;
  account_type: AccountType;
  account_number: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number;
  currency: string;
  created_at: string;
  updated_at: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  // Add other relevant fields
}

export interface Transaction {
  id: string;
  account_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE' | 'FEE' | 'INTEREST';
  amount: number;
  currency: string;
  timestamp: string;
  description?: string;
  // Add other relevant fields
}

export interface AccountReset {
  account_id: string;
  reset_date: string;
  previous_balance: number;
  new_balance: number;
  reason?: string;
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
  closedPositions?: ClosedPosition[];
  allocationData?: AllocationData[];
  performanceData?: PerformanceData[];
  performance?: {
    allTimeReturn: number;
    monthlyReturn: number;
    weeklyReturn: number;
    dailyReturn: number;
  };
  monthlyReturns?: unknown[];
}
