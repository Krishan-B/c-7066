
import { TradeRequest } from './types.ts';

// Define leverage map
export const LEVERAGE_MAP: Record<string, number> = {
  'Stocks': 20,
  'Indices': 50,
  'Commodities': 50,
  'Forex': 100,
  'Crypto': 50
};

/**
 * Calculate margin required for a position
 */
export function calculateMarginRequired(marketType: string, totalAmount: number): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  return totalAmount / leverage;
}

/**
 * Validate the trade request parameters
 */
export function validateTradeRequest(request: TradeRequest): boolean {
  return !!(
    request.assetSymbol &&
    request.assetName &&
    request.marketType &&
    request.units > 0 &&
    request.pricePerUnit > 0 &&
    ['buy', 'sell'].includes(request.tradeType) &&
    ['market', 'entry'].includes(request.orderType)
  );
}
