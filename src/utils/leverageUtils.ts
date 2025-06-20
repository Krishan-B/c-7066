
/**
 * Fixed leverage ratios for different asset types
 */
export const FIXED_LEVERAGE = {
  Stocks: 20, // 20:1 (5% margin)
  Indices: 50, // 50:1 (2% margin)
  Commodities: 50, // 50:1 (2% margin)
  Forex: 100, // 100:1 (1% margin)
  Crypto: 50 // 50:1 (2% margin)
};

/**
 * Get the fixed leverage ratio for a specific asset type
 * @param marketType The type of market (Stocks, Indices, Commodities, Forex, Crypto)
 * @returns The fixed leverage ratio for the asset type
 */
export const getLeverageForAssetType = (marketType: string): number => {
  // Normalize the market type to match our keys
  const normalizedType = marketType === 'Cryptocurrency' ? 'Crypto' : marketType;
  
  return FIXED_LEVERAGE[normalizedType as keyof typeof FIXED_LEVERAGE] || 10; // Default to 10:1 if not found
};

/**
 * Calculate required margin based on position size and asset type
 * @param positionValue The total value of the position
 * @param marketType The type of market (Stocks, Indices, etc.)
 * @returns The required margin
 */
export const calculateRequiredMargin = (positionValue: number, marketType: string): number => {
  const leverage = getLeverageForAssetType(marketType);
  return positionValue / leverage;
};

/**
 * Calculate maximum position size based on available margin and asset type
 * @param availableMargin The margin available to the user
 * @param marketType The type of market (Stocks, Indices, etc.)
 * @returns The maximum position size possible
 */
export const calculateMaxPositionSize = (availableMargin: number, marketType: string): number => {
  const leverage = getLeverageForAssetType(marketType);
  return availableMargin * leverage;
};

/**
 * Format the leverage ratio as a string (e.g., "20:1")
 * @param leverage The leverage value
 * @returns Formatted leverage string
 */
export const formatLeverageRatio = (leverage: number): string => {
  return `${leverage}:1`;
};
