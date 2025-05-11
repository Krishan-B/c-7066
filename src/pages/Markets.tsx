
import React, { useState, useEffect, useRef } from "react";
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
import { Asset } from "@/hooks/useMarketData";
import { isMarketOpen, getMarketHoursMessage } from "@/utils/marketHours";
import { MarketHoursDisplay, TradeButton } from "@/components/trade";
import { Separator } from "@/components/ui/separator";

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
  const chartSectionRef = useRef<HTMLDivElement>(null);
  
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
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
        
        {/* Market search and table section - now full width */}
        <div className="mb-6">
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
        
        <Separator className="my-6" />
        
        {/* Chart and details section */}
        <div ref={chartSectionRef}>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">{selectedAsset.name} ({selectedAsset.symbol})</h2>
            <div className={`px-3 py-1 text-sm rounded-full ${marketIsOpen ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {marketIsOpen ? 'Market Open' : 'Market Closed'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TradingView Chart - Now takes 2/3 of the width */}
            <Card className="col-span-1 lg:col-span-2">
              <div className="h-[500px]">
                <iframe
                  title="Trading Chart"
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${selectedAsset.symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </Card>
            
            {/* Market details card - Now takes 1/3 of the width and matches chart height */}
            <Card className="col-span-1 lg:h-[500px] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Market Details</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                      <div className="font-semibold">${typeof selectedAsset.price === 'number' ? selectedAsset.price.toLocaleString() : selectedAsset.price}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                      <div className={`font-semibold ${selectedAsset.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
                        {selectedAsset.change_percentage >= 0 ? "+" : ""}{selectedAsset.change_percentage.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                      <div className="font-semibold">{selectedAsset.volume}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Market Type</div>
                      <div className="font-semibold">{selectedAsset.market_type}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Integrated trading hours info */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Trading Hours</h4>
                    <div className="text-xs text-muted-foreground">
                      {getMarketHoursMessage(selectedAsset.market_type)}
                    </div>
                    <div className={`mt-2 px-3 py-2 text-xs rounded-md ${marketIsOpen ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {marketIsOpen ? 'Trading is currently active' : 'Trading is currently closed'}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <div className="flex justify-center space-x-2">
                      <Button 
                        className="flex-1" 
                        disabled={!marketIsOpen}
                      >
                        Trade
                      </Button>
                      <Button variant="outline" size="icon">
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {!marketIsOpen && (
                      <div className="mt-2 text-xs text-warning text-center">
                        The market is currently closed. Please try again during market hours.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* News section - Full width below */}
          <div className="mt-6">
            <EnhancedNewsWidget marketType={selectedAsset.market_type} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
