
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
 * Calculate liquidation price for a position
 */
export function calculateLiquidationPrice(
  tradeType: 'buy' | 'sell',
  entryPrice: number,
  units: number,
  marketType: string,
  marginLevel: number = 0.2 // Default 20% margin level for liquidation
): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  const marginUsed = (entryPrice * units) / leverage;
  const liquidationThreshold = marginUsed * marginLevel;
  
  if (tradeType === 'buy') {
    // For long positions, price needs to go down to hit liquidation
    const priceDrop = liquidationThreshold / units;
    return Math.max(0, entryPrice - priceDrop);
  } else {
    // For short positions, price needs to go up to hit liquidation
    const priceIncrease = liquidationThreshold / units;
    return entryPrice + priceIncrease;
  }
}

/**
 * Calculate margin level percentage
 */
export function calculateMarginLevel(equity: number, usedMargin: number): number {
  if (usedMargin <= 0) return 100;
  return (equity / usedMargin) * 100;
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
