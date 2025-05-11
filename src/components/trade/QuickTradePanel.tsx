
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { isMarketOpen } from "@/utils/marketHours";
import { useToast } from "@/hooks/use-toast";
import { useMarketData, Asset } from "@/hooks/useMarketData";
import { TradeForm } from "@/components/trade";
import { MarketStatusAlert } from "@/components/trade";
import { getLeverageForAssetType, formatLeverageRatio } from "@/utils/leverageUtils";

interface QuickTradePanelProps {
  asset: {
    name: string;
    symbol: string;
    price: number;
    change_percentage?: number;
    market_type: string;
  };
}

const QuickTradePanel = ({ asset }: QuickTradePanelProps) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  
  // Use our useMarketData hook to get real-time price data
  const { marketData, isLoading, refetch } = useMarketData([asset.market_type], {
    refetchInterval: 10000, // Refresh every 10 seconds for trade panel
    enableRefresh: true,
  });
  
  // Find the current asset in our market data
  const currentAssetData = marketData.find((item: Asset) => 
    item.symbol === asset.symbol
  );
  
  // Get the current price, defaulting to the passed asset price if not found
  const currentPrice = currentAssetData?.price || asset.price;
  
  // Check if market is open
  const marketIsOpen = isMarketOpen(asset.market_type);
  
  // Get fixed leverage for this asset type
  const fixedLeverage = getLeverageForAssetType(asset.market_type);
  
  const handleTabChange = (value: string) => {
    if (value === "buy" || value === "sell") {
      setActiveTab(value);
    }
  };

  const handleSubmit = async (action: "buy" | "sell", amount: string) => {
    if (!marketIsOpen) {
      toast({
        title: "Market Closed",
        description: "The market is currently closed. Please try again during market hours.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExecuting(true);
    
    try {
      // Simulate network delay for trade execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh market data to get latest price
      await refetch();
      
      toast({
        title: `Order Executed: ${action.toUpperCase()} ${asset.name}`,
        description: `${action.toUpperCase()} order for $${amount} of ${asset.symbol} at $${currentPrice.toLocaleString()} with ${formatLeverageRatio(fixedLeverage)} leverage`,
        variant: action === "buy" ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "There was an error executing your trade. Please try again.",
        variant: "destructive",
      });
      console.error("Trade execution error:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="glass-card rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Quick Trade</h2>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-muted-foreground">Asset</span>
          <span className="text-sm font-medium">{asset.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Current Price</span>
          <span className="text-sm font-medium">
            ${isLoading ? "Loading..." : currentPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-sm text-muted-foreground">Fixed Leverage</span>
          <span className="text-sm font-medium">{formatLeverageRatio(fixedLeverage)}</span>
        </div>
      </div>
      
      {!marketIsOpen && <MarketStatusAlert marketType={asset.market_type} />}
      
      <Tabs defaultValue="buy" onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buy">
          <TradeForm 
            action="buy"
            asset={asset}
            currentPrice={currentPrice}
            isLoading={isLoading}
            isExecuting={isExecuting}
            marketIsOpen={marketIsOpen}
            fixedLeverage={fixedLeverage}
            onSubmit={(amount, orderType) => handleSubmit("buy", amount)}
          />
        </TabsContent>
        
        <TabsContent value="sell">
          <TradeForm 
            action="sell"
            asset={asset}
            currentPrice={currentPrice}
            isLoading={isLoading}
            isExecuting={isExecuting}
            marketIsOpen={marketIsOpen}
            fixedLeverage={fixedLeverage}
            onSubmit={(amount, orderType) => handleSubmit("sell", amount)}
          />
        </TabsContent>
      </Tabs>
      
      <Button variant="outline" className="w-full flex gap-2 mt-2">
        <CreditCard className="w-4 h-4" />
        <span>Deposit Funds</span>
      </Button>
    </div>
  );
};

export default QuickTradePanel;
