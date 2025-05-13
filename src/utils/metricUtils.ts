
import { AccountMetrics } from "@/types/account";

/**
 * Mock account metrics for development purposes
 */
export const mockAccountMetrics: AccountMetrics = {
  balance: 10000,
  equity: 10500,
  margin: 2500,
  availableFunds: 8000,
  marginLevel: 420, // percentage
  openPositions: 5,
  profitLoss: 500
};

/**
 * Format large numbers with suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}
