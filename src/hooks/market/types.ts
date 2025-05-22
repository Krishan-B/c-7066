
// Update types file to include all necessary market types

export type MarketType = 'Crypto' | 'Forex' | 'Stocks' | 'Indices' | 'Commodities';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change_percentage: number; // Make sure this is required, not optional
  market_type: MarketType;
  volume: number | string;
  marketCap?: number | string;
  high24h?: number;
  low24h?: number;
  supply?: number;
}

export interface MarketData {
  assets: Asset[];
  lastUpdated: string;
}
