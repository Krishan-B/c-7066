
/**
 * Calculate risk level based on margin level percentage
 * @param marginLevel The current margin level percentage
 * @returns Risk status: 'critical', 'danger', 'warning', or 'safe'
 */
export function getRiskLevel(marginLevel: number): string {
  if (marginLevel < 50) return 'critical';
  if (marginLevel < 80) return 'danger';
  if (marginLevel < 120) return 'warning';
  return 'safe';
}

/**
 * Calculate max drawdown percentage
 * @param highestEquity Highest equity reached
 * @param currentEquity Current equity value
 * @returns Drawdown percentage
 */
export function calculateDrawdown(highestEquity: number, currentEquity: number): number {
  if (highestEquity <= 0) return 0;
  return ((highestEquity - currentEquity) / highestEquity) * 100;
}

/**
 * Calculate risk-to-reward ratio for a trade
 * @param entryPrice Entry price
 * @param takeProfit Take profit level
 * @param stopLoss Stop loss level
 * @returns Risk-to-reward ratio (1:x format)
 */
export function calculateRiskRewardRatio(
  entryPrice: number,
  takeProfit: number | null | undefined,
  stopLoss: number | null | undefined
): string {
  if (!takeProfit || !stopLoss || entryPrice <= 0) return 'N/A';
  
  const potentialProfit = Math.abs(takeProfit - entryPrice);
  const potentialLoss = Math.abs(stopLoss - entryPrice);
  
  if (potentialLoss === 0) return 'N/A';
  
  const ratio = potentialProfit / potentialLoss;
  return `1:${ratio.toFixed(2)}`;
}

/**
 * Calculate value at risk (VaR) for a position
 * @param positionValue Total position value
 * @param volatility Asset volatility (decimal)
 * @param confidenceLevel Confidence level (default 0.95 for 95%)
 * @returns Value at risk
 */
export function calculateValueAtRisk(
  positionValue: number,
  volatility: number,
  confidenceLevel: number = 0.95
): number {
  // Using parametric VaR with normal distribution assumption
  // For 95% confidence, z-score is approximately 1.65
  const zScore = confidenceLevel === 0.95 ? 1.65 : 2.33; // 2.33 for 99%
  return positionValue * volatility * zScore;
}

/**
 * Calculate recommended position size based on risk percentage
 * @param accountBalance Total account balance
 * @param riskPercentage Risk percentage willing to take (1-100)
 * @param stopLossPercentage Stop loss percentage from entry
 * @returns Recommended position size
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercentage: number,
  stopLossPercentage: number
): number {
  if (stopLossPercentage <= 0) return 0;
  
  const riskAmount = accountBalance * (riskPercentage / 100);
  return riskAmount / (stopLossPercentage / 100);
}

/**
 * Calculate equity heat - percentage of account in use
 * @param usedMargin Total margin used
 * @param equity Total account equity
 * @returns Percentage of account in use
 */
export function calculateEquityHeat(usedMargin: number, equity: number): number {
  if (equity <= 0) return 0;
  return (usedMargin / equity) * 100;
}
