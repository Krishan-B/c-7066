
/**
 * Leverage ratios for different market types
 */
export const LEVERAGE_MAP: Record<string, number> = {
  'Stocks': 20,
  'Indices': 50,
  'Commodities': 50,
  'Forex': 100,
  'Crypto': 50
};

/**
 * Gets leverage value for a specific asset type
 * @param assetType The market/asset type
 * @returns The leverage multiplier for the asset type
 */
export function getLeverageForAssetType(assetType: string): number {
  // Normalize asset type to match the keys in the leverage map
  const normalizedType = assetType.charAt(0).toUpperCase() + assetType.slice(1).toLowerCase();
  
  // Check if we have an exact match
  if (normalizedType in LEVERAGE_MAP) {
    return LEVERAGE_MAP[normalizedType];
  }
  
  // Handle variations of asset types
  if (normalizedType === 'Stock') return LEVERAGE_MAP['Stocks'];
  if (normalizedType === 'Cryptocurrency') return LEVERAGE_MAP['Crypto'];
  if (normalizedType === 'Index') return LEVERAGE_MAP['Indices'];
  if (normalizedType === 'Commodity') return LEVERAGE_MAP['Commodities'];
  
  // Default to 1:1 leverage if unknown type
  return 1;
}

/**
 * Calculates margin required for a position based on market type and leverage
 * @param marketType The type of market (Stocks, Crypto, etc.)
 * @param totalAmount The total position value
 * @returns The margin required in account currency
 */
export function calculateMarginRequired(marketType: string, totalAmount: number): number {
  const leverage = getLeverageForAssetType(marketType);
  return totalAmount / leverage;
}

/**
 * Calculates maximum position size based on available funds and leverage
 * @param marketType The type of market
 * @param availableFunds Available account funds
 * @param currentPrice Current price of the asset
 * @returns Maximum position size in units
 */
export function calculateMaxPosition(marketType: string, availableFunds: number, currentPrice: number): number {
  const leverage = getLeverageForAssetType(marketType);
  const maxAmount = availableFunds * leverage;
  return maxAmount / currentPrice;
}

/**
 * Calculates liquidation price for a position
 * @param direction Trade direction ('buy' or 'sell')
 * @param entryPrice Entry price of the position
 * @param marketType Type of market
 * @param stopOutLevel Stop out level percentage (default 0.5 or 50%)
 * @returns The liquidation price
 */
export function calculateLiquidationPrice(
  direction: 'buy' | 'sell',
  entryPrice: number,
  marketType: string,
  stopOutLevel: number = 0.5 // Default 50% margin level for liquidation
): number {
  const leverage = getLeverageForAssetType(marketType);
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

/**
 * Calculates risk level based on margin level percentage
 * @param marginLevel Current margin level percentage
 * @returns Risk level as string: 'critical', 'danger', 'warning', or 'safe'
 */
export function getRiskLevel(marginLevel: number): string {
  if (marginLevel < 50) return 'critical';
  if (marginLevel < 80) return 'danger';
  if (marginLevel < 120) return 'warning';
  return 'safe';
}
