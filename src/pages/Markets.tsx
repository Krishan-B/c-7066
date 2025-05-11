
import React from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";

const Markets = () => {
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const { marketData, isLoading, error } = useCombinedMarketData(
    ["Crypto"], // Default to Crypto tab
    { refetchInterval: 1000 * 60 } // Refresh every minute
  );
  
  return (
    <MarketContainer 
      marketData={marketData}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default Markets;
