
import { useState, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { isMarketOpen } from "@/utils/marketHours";
import MarketHeader from "@/components/markets/MarketHeader";
import MarketSearch from "@/components/markets/MarketSearch";
import MarketTabs, { LocalAsset } from "@/components/markets/MarketTabs";
import MarketChartSection from "@/components/markets/MarketChartSection";
import MarketOrderForm from "@/components/markets/MarketOrderForm";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketContainerProps {
  marketData: LocalAsset[];
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dataSource?: string;
  realtimeEnabled?: boolean;
  onRefresh?: () => void;
}

const MarketContainer = ({ 
  marketData, 
  isLoading, 
  error, 
  activeTab, 
  onTabChange,
  dataSource = "Simulated",
  realtimeEnabled = false,
  onRefresh
}: MarketContainerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<LocalAsset>({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67432.21,
    change_percentage: 2.4,
    market_type: "Crypto",
    volume: "14.2B"
  });

  const chartSectionRef = useRef<HTMLDivElement>(null);
  
  // Check if the selected market is open
  const marketIsOpen = selectedAsset ? isMarketOpen(selectedAsset.market_type) : false;

  // Create a handler function to properly handle the asset selection
  const handleAssetSelection = (asset: LocalAsset) => {
    setSelectedAsset(asset);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Market header section */}
        <div className="flex items-center justify-between mb-4">
          <MarketHeader 
            selectedAsset={selectedAsset as any}
            marketIsOpen={marketIsOpen}
          />
          
          <div className="flex items-center gap-2">
            <Badge variant={dataSource === "Simulated" ? "outline" : "default"} className="ml-2">
              {dataSource} Data
            </Badge>
            
            {realtimeEnabled && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                <Wifi className="h-3 w-3" />
                <span>Real-time</span>
              </Badge>
            )}
            
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh} 
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Market search and table section */}
        <div className="mb-8">
          <MarketSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="mt-4">
            <MarketTabs 
              activeTab={activeTab}
              setActiveTab={onTabChange}
              marketData={marketData}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              onSelectAsset={handleAssetSelection}
              containerRef={chartSectionRef}
            />
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Chart and details section */}
        <MarketChartSection 
          chartSectionRef={chartSectionRef}
          selectedAsset={selectedAsset as any}
          marketIsOpen={marketIsOpen}
        />

        {/* Advanced Order Form Card for trading */}
        <MarketOrderForm selectedAsset={selectedAsset as any} />
        
        {/* News section */}
        <div className="mt-6">
          <EnhancedNewsWidget marketType={selectedAsset.market_type as any} />
        </div>
      </div>
    </div>
  );
};

export default MarketContainer;
