
// Leverage ratios for different market types
export const LEVERAGE_MAP: Record<string, number> = {
  'Stocks': 20,
  'Indices': 50,
  'Commodities': 50,
  'Forex': 100,
  'Crypto': 50
};

/**
 * Calculates margin required for a position based on market type and leverage
 */
export function calculateMarginRequired(marketType: string, totalAmount: number): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  return totalAmount / leverage;
}

/**
 * Calculates maximum position size based on available funds and leverage
 */
export function calculateMaxPosition(marketType: string, availableFunds: number, currentPrice: number): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  const maxAmount = availableFunds * leverage;
  return maxAmount / currentPrice;
}

/**
 * Gets leverage value for a specific market type
 */
export function getLeverageForMarketType(marketType: string): number {
  return LEVERAGE_MAP[marketType] || 1;
}

/**
 * Calculates liquidation price for a position
 */
export function calculateLiquidationPrice(
  direction: 'buy' | 'sell',
  entryPrice: number,
  marketType: string,
  stopOutLevel: number = 0.5 // Default 50% margin level for liquidation
): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  const marginPercentage = 1 / leverage;
  const liquidationThreshold = marginPercentage * stopOutLevel;
  
  if (direction === 'buy') {
    // For long positions, price needs to go down to hit liquidation
    return entryPrice * (1 - liquidationThreshold);
  } else {
    // For short positions, price needs to go up to hit liquidation
    return entryPrice * (1 + liquidationThreshold);
  }
}
