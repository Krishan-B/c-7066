
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCcw } from "lucide-react";
import MarketSearch from "@/components/markets/MarketSearch";
import MarketTabs from "@/components/markets/MarketTabs";
import AssetDetails from "@/components/markets/AssetDetails";
import MarketDetailsCard from "@/components/markets/MarketDetailsCard";
import MarketHoursChart from "@/components/markets/MarketHoursChart";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import { Asset } from "@/hooks/useMarketData";
import { isMarketOpen } from "@/utils/marketHours";
import { MarketHoursDisplay, TradeButton } from "@/components/trade";

const Markets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Crypto");
  const [selectedAsset, setSelectedAsset] = useState<Asset>({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67432.21,
    change_percentage: 2.4,
    market_type: "Crypto",
    volume: "14.2B"
  });
  
  const { toast } = useToast();
  
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const { marketData, isLoading, error, refetch, isFetching } = useCombinedMarketData(
    [activeTab],
    { refetchInterval: 1000 * 60 } // Refresh every minute
  );

  useEffect(() => {
    if (marketData.length > 0 && !selectedAsset.id) {
      setSelectedAsset(marketData[0]);
    }
  }, [marketData, selectedAsset.id]);

  const handleRefreshData = () => {
    refetch();
    toast({
      title: "Refreshing market data",
      description: `Fetching the latest ${activeTab} market data...`,
    });
  };
  
  // Check if the selected market is open
  const marketIsOpen = selectedAsset ? isMarketOpen(selectedAsset.market_type) : false;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Markets</h1>
            <p className="text-muted-foreground">
              Explore live price data and trends across different markets
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedAsset && (
              <MarketHoursDisplay 
                marketType={selectedAsset.market_type}
                isOpen={marketIsOpen}
                className="hidden md:flex"
              />
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData}
              className="flex items-center gap-1"
              disabled={isFetching}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <TradeButton size="sm" />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-4">
            <MarketSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <MarketTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              marketData={marketData}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              onSelectAsset={setSelectedAsset}
            />
          </div>
          
          <div className="md:w-2/3">
            <AssetDetails selectedAsset={selectedAsset} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="space-y-6">
                <EnhancedNewsWidget marketType={selectedAsset.market_type} />
                <MarketHoursChart marketType={selectedAsset.market_type} />
              </div>
              <MarketDetailsCard 
                selectedAsset={selectedAsset} 
                marketIsOpen={marketIsOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
