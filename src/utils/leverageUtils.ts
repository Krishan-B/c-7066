
/**
 * Returns the leverage for a specific asset type
 */
export function getLeverageForAssetType(assetType: string): number {
  switch (assetType.toLowerCase()) {
    case 'crypto':
    case 'cryptocurrency':
      return 50; // 50:1 leverage for crypto
    case 'forex':
      return 100; // 100:1 leverage for forex
    case 'stock':
    case 'stocks':
      return 20; // 20:1 leverage for stocks
    case 'index':
    case 'indices':
      return 50; // 50:1 for indices
    case 'commodity':
    case 'commodities':
      return 50; // 50:1 for commodities
    default:
      return 10; // Default leverage
  }
}

/**
 * Calculate margin required based on position value and asset type
 */
export function calculateMarginRequired(assetType: string, positionValue: number): number {
  const leverage = getLeverageForAssetType(assetType);
  return positionValue / leverage;
}

/**
 * Calculate the maximum position size based on available funds and asset type
 */
export function calculateMaxPositionSize(assetType: string, availableFunds: number, currentPrice: number): number {
  const leverage = getLeverageForAssetType(assetType);
  const maxPositionValue = availableFunds * leverage;
  return maxPositionValue / currentPrice;
}

/**
 * Calculate the margin level percentage
 */
export function calculateMarginLevel(equity: number, usedMargin: number): number {
  if (usedMargin <= 0) return 100; // If no margin is used, margin level is 100%
  return (equity / usedMargin) * 100;
}

/**
 * Determine if a position is at risk of margin call
 * @returns true if margin level is below warning threshold
 */
export function isMarginCallRisk(equity: number, usedMargin: number): boolean {
  const marginLevel = calculateMarginLevel(equity, usedMargin);
  return marginLevel < 80; // Warning at 80% margin level
}

/**
 * Determine if a position is at immediate risk of liquidation
 * @returns true if margin level is below critical threshold
 */
export function isLiquidationRisk(equity: number, usedMargin: number): boolean {
  const marginLevel = calculateMarginLevel(equity, usedMargin);
  return marginLevel < 50; // Critical at 50% margin level
}

/**
 * Calculate unrealized profit/loss for a position
 */
export function calculateUnrealizedPnL(
  direction: 'buy' | 'sell',
  entryPrice: number,
  currentPrice: number,
  units: number,
  leverage: number = 1
): number {
  const priceDifference = direction === 'buy'
    ? currentPrice - entryPrice
    : entryPrice - currentPrice;
  
  return priceDifference * units * leverage;
}
