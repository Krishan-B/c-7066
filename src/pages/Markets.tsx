
import React, { useState } from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";

const Markets = () => {
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const [activeTab, setActiveTab] = useState("Crypto");
  const { marketData, isLoading, error, updateMarketTypes } = useCombinedMarketData(
    [activeTab], // Start with active tab data
    { refetchInterval: 1000 * 60 } // Refresh every minute
  );
  
  // Update market types when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    updateMarketTypes([tab]);
  };
  
  return (
    <MarketContainer 
      marketData={marketData}
      isLoading={isLoading}
      error={error}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
};

export default Markets;
