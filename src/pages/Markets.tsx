import React, { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import MarketSearch from "@/components/markets/MarketSearch";
import MarketTabs from "@/components/markets/MarketTabs";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import { Asset } from "@/hooks/useMarketData";
import { isMarketOpen } from "@/utils/marketHours";
import { TradeButton } from "@/components/trade";
import MarketHeader from "@/components/markets/MarketHeader";
import MarketChartSection from "@/components/markets/MarketChartSection";
import { AdvancedOrderForm, AdvancedOrderFormValues } from "@/components/trade/AdvancedOrderForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
  
  // Use the shadcn toast hooks for notifications that need to follow the UI system
  const { toast: uiToast } = useToast();
  const chartSectionRef = useRef<HTMLDivElement>(null);
  
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const { marketData, isLoading, error, refetch } = useCombinedMarketData(
    [activeTab],
    { refetchInterval: 1000 * 60 } // Refresh every minute (kept in backend)
  );

  useEffect(() => {
    if (marketData.length > 0 && !selectedAsset.id) {
      setSelectedAsset(marketData[0]);
    }
  }, [marketData, selectedAsset.id]);
  
  // Check if the selected market is open
  const marketIsOpen = selectedAsset ? isMarketOpen(selectedAsset.market_type) : false;

  // Handle order submission
  const handleOrderSubmit = (values: AdvancedOrderFormValues, action: "buy" | "sell") => {
    console.log('Order values:', values, 'Action:', action);
    
    // In a real app, this would submit the order to an API
    const orderTypeDisplay = values.orderType === "market" ? "Market" : "Entry";
    
    // Using sonner toast for transactional notifications
    toast(`${orderTypeDisplay} ${action.toUpperCase()} order for ${selectedAsset.symbol} created successfully`, {
      description: `Order type: ${orderTypeDisplay}, Stop Loss: ${values.stopLoss ? 'Yes' : 'No'}, Take Profit: ${values.takeProfit ? 'Yes' : 'No'}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Market header section */}
        <MarketHeader 
          selectedAsset={selectedAsset}
          marketIsOpen={marketIsOpen}
        />
        
        {/* Market search and table section - now full width */}
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
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade {selectedAsset.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedOrderForm
                currentPrice={selectedAsset.price}
                symbol={selectedAsset.symbol}
                onOrderSubmit={handleOrderSubmit}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* News section - Full width below */}
        <div className="mt-6">
          <EnhancedNewsWidget marketType={selectedAsset.market_type} />
        </div>
      </div>
    </div>
  );
};

export default Markets;
