
import { useState, useEffect } from "react";
import { X, ChevronDown, Clock, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMarketData } from "@/hooks/useMarketData";
import { LeverageSlider } from "@/components/trade";
import { isMarketOpen } from "@/utils/marketHours";
import { useAuth } from "@/hooks/useAuth";

const SUPPORTED_ASSETS = [
  { name: "Bitcoin", symbol: "BTCUSD", market_type: "Crypto" },
  { name: "Ethereum", symbol: "ETHUSD", market_type: "Crypto" },
  { name: "Apple Inc.", symbol: "AAPL", market_type: "Stocks" },
  { name: "Tesla", symbol: "TSLA", market_type: "Stocks" },
  { name: "S&P 500", symbol: "SPX", market_type: "Indices" },
  { name: "Gold", symbol: "XAUUSD", market_type: "Commodities" },
  { name: "EUR/USD", symbol: "EURUSD", market_type: "Forex" }
];

interface TradeSlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeSlidePanel({ open, onOpenChange }: TradeSlidePanelProps) {
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_ASSETS[0]);
  const [orderType, setOrderType] = useState("market");
  const [quantity, setQuantity] = useState("0.01");
  const [leverage, setLeverage] = useState([1]);
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  
  // Use market data hook to get real-time price
  const { marketData, isLoading, refetch } = useMarketData(
    [selectedAsset.market_type],
    { refetchInterval: 1000, enableRefresh: true }
  );
  
  // Find current price in market data
  const currentAssetData = marketData.find(item => item.symbol === selectedAsset.symbol);
  const currentPrice = currentAssetData?.price || 0;
  
  // Check if market is open for the selected asset
  const marketIsOpen = isMarketOpen(selectedAsset.market_type);
  
  // Auto-refresh price every second for simulated real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  // Calculate required margin and estimated cost
  const parsedQuantity = parseFloat(quantity) || 0;
  const marginRequirement = (currentPrice * parsedQuantity) / leverage[0];
  const estimatedCost = currentPrice * parsedQuantity;
  const fee = estimatedCost * 0.001; // 0.1% fee
  const totalCost = estimatedCost + fee;
  
  // Handle asset selection
  const handleAssetSelect = (symbol: string) => {
    const asset = SUPPORTED_ASSETS.find(a => a.symbol === symbol);
    if (asset) {
      setSelectedAsset(asset);
    }
  };
  
  // Handle order execution
  const handleExecuteTrade = async (action: "buy" | "sell") => {
    if (!marketIsOpen) {
      toast({
        title: "Market Closed",
        description: "The market is currently closed. Please try again during market hours.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to execute trades.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExecuting(true);
    setTradeAction(action);
    
    try {
      // Simulate network delay for trade execution (0.5 - 1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Get latest price
      await refetch();
      
      // Create trade object (would be saved to database in a real implementation)
      const trade = {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        user_id: user.id,
        type: action,
        asset: selectedAsset.symbol,
        amount: parsedQuantity,
        price: currentPrice,
        total: totalCost,
        leverage: leverage[0],
        order_type: orderType,
        status: 'completed',
        date: new Date().toISOString(),
      };
      
      // Save trade to session storage for demo purposes
      const existingTrades = JSON.parse(sessionStorage.getItem('trades') || '[]');
      sessionStorage.setItem('trades', JSON.stringify([trade, ...existingTrades]));
      
      // Success notification
      toast({
        title: `Order Executed: ${action.toUpperCase()} ${selectedAsset.symbol}`,
        description: `${action.toUpperCase()} order for ${parsedQuantity} ${selectedAsset.symbol} at $${currentPrice.toLocaleString()} executed successfully.`,
        variant: action === "buy" ? "default" : "destructive",
      });
      
      // Close the panel after successful execution
      setTimeout(() => onOpenChange(false), 1500);
      
    } catch (error) {
      console.error("Trade execution error:", error);
      toast({
        title: "Execution Failed",
        description: "There was an error executing your trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md w-full border-r">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">New Trade</SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="space-y-4">
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <label htmlFor="asset-select" className="text-sm font-medium">
              Select Asset
            </label>
            <Select value={selectedAsset.symbol} onValueChange={handleAssetSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SUPPORTED_ASSETS.map((asset) => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      {asset.name} ({asset.symbol})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Current Price */}
          <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Current Price</span>
            </div>
            <div className="font-medium">
              {isLoading ? (
                <div className="h-5 w-20 animate-pulse bg-secondary rounded"></div>
              ) : (
                `$${currentPrice.toLocaleString()}`
              )}
            </div>
          </div>
          
          {/* Market Status Alert */}
          {!marketIsOpen && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 text-warning rounded-md">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Market Closed</p>
                <p className="text-xs text-muted-foreground">
                  {selectedAsset.market_type} market is currently closed. Orders will be queued for execution when the market opens.
                </p>
              </div>
            </div>
          )}
          
          {/* Order Type Selection */}
          <div className="space-y-1.5">
            <label htmlFor="order-type" className="text-sm font-medium">
              Order Type
            </label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market Order</SelectItem>
                <SelectItem value="limit">Limit Order</SelectItem>
                <SelectItem value="stop">Stop Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full"
            />
          </div>
          
          {/* Leverage Slider */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Leverage <span className="text-muted-foreground">({leverage[0]}x)</span>
            </label>
            <LeverageSlider
              leverage={leverage}
              onLeverageChange={setLeverage}
            />
          </div>
          
          {/* Trade Summary */}
          <div className="space-y-3 p-3 bg-secondary/30 rounded-md">
            <h3 className="text-sm font-medium">Trade Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Margin</span>
                <span>${marginRequirement.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Value</span>
                <span>${estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee (0.1%)</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-border my-1 pt-1"></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="bg-warning hover:bg-warning/90 text-white"
              onClick={() => handleExecuteTrade("sell")}
              disabled={isExecuting || parsedQuantity <= 0}
            >
              {isExecuting && tradeAction === "sell" ? "Processing..." : "Sell"}
            </Button>
            <Button
              className="bg-success hover:bg-success/90 text-white"
              onClick={() => handleExecuteTrade("buy")}
              disabled={isExecuting || parsedQuantity <= 0}
            >
              {isExecuting && tradeAction === "buy" ? "Processing..." : "Buy"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
