
import { AccountMetrics, MetricItem } from "@/types/account";

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
  profitLoss: 500,
  unrealizedPL: 500,
  realizedPL: 0,
  usedMargin: 2500,
  exposure: 0,
  bonus: 0,
  buyingPower: 160000
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

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Calculate available funds based on balance and bonus
 */
export function calculateAvailableFunds(balance: number, bonus: number): number {
  return balance + bonus;
}

/**
 * Get metrics to display in the header
 */
export function getDisplayedMetrics(metrics: AccountMetrics): MetricItem[] {
  return [
    {
      label: "Balance",
      value: formatCurrency(metrics.balance),
      tooltip: "Your cash balance"
    },
    {
      label: "P&L Today",
      value: formatCurrency(metrics.unrealizedPL),
      tooltip: "Unrealized profit/loss for today's positions"
    },
    {
      label: "Margin Level",
      value: `${metrics.marginLevel.toFixed(1)}%`,
      tooltip: "Current margin level (equity / used margin)"
    }
  ];
}

/**
 * Get all metrics for dropdown
 */
export function getAllMetrics(metrics: AccountMetrics): MetricItem[] {
  return [
    {
      label: "Balance",
      value: formatCurrency(metrics.balance),
      tooltip: "Your cash balance"
    },
    {
      label: "Equity",
      value: formatCurrency(metrics.equity),
      tooltip: "Balance + unrealized P&L"
    },
    {
      label: "Used Margin",
      value: formatCurrency(metrics.usedMargin),
      tooltip: "Margin used by your open positions"
    },
    {
      label: "Available Funds",
      value: formatCurrency(metrics.availableFunds),
      tooltip: "Funds available for new positions"
    },
    {
      label: "Margin Level",
      value: `${metrics.marginLevel.toFixed(1)}%`,
      tooltip: "Equity / used margin ratio"
    },
    {
      label: "Unrealized P&L",
      value: formatCurrency(metrics.unrealizedPL),
      tooltip: "Profit/loss of open positions"
    },
    {
      label: "Realized P&L",
      value: formatCurrency(metrics.realizedPL),
      tooltip: "Profit/loss from closed positions"
    },
    {
      label: "Buying Power",
      value: formatCurrency(metrics.buyingPower),
      tooltip: "Maximum amount available for trading with leverage"
    }
  ];
}
