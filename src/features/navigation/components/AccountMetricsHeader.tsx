import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { AccountMetrics } from "@/types/account";
import {
  mockAccountMetrics,
  getDisplayedMetrics,
  getAllMetrics,
  calculateAvailableFunds,
} from "@/utils/metricUtils";
import MetricItem from "./MetricItem";
import MetricsDropdown from "./MetricsDropdown";

const AccountMetricsHeader = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AccountMetrics>({
    ...mockAccountMetrics,
    availableFunds: calculateAvailableFunds(
      mockAccountMetrics.balance,
      mockAccountMetrics.bonus
    ),
  });

  // This would be replaced with a real API call or websocket connection
  useEffect(() => {
    // Simulated real-time updates (just for demo)
    const interval = setInterval(() => {
      // Small random fluctuations to simulate real-time changes
      const randomChange = () => (Math.random() - 0.5) * 20;

      setMetrics((prev) => {
        const newUnrealizedPL =
          Math.round((prev.unrealizedPL + randomChange()) * 100) / 100;
        const newEquity =
          Math.round((prev.balance + newUnrealizedPL + randomChange()) * 100) /
          100;
        const newMarginLevel =
          Math.round(
            Math.max(0, prev.marginLevel + (Math.random() - 0.5) * 2) * 10
          ) / 10;

        return {
          ...prev,
          unrealizedPL: newUnrealizedPL,
          equity: newEquity,
          marginLevel: newMarginLevel,
          availableFunds: calculateAvailableFunds(prev.balance, prev.bonus),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Navigate to portfolio page when a metric is clicked
  const handleMetricClick = () => {
    navigate("/portfolio");
  };

  const displayedMetrics = getDisplayedMetrics(metrics);
  const allMetrics = getAllMetrics(metrics);

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center w-full gap-6">
        {displayedMetrics.map((item, index) => (
          <MetricItem key={index} item={item} onClick={handleMetricClick} />
        ))}

        <MetricsDropdown metrics={allMetrics} onClick={handleMetricClick} />
      </div>
    </TooltipProvider>
  );
};

export default AccountMetricsHeader;
