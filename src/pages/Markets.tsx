
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCcw } from "lucide-react";
import MarketSearch from "@/components/markets/MarketSearch";
import MarketTabs from "@/components/markets/MarketTabs";
import AssetDetails from "@/components/markets/AssetDetails";
import MarketDetailsCard from "@/components/markets/MarketDetailsCard";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
}

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
  
  // Use the combined market data hook with a 2-minute refetch interval
  const { marketData, isLoading, error, refetch, isFetching } = useCombinedMarketData(
    [activeTab],
    { refetchInterval: 1000 * 60 * 2 } // Refresh every 2 minutes
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

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Markets</h1>
            <p className="text-muted-foreground">
              Explore live price data and trends across different markets
            </p>
          </div>
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
              <EnhancedNewsWidget marketType={selectedAsset.market_type} />
              <MarketDetailsCard selectedAsset={selectedAsset} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
