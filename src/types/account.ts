
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
