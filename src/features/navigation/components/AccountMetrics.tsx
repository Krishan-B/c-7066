import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Shield,
  BarChart2,
  Activity,
  PieChart,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Types for account metrics
interface AccountMetrics {
  balance: number;
  equity: number;
  unrealizedPL: number;
  marginLevel: number;
  usedMargin: number;
  realizedPL: number;
  availableFunds: number;
  exposure: number;
  bonus: number;
}

// Mock data - This would normally come from an API
const mockAccountMetrics: AccountMetrics = {
  balance: 10000,
  equity: 10250,
  unrealizedPL: 250,
  marginLevel: 85,
  usedMargin: 1200,
  realizedPL: 750,
  availableFunds: 8800,
  exposure: 12000,
  bonus: 500,
};

const AccountMetrics = () => {
  const [metrics, setMetrics] = useState<AccountMetrics>(mockAccountMetrics);
  const { user } = useAuth();

  // This would be replaced with a real API call or websocket connection
  useEffect(() => {
    // Simulated real-time updates (just for demo)
    const interval = setInterval(() => {
      // Small random fluctuations to simulate real-time changes
      const randomChange = () => (Math.random() - 0.5) * 20;

      setMetrics((prev) => ({
        ...prev,
        unrealizedPL:
          Math.round((prev.unrealizedPL + randomChange()) * 100) / 100,
        equity:
          Math.round(
            (prev.balance + prev.unrealizedPL + randomChange()) * 100
          ) / 100,
        marginLevel:
          Math.round(
            Math.max(0, prev.marginLevel + (Math.random() - 0.5) * 2) * 10
          ) / 10,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Format currency with $ and 2 decimal places
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Don't display metrics if user is not logged in
  if (!user) {
    return null;
  }

  // Metric items to display
  const metricItems = [
    {
      label: "Balance",
      value: formatCurrency(metrics.balance),
      icon: <DollarSign className="h-3 w-3" />,
      tooltip: "The deposit and the realized P&L in the trading account",
    },
    {
      label: "Equity",
      value: formatCurrency(metrics.equity),
      icon: <BarChart2 className="h-3 w-3" />,
      tooltip: "The sum of the balance and unrealized P&L",
    },
    {
      label: "Unrealized P&L",
      value: formatCurrency(metrics.unrealizedPL),
      icon: <TrendingUp className="h-3 w-3" />,
      tooltip:
        "Total profit and loss from the open positions in the trading account",
    },
    {
      label: "Margin Level",
      value: `${metrics.marginLevel}%`,
      icon: <Percent className="h-3 w-3" />,
      tooltip:
        "Indicates whether there are sufficient funds to keep the positions open",
    },
    {
      label: "Used Margin",
      value: formatCurrency(metrics.usedMargin),
      icon: <Activity className="h-3 w-3" />,
      tooltip:
        "The amount of funds that is held to keep the existing positions open",
    },
    {
      label: "Realized P&L",
      value: formatCurrency(metrics.realizedPL),
      icon: <PieChart className="h-3 w-3" />,
      tooltip:
        "Total profit and loss from the closed positions in the trading account",
    },
    {
      label: "Available",
      value: formatCurrency(metrics.availableFunds),
      icon: <DollarSign className="h-3 w-3" />,
      tooltip: "The amount of funds that can be used to open new trades",
    },
    {
      label: "Exposure",
      value: formatCurrency(metrics.exposure),
      icon: <Activity className="h-3 w-3" />,
      tooltip:
        "The current market value of the open position multiplied by the position size",
    },
    {
      label: "Bonus",
      value: formatCurrency(metrics.bonus),
      icon: <Shield className="h-3 w-3" />,
      tooltip:
        "Funds introduced by the broker that can be used to trade but are non-withdrawable",
    },
  ];

  return (
    <div className="hidden lg:flex items-center gap-4 overflow-x-auto scrollbar-hide px-2">
      <TooltipProvider>
        {metricItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs">
                {item.icon}
                <span className="font-medium">{item.label}:</span>
                <span
                  className={`
                  ${item.label.includes("P&L") && parseFloat(item.value.replace("$", "")) > 0 ? "text-success" : ""}
                  ${item.label.includes("P&L") && parseFloat(item.value.replace("$", "")) < 0 ? "text-warning" : ""}
                  ${item.label === "Margin Level" && parseFloat(item.value.replace("%", "")) < 20 ? "text-warning" : ""}
                  ${item.label === "Margin Level" && parseFloat(item.value.replace("%", "")) < 5 ? "text-destructive" : ""}
                `}
                >
                  {item.value}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default AccountMetrics;
