
import React, { useState } from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";

const Markets = () => {
  // Maintain active tab state at the page level
  const [activeTab, setActiveTab] = useState("Crypto");
  
  // Use the combined market data hook with chosen category and 1-minute refetch interval
  const { marketData, isLoading, error } = useCombinedMarketData(
    [activeTab], // Use the active tab as the market type
    { refetchInterval: 1000 * 60 } // Refresh every minute
  );
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <MarketContainer 
      marketData={marketData}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default Markets;
