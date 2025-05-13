
/**
 * Get leverage for specified asset type
 */
export function getLeverageForAssetType(assetType: string): number {
  switch (assetType.toLowerCase()) {
    case 'crypto':
      return 5; // 5:1 leverage
    case 'forex':
      return 30; // 30:1 leverage
    case 'stocks':
      return 10; // 10:1 leverage
    case 'indices':
      return 20; // 20:1 leverage
    case 'commodities':
      return 10; // 10:1 leverage
    default:
      return 1; // No leverage
  }
}

/**
 * Calculate margin required for a trade
 */
export function calculateMarginRequired(
  price: number,
  units: number,
  assetType: string
): number {
  const leverage = getLeverageForAssetType(assetType);
  return (price * units) / leverage;
}
