
export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change_percentage: number;
  market_type: string;
  volume: string;
  last_updated?: string;
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
