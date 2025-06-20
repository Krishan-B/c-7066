
// Types for account metrics
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
}

export interface MetricItem {
  label: string;
  value: string;
  tooltip: string;
}

// Portfolio types
export interface Asset {
  name: string;
  symbol: string;
  amount: number;
  price: number;
  entryPrice: number;
  value: number;
  change: number;
  pnl: number;
  pnlPercentage: number;
}

export interface ClosedPosition {
  id: string;
  name: string;
  symbol: string;
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
