import type { Order, Position } from "../../shared/types";

export interface Account {
  user_id: string;
  balance: number;
  bonus: number;
  realizedPnl: number;
  equity: number;
  usedMargin: number;
  availableFunds: number;
  marginLevel: number;
  exposure: number; // Added exposure property
}

export const orders: Order[] = [];
export const positions: Position[] = [];
export const account: Account = {
  user_id: "test-user",
  balance: 10000,
  bonus: 0,
  realizedPnl: 0,
  equity: 10000,
  usedMargin: 0,
  availableFunds: 10000,
  marginLevel: 0,
  exposure: 0, // Added exposure property
};

export function getLeverageForAssetClass(assetClass: string): number {
  switch (assetClass.toUpperCase()) {
    case "STOCKS":
      return 20;
    case "INDICES":
      return 50;
    case "COMMODITIES":
      return 50;
    case "FOREX":
      return 100;
    case "CRYPTO":
      return 50;
    default:
      return 1;
  }
}

export function getMarketPrice(symbol: string): number {
  return Math.round((Math.random() * 900 + 100) * 100) / 100;
}
