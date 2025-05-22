
// Update types file to include all necessary market types

export type MarketType = 'Crypto' | 'Forex' | 'Stocks' | 'Index' | 'Indices' | 'Commodities';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  market_type: MarketType;
  volume: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  supply?: number;
}

export interface MarketData {
  assets: Asset[];
  lastUpdated: string;
}
