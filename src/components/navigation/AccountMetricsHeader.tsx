
import React from "react";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTradingEngine } from "@/hooks/useTradingEngine";
import MetricItem from "./MetricItem";
import MetricsDropdown from "./MetricsDropdown";

const AccountMetricsHeader = () => {
  const navigate = useNavigate();
  const { accountMetrics } = useTradingEngine();

  // Navigate to portfolio page when a metric is clicked
  const handleMetricClick = () => {
    navigate("/portfolio");
  };

  if (!accountMetrics) {
    return null;
  }

  // Format currency with $ and 2 decimal places
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const displayedMetrics = [
    { 
      label: "Balance", 
      value: formatCurrency(accountMetrics.balance),
      icon: "DollarSign",
      tooltip: "The deposit and the realized P&L in the trading account"
    },
    { 
      label: "Equity", 
      value: formatCurrency(accountMetrics.equity),
      icon: "BarChart2",
      tooltip: "The sum of the balance and unrealized P&L"
    },
    { 
      label: "Unrealized P&L", 
      value: formatCurrency(accountMetrics.unrealized_pnl),
      icon: "TrendingUp",
      tooltip: "Total profit and loss from the open positions in the trading account"
    },
    { 
      label: "Margin Level", 
      value: `${accountMetrics.margin_level.toFixed(1)}%`,
      icon: "Percent",
      tooltip: "Indicates whether there are sufficient funds to keep the positions open"
    }
  ];

  const allMetrics = [
    ...displayedMetrics,
    { 
      label: "Used Margin", 
      value: formatCurrency(accountMetrics.used_margin),
      icon: "Activity",
      tooltip: "The amount of funds that is held to keep the existing positions open"
    },
    { 
      label: "Available", 
      value: formatCurrency(accountMetrics.available_funds),
      icon: "DollarSign",
      tooltip: "The amount of funds that can be used to open new trades"
    },
    { 
      label: "Exposure", 
      value: formatCurrency(accountMetrics.total_exposure),
      icon: "Activity",
      tooltip: "The current market value of the open position multiplied by the position size"
    },
    { 
      label: "Bonus", 
      value: formatCurrency(accountMetrics.bonus),
      icon: "Shield",
      tooltip: "Funds introduced by the broker that can be used to trade but are non-withdrawable"
    }
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center w-full gap-6">
        {displayedMetrics.map((item, index) => (
          <MetricItem 
            key={index} 
            item={item} 
            onClick={handleMetricClick}
          />
        ))}
        
        <MetricsDropdown 
          metrics={allMetrics}
          onClick={handleMetricClick}
        />
      </div>
    </TooltipProvider>
  );
};

export default AccountMetricsHeader;
