export type MarketType = typeof import('../../../shared/schema').assetClassEnum._type;

// Legacy type kept for backward compatibility
export type LegacyMarketType =
  | 'crypto'
  | 'stock'
  | 'forex'
  | 'index'
  | 'commodity'
  | 'etf'
  | 'bond'
  | 'futures'
  | 'option';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_percentage: number;
  market_type: MarketType;
  volume: string | number;
  market_cap?: string | number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  previous_close?: number;
  exchange?: string;
  currency?: string;
  last_updated?: string;

  // Portfolio specific fields
  amount?: number;
  entryPrice?: number;
  value?: number;
  change?: number;
  pnl?: number;
  pnlPercentage?: number;

  // Additional market data
  pe_ratio?: number;
  dividend_yield?: number;
  beta?: number;
  trading_hours?: string;
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
