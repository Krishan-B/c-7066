import React from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";
import { withErrorBoundary } from "@/components/hoc/withErrorBoundary";

const MarketsPage: React.FC = () => {
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

const MarketsPageWrapped = withErrorBoundary(MarketsPage, "markets_page");
export { MarketsPageWrapped as Markets };
export default MarketsPageWrapped;
