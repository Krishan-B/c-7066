
import { LEVERAGE_MAP } from "@/services/trades/leverageUtils";

/**
 * Risk levels for margin calls and liquidations
 */
export const RISK_LEVELS = {
  SAFE: 'safe',          // > 100% margin level
  WARNING: 'warning',    // 50-100% margin level
  DANGER: 'danger',      // 20-50% margin level
  CRITICAL: 'critical'   // < 20% margin level (imminent liquidation)
};

/**
 * Calculate liquidation price for a position based on margin level
 */
export function calculateLiquidationPrice(
  direction: 'buy' | 'sell',
  entryPrice: number,
  positionSize: number,
  marketType: string,
  marginLevel: number = 0.2 // Default 20% margin level for liquidation
): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  const marginUsed = (entryPrice * positionSize) / leverage;
  const liquidationThreshold = marginUsed * marginLevel;
  
  if (direction === 'buy') {
    // For long positions, price needs to go down to hit liquidation
    const priceDrop = liquidationThreshold / positionSize;
    return Math.max(0, entryPrice - priceDrop);
  } else {
    // For short positions, price needs to go up to hit liquidation
    const priceIncrease = liquidationThreshold / positionSize;
    return entryPrice + priceIncrease;
  }
}

/**
 * Get risk level based on margin level percentage
 */
export function getRiskLevel(marginLevel: number): string {
  if (marginLevel > 100) {
    return RISK_LEVELS.SAFE;
  } else if (marginLevel > 50) {
    return RISK_LEVELS.WARNING;
  } else if (marginLevel > 20) {
    return RISK_LEVELS.DANGER;
  } else {
    return RISK_LEVELS.CRITICAL;
  }
}

/**
 * Calculate free margin available
 */
export function calculateFreeMargin(equity: number, usedMargin: number): number {
  return Math.max(0, equity - usedMargin);
}

/**
 * Calculate margin call threshold (returns the price at which a margin call would be triggered)
 */
export function calculateMarginCallPrice(
  direction: 'buy' | 'sell',
  entryPrice: number,
  positionSize: number,
  marketType: string,
  marginCallLevel: number = 0.5 // Default 50% margin level for margin call
): number {
  return calculateLiquidationPrice(
    direction,
    entryPrice,
    positionSize,
    marketType,
    marginCallLevel
  );
}

/**
 * Determine if a position needs liquidation based on current price
 */
export function needsLiquidation(
  direction: 'buy' | 'sell',
  entryPrice: number,
  currentPrice: number,
  positionSize: number,
  marketType: string,
  marginLevel: number = 0.2
): boolean {
  const liquidationPrice = calculateLiquidationPrice(
    direction,
    entryPrice,
    positionSize,
    marketType,
    marginLevel
  );
  
  if (direction === 'buy') {
    return currentPrice <= liquidationPrice;
  } else {
    return currentPrice >= liquidationPrice;
  }
}

/**
 * Format risk level for display
 */
export function formatRiskLevel(level: string): { text: string; color: string } {
  switch (level) {
    case RISK_LEVELS.SAFE:
      return { text: 'Safe', color: 'text-green-500' };
    case RISK_LEVELS.WARNING:
      return { text: 'Margin Call Warning', color: 'text-amber-500' };
    case RISK_LEVELS.DANGER:
      return { text: 'Margin Call', color: 'text-red-500' };
    case RISK_LEVELS.CRITICAL:
      return { text: 'Liquidation Risk', color: 'text-red-700 font-bold' };
    default:
      return { text: 'Unknown', color: 'text-gray-500' };
  }
}
