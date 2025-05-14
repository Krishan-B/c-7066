
/**
 * Types for market data service
 */

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change_percentage: number;
  volume: string | number;
  market_cap?: string | number;
  market_type: string;
  high_price?: number;
  low_price?: number;
  open_price?: number;
  previous_close?: number;
  last_updated?: string;
}
