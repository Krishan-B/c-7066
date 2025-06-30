import React, { useState, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Asset } from "@/hooks/useMarketData";
import { isMarketOpen } from "@/utils/marketHours";
import MarketHeader from "@/components/markets/MarketHeader";
import MarketSearch from "@/components/markets/MarketSearch";
import MarketTabs from "@/components/markets/MarketTabs";
import MarketChartSection from "@/components/markets/MarketChartSection";
import MarketOrderForm from "@/components/markets/MarketOrderForm";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import { withErrorBoundary } from "@/components/hoc/withErrorBoundary";

interface MarketContainerProps {
  marketData: Asset[];
  isLoading: boolean;
  error: Error | null;
}

const MarketContainerComponent: React.FC<MarketContainerProps> = ({
  marketData,
  isLoading,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Crypto");
  const [selectedAsset, setSelectedAsset] = useState<Asset>({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67432.21,
    change_percentage: 2.4,
    market_type: "Crypto",
    volume: "14.2B",
  });

  const chartSectionRef = useRef<HTMLDivElement>(null);

  // Check if the selected market is open
  const marketIsOpen = selectedAsset
    ? isMarketOpen(selectedAsset.market_type)
    : false;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Market header section */}
        <MarketHeader
          selectedAsset={selectedAsset}
          marketIsOpen={marketIsOpen}
        />

        {/* Market search and table section */}
        <div className="mb-8">
          <MarketSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="mt-4">
            <MarketTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              marketData={marketData}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              onSelectAsset={setSelectedAsset}
              containerRef={chartSectionRef}
            />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Chart and details section */}
        <MarketChartSection
          chartSectionRef={chartSectionRef}
          selectedAsset={selectedAsset}
          marketIsOpen={marketIsOpen}
        />

        {/* Advanced Order Form Card for trading */}
        <MarketOrderForm selectedAsset={selectedAsset} />

        {/* News section */}
        <div className="mt-6">
          <EnhancedNewsWidget marketType={selectedAsset.market_type} />
        </div>
      </div>
    </div>
  );
};

const MarketContainerWrapped = withErrorBoundary(
  MarketContainerComponent,
  "market_container"
);
export { MarketContainerWrapped as MarketContainer };
export default MarketContainerWrapped;
