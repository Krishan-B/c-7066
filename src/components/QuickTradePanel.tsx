
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Info, AlertCircle, Clock } from "lucide-react";
import { isMarketOpen, getMarketHoursMessage } from "@/utils/marketHours";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMarketData, Asset } from "@/hooks/useMarketData";

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
  const [amount, setAmount] = useState("100");
  const [orderType, setOrderType] = useState("market");
  const [leverage, setLeverage] = useState([1]);
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
  
  // Calculate estimated values
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * 0.001;
  const total = parsedAmount + fee;
  
  const handleTabChange = (value: string) => {
    if (value === "buy" || value === "sell") {
      setActiveTab(value);
    }
  };

  const handleSubmit = async (action: "buy" | "sell") => {
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
        description: `${action.toUpperCase()} order for $${amount} of ${asset.symbol} at $${currentPrice.toLocaleString()} with ${leverage[0]}x leverage`,
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
      </div>
      
      {!marketIsOpen && (
        <Alert className="mb-4 bg-destructive/10 border-destructive">
          <Clock className="h-4 w-4" />
          <AlertTitle>Market Closed</AlertTitle>
          <AlertDescription>
            The market for {asset.market_type} is currently closed.
            <div className="text-xs mt-1">{getMarketHoursMessage(asset.market_type)}</div>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="buy" onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buy">
          <div className="mt-4">
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">Order Type</label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={orderType === "market" ? "default" : "outline"} 
                  className="flex-1 text-xs" 
                  onClick={() => setOrderType("market")}
                >
                  Market
                </Button>
                <Button 
                  type="button" 
                  variant={orderType === "limit" ? "default" : "outline"} 
                  className="flex-1 text-xs" 
                  onClick={() => setOrderType("limit")}
                >
                  Limit
                </Button>
                <Button 
                  type="button" 
                  variant={orderType === "stop" ? "default" : "outline"} 
                  className="flex-1 text-xs" 
                  onClick={() => setOrderType("stop")}
                >
                  Stop
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">Amount (USD)</label>
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary/40"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Leverage</label>
                <span className="text-sm font-medium">{leverage[0]}x</span>
              </div>
              <Slider
                defaultValue={[1]}
                max={25}
                min={1}
                step={1}
                value={leverage}
                onValueChange={setLeverage}
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>1x</span>
                <span>10x</span>
                <span>25x</span>
              </div>
            </div>
            
            <div className="mb-4 text-xs bg-secondary/40 p-3 rounded-md border border-secondary/60">
              <div className="flex items-start gap-2">
                <Info className="min-w-4 w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground">
                  Trading with leverage increases both potential profits and losses. Make sure you understand the risks before placing an order.
                </p>
              </div>
            </div>
            
            <div className="mb-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Est. Price</span>
                <span className="text-xs">${isLoading ? "Loading..." : currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="text-xs">${parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Fee (0.1%)</span>
                <span className="text-xs">${fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-secondary/40 my-1 pt-1"></div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-xs font-medium">${total.toFixed(2)}</span>
              </div>
            </div>
          
            <Button 
              type="button" 
              className="w-full bg-success hover:bg-success/80" 
              onClick={() => handleSubmit("buy")}
              disabled={!marketIsOpen || isExecuting || isLoading}
            >
              {isExecuting ? "Processing..." : `Buy ${asset.symbol}`}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="sell">
          <div className="mt-4">
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">Order Type</label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={orderType === "market" ? "default" : "outline"} 
                  className="flex-1 text-xs" 
                  onClick={() => setOrderType("market")}
                >
                  Market
                </Button>
                <Button 
                  type="button" 
                  variant={orderType === "limit" ? "default" : "outline"} 
                  className="flex-1 text-xs" 
                  onClick={() => setOrderType("limit")}
                >
                  Limit
                </Button>
                <Button 
                  type="button" 
                  variant={orderType === "stop" ? "default" : "outline"} 
                  className="flex-1 text-xs" 
                  onClick={() => setOrderType("stop")}
                >
                  Stop
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">Amount (USD)</label>
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary/40"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Leverage</label>
                <span className="text-sm font-medium">{leverage[0]}x</span>
              </div>
              <Slider
                defaultValue={[1]}
                max={25}
                min={1}
                step={1}
                value={leverage}
                onValueChange={setLeverage}
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>1x</span>
                <span>10x</span>
                <span>25x</span>
              </div>
            </div>
            
            <div className="mb-4 text-xs bg-secondary/40 p-3 rounded-md border border-secondary/60">
              <div className="flex items-start gap-2">
                <Info className="min-w-4 w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground">
                  Trading with leverage increases both potential profits and losses. Make sure you understand the risks before placing an order.
                </p>
              </div>
            </div>
            
            <div className="mb-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Est. Price</span>
                <span className="text-xs">${isLoading ? "Loading..." : currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="text-xs">${parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Fee (0.1%)</span>
                <span className="text-xs">${fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-secondary/40 my-1 pt-1"></div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-xs font-medium">${total.toFixed(2)}</span>
              </div>
            </div>
          
            <Button 
              type="button" 
              className="w-full bg-warning hover:bg-warning/80" 
              onClick={() => handleSubmit("sell")}
              disabled={!marketIsOpen || isExecuting || isLoading}
            >
              {isExecuting ? "Processing..." : `Sell ${asset.symbol}`}
            </Button>
          </div>
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
