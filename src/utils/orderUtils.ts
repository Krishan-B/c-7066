
/**
 * Calculate buy and sell prices with spread
 */
export function calculateSpread(price: number): { bid: number; ask: number } {
  const spreadPercentage = 0.002; // 0.2% spread, adjust as needed
  const halfSpread = price * (spreadPercentage / 2);
  
  return {
    bid: price - halfSpread, // Sell price
    ask: price + halfSpread // Buy price
  };
}

/**
 * Calculate profit/loss percentage
 */
export function calculatePnlPercentage(
  openPrice: number,
  currentPrice: number,
  direction: 'buy' | 'sell'
): number {
  if (direction === 'buy') {
    return ((currentPrice - openPrice) / openPrice) * 100;
  } else {
    return ((openPrice - currentPrice) / openPrice) * 100;
  }
}
