
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

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  amount: number;
  entryPrice: number;
  value?: number;
  change?: number;
  pnl?: number;
  pnlPercentage?: number;
  change_percentage?: number;
  market_type?: string;
  volume?: string;
  market_cap?: string;
  last_updated?: string;
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
