
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountMetrics } from "@/types/account";
import { mockAccountMetrics, getDisplayedMetrics, getAllMetrics } from "@/utils/metricUtils";
import MetricItem from "./MetricItem";
import MetricsDropdown from "./MetricsDropdown";

const AccountMetricsHeader = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AccountMetrics>(mockAccountMetrics);

  // This would be replaced with a real API call or websocket connection
  useEffect(() => {
    // Simulated real-time updates (just for demo)
    const interval = setInterval(() => {
      // Small random fluctuations to simulate real-time changes
      const randomChange = () => (Math.random() - 0.5) * 20;
      
      setMetrics(prev => ({
        ...prev,
        unrealizedPL: Math.round((prev.unrealizedPL + randomChange()) * 100) / 100,
        equity: Math.round((prev.balance + prev.unrealizedPL + randomChange()) * 100) / 100,
        marginLevel: Math.round(Math.max(0, (prev.marginLevel + (Math.random() - 0.5) * 2)) * 10) / 10,
      }));
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
      <div className="flex items-center gap-6">
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
