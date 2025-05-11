
import { AccountMetrics, MetricItem } from "@/types/account";

// Mock data - This would normally come from an API
export const mockAccountMetrics: AccountMetrics = {
  balance: 10000,
  equity: 10250,
  unrealizedPL: 250,
  marginLevel: 85,
  usedMargin: 1200,
  realizedPL: 750,
  availableFunds: 8800,
  exposure: 12000,
  bonus: 500,
  buyingPower: 20000
};

// Format currency with $ and 2 decimal places
export const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

// Get displayed metrics for the header
export const getDisplayedMetrics = (metrics: AccountMetrics): MetricItem[] => {
  return [
    { 
      label: "Unrealized P&L", 
      value: formatCurrency(metrics.unrealizedPL),
      tooltip: "Total profit and loss from the open positions in the trading account"
    },
    { 
      label: "Margin Level", 
      value: `${metrics.marginLevel}%`,
      tooltip: "Indicates whether there are sufficient funds to keep the positions open"
    },
    { 
      label: "Account Equity", 
      value: formatCurrency(metrics.equity),
      tooltip: "The sum of the balance and unrealized P&L"
    },
    { 
      label: "Balance", 
      value: formatCurrency(metrics.balance),
      tooltip: "The deposit and the realized P&L in the trading account"
    },
    { 
      label: "Available", 
      value: formatCurrency(metrics.availableFunds),
      tooltip: "The amount of funds that can be used to open new trades"
    }
  ];
};

// Get all metrics for the dropdown
export const getAllMetrics = (metrics: AccountMetrics): MetricItem[] => {
  return [
    {
      label: "Buying Power",
      value: formatCurrency(metrics.buyingPower),
      tooltip: "Your available margin multiplied by the maximum leverage rate of your trading account"
    },
    { 
      label: "Unrealized P&L", 
      value: formatCurrency(metrics.unrealizedPL),
      tooltip: "Total profit and loss from the open positions in the trading account"
    },
    { 
      label: "Realized P&L", 
      value: formatCurrency(metrics.realizedPL),
      tooltip: "Total profit and loss from the closed positions in the trading account"
    },
    { 
      label: "Balance", 
      value: formatCurrency(metrics.balance),
      tooltip: "Your deposits and the realized P&L in your trading account"
    },
    { 
      label: "Available", 
      value: formatCurrency(metrics.availableFunds),
      tooltip: "The amount of funds in your trading account that you can use to open new or additional trades"
    },
    { 
      label: "Used", 
      value: formatCurrency(metrics.usedMargin),
      tooltip: "The amount of funds in your trading account that is held to keep your existing positions open"
    },
    { 
      label: "Exposure", 
      value: formatCurrency(metrics.exposure),
      tooltip: "The current market value of your open position multiplied by the position size converted to your trading account currency"
    },
    { 
      label: "Margin Level", 
      value: `${metrics.marginLevel}%`,
      tooltip: "Indicates whether there are sufficient funds to keep your positions open in your trading account. When your margin level drops below 1%, you will be notified"
    },
    { 
      label: "Account Equity", 
      value: formatCurrency(metrics.equity),
      tooltip: "The sum of your balance and unrealized P&L"
    }
  ];
};
