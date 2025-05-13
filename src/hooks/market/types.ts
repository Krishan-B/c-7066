
export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change_percentage: number;
  market_type: string;
  volume: string;
  market_cap?: string;
  id?: string;
  last_updated?: string;
  // Add the properties needed by PositionsTable
  amount?: number;
  entryPrice?: number;
  value?: number;
  change?: number;
  pnl?: number;
  pnlPercentage?: number;
}

export interface AssetDetails extends Asset {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  description?: string;
  currency?: string;
  exchange?: string;
  marketCap?: string;
  sector?: string;
}
