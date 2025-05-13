
/**
 * Leverage mapping by asset class
 * - Stocks: 20:1 (5% margin)
 * - Indices: 50:1 (2% margin)
 * - Commodities: 50:1 (2% margin)
 * - Forex: 100:1 (1% margin)
 * - Crypto: 50:1 (2% margin)
 */
export const LEVERAGE_MAP: Record<string, number> = {
  'Stocks': 20,    // 5% margin
  'Indices': 50,   // 2% margin
  'Commodities': 50, // 2% margin
  'Forex': 100,    // 1% margin
  'Crypto': 50     // 2% margin
};

/**
 * Calculate margin required for a position based on asset class
 */
export const calculateMarginRequired = (
  assetClass: string,
  positionValue: number
): number => {
  const leverage = LEVERAGE_MAP[assetClass] || 1;
  return positionValue / leverage;
};

/**
 * Get leverage value for a specific asset type
 */
export const getLeverageForAssetType = (assetType: string): number => {
  return LEVERAGE_MAP[assetType] || 1;
};

/**
 * Calculate required margin for a position (alias for calculateMarginRequired)
 */
export const calculateRequiredMargin = calculateMarginRequired;

/**
 * Calculate default take profit level based on asset class (for buy positions)
 */
export const calculateDefaultTakeProfit = (
  currentPrice: number,
  assetClass: string,
  direction: 'buy' | 'sell'
): number => {
  const tpFactors: Record<string, number> = {
    'Stocks': 0.05,      // 5% default TP
    'Indices': 0.03,     // 3% default TP
    'Commodities': 0.04, // 4% default TP
    'Forex': 0.02,       // 2% default TP
    'Crypto': 0.08       // 8% default TP
  };
  
  const factor = tpFactors[assetClass] || 0.03;
  
  // For buy positions, TP is above entry price
  // For sell positions, TP is below entry price
  return direction === 'buy' 
    ? currentPrice * (1 + factor) 
    : currentPrice * (1 - factor);
};

/**
 * Calculate default stop loss level based on asset class
 */
export const calculateDefaultStopLoss = (
  currentPrice: number,
  assetClass: string,
  direction: 'buy' | 'sell'
): number => {
  const slFactors: Record<string, number> = {
    'Stocks': 0.03,      // 3% default SL
    'Indices': 0.02,     // 2% default SL
    'Commodities': 0.03, // 3% default SL
    'Forex': 0.01,       // 1% default SL
    'Crypto': 0.05       // 5% default SL
  };
  
  const factor = slFactors[assetClass] || 0.02;
  
  // For buy positions, SL is below entry price
  // For sell positions, SL is above entry price
  return direction === 'buy' 
    ? currentPrice * (1 - factor) 
    : currentPrice * (1 + factor);
};
