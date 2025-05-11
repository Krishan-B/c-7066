
import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { isMarketOpen } from "@/utils/marketHours";
import { useAuth } from "@/hooks/useAuth";
import { getLeverageForAssetType, formatLeverageRatio } from "@/utils/leverageUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockAccountMetrics } from "@/utils/metricUtils";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";

const ASSET_CATEGORIES = ["Crypto", "Stocks", "Forex", "Indices", "Commodities"];

interface TradeSlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeSlidePanel({ open, onOpenChange }: TradeSlidePanelProps) {
  const { user } = useAuth();
  const [assetCategory, setAssetCategory] = useState<string>("Crypto");
  const [selectedAsset, setSelectedAsset] = useState({
    name: "Bitcoin",
    symbol: "BTCUSD",
    market_type: "Crypto"
  });
  const [orderType, setOrderType] = useState<"market" | "entry">("market");
  const [units, setUnits] = useState("0.01");
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasStopLoss, setHasStopLoss] = useState(false);
  const [hasTakeProfit, setHasTakeProfit] = useState(false);
  const [hasExpirationDate, setHasExpirationDate] = useState(false);
  const [orderRate, setOrderRate] = useState("");
  const { toast } = useToast();
  
  // Use the combined market data hook for the selected category
  const { marketData, isLoading, refetch } = useCombinedMarketData(
    [assetCategory], 
    { refetchInterval: 1000 * 10, enableRefresh: true }
  );
  
  // Find current price in market data
  const currentAssetData = marketData.find(item => item.symbol === selectedAsset.symbol);
  const currentPrice = currentAssetData?.price || 0;
  const buyPrice = currentPrice * 1.001; // Slight markup for buy
  const sellPrice = currentPrice * 0.999; // Slight discount for sell
  
  // Update order rate when current price changes
  useEffect(() => {
    if (currentPrice > 0) {
      setOrderRate(currentPrice.toFixed(4));
    }
  }, [currentPrice]);
  
  // Check if market is open for the selected asset
  const marketIsOpen = isMarketOpen(selectedAsset.market_type);
  
  // Auto-refresh price every second for simulated real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  // Get the fixed leverage for the selected asset type
  const fixedLeverage = getLeverageForAssetType(assetCategory);
  
  // Get user's available funds
  const availableFunds = mockAccountMetrics.availableFunds;
  
  // Calculate required margin and estimated cost
  const parsedUnits = parseFloat(units) || 0;
  const positionValue = currentPrice * parsedUnits;
  const marginRequirement = positionValue / fixedLeverage;
  const fee = marginRequirement * 0.001; // 0.1% fee
  const totalCost = marginRequirement + fee;
  
  // Check if user can afford the trade
  const canAfford = availableFunds >= marginRequirement;
  
  // Handle asset category change
  const handleAssetCategoryChange = (category: string) => {
    setAssetCategory(category);
    
    // Select the first asset in this category
    const assetsInCategory = marketData.filter(asset => asset.market_type === category);
    if (assetsInCategory.length > 0) {
      setSelectedAsset({
        name: assetsInCategory[0].name,
        symbol: assetsInCategory[0].symbol,
        market_type: category
      });
    }
  };
  
  // Handle asset selection
  const handleAssetSelect = (symbol: string) => {
    const asset = marketData.find(a => a.symbol === symbol);
    if (asset) {
      setSelectedAsset({
        name: asset.name,
        symbol: asset.symbol,
        market_type: asset.market_type
      });
    }
  };
  
  // Handle order execution
  const handleExecuteTrade = async (action: "buy" | "sell") => {
    if (!marketIsOpen && orderType === "market") {
      toast({
        title: "Market Closed",
        description: "The market is currently closed. Please try again during market hours or use an entry order.",
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
    
    if (!canAfford && action === "buy") {
      toast({
        title: "Insufficient Funds",
        description: "You do not have enough funds to execute this trade.",
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
      
      // Create order object based on order type
      const orderDetails = {
        asset: selectedAsset.symbol,
        units: parsedUnits,
        leverage: fixedLeverage,
        orderType: orderType,
        action: action,
        stopLoss: hasStopLoss,
        takeProfit: hasTakeProfit,
        expiration: hasExpirationDate && orderType === "entry",
      };
      
      // Display different success message based on order type
      if (orderType === "market") {
        toast({
          title: `Position Opened: ${action.toUpperCase()} ${selectedAsset.symbol}`,
          description: `${action.toUpperCase()} order for ${parsedUnits} ${selectedAsset.symbol} at ${action === "buy" ? "$" + buyPrice.toFixed(4) : "$" + sellPrice.toFixed(4)} executed successfully.`,
          variant: action === "buy" ? "default" : "destructive",
        });
      } else {
        toast({
          title: `Entry Order Placed: ${action.toUpperCase()} ${selectedAsset.symbol}`,
          description: `${action.toUpperCase()} entry order for ${parsedUnits} ${selectedAsset.symbol} at $${orderRate} has been placed.`,
          variant: "default",
        });
      }
      
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
          {/* Asset Category Selection */}
          <div className="space-y-1.5">
            <label htmlFor="asset-category" className="text-sm font-medium">
              Asset Category
            </label>
            <Select value={assetCategory} onValueChange={handleAssetCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ASSET_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
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
                  {isLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : marketData.filter(asset => asset.market_type === assetCategory).length > 0 ? (
                    marketData
                      .filter(asset => asset.market_type === assetCategory)
                      .map((asset) => (
                        <SelectItem key={asset.symbol} value={asset.symbol}>
                          {asset.name} ({asset.symbol})
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="none">No assets available</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Real-time prices with Buy/Sell buttons */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Buy Price</div>
              <div className="text-lg font-medium">${buyPrice.toFixed(4)}</div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleExecuteTrade("buy")}
                disabled={isExecuting || (orderType === "market" && !marketIsOpen) || !canAfford}
              >
                {isExecuting && tradeAction === "buy" ? "Processing..." : "Buy"}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Sell Price</div>
              <div className="text-lg font-medium">${sellPrice.toFixed(4)}</div>
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleExecuteTrade("sell")}
                disabled={isExecuting || (orderType === "market" && !marketIsOpen) || parsedUnits <= 0}
              >
                {isExecuting && tradeAction === "sell" ? "Processing..." : "Sell"}
              </Button>
            </div>
          </div>
          
          {/* Units Input */}
          <div className="space-y-1.5">
            <label htmlFor="units" className="text-sm font-medium">
              Units
            </label>
            <Input
              id="units"
              type="number"
              step="0.01"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="Enter units"
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              Funds required to open the position: <span className={`font-medium ${!canAfford ? 'text-red-500' : ''}`}>${marginRequirement.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Available: <span className="font-medium">${availableFunds.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Order Type Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Order Type</label>
            <div className="flex gap-2">
              <Button 
                variant={orderType === "market" ? "default" : "outline"} 
                className={`flex-1 ${orderType === "market" ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setOrderType("market")}
              >
                Market order
              </Button>
              <Button 
                variant={orderType === "entry" ? "default" : "outline"} 
                className={`flex-1 ${orderType === "entry" ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""}`}
                onClick={() => setOrderType("entry")}
              >
                Entry order
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {orderType === "market" 
                ? "A market order will be executed immediately at the next market price."
                : "An entry order will be executed when the market reaches the requested price."}
            </p>
          </div>

          {/* Entry Order Rate (only for entry orders) */}
          {orderType === "entry" && (
            <div className="space-y-1.5">
              <label htmlFor="orderRate" className="text-sm font-medium">
                Order Rate
              </label>
              <Input
                id="orderRate"
                type="number"
                step="0.0001"
                value={orderRate}
                onChange={(e) => setOrderRate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Rate should be above {(currentPrice * 0.98).toFixed(4)} or below {(currentPrice * 1.02).toFixed(4)}
              </p>
            </div>
          )}
          
          {/* Stop Loss Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox id="stopLoss" checked={hasStopLoss} onCheckedChange={() => setHasStopLoss(!hasStopLoss)} />
            <div className="flex items-center">
              <label htmlFor="stopLoss" className="text-sm font-medium cursor-pointer">
                Stop Loss
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      A stop loss order will automatically close your position when the market reaches the specified price, helping to limit potential losses.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Take Profit Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox id="takeProfit" checked={hasTakeProfit} onCheckedChange={() => setHasTakeProfit(!hasTakeProfit)} />
            <div className="flex items-center">
              <label htmlFor="takeProfit" className="text-sm font-medium cursor-pointer">
                Take Profit
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      A take profit order will automatically close your position when the market reaches a specified price, allowing you to secure profits.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Expiration Date Checkbox (only for entry orders) */}
          {orderType === "entry" && (
            <div className="flex items-center space-x-2">
              <Checkbox id="expirationDate" checked={hasExpirationDate} onCheckedChange={() => setHasExpirationDate(!hasExpirationDate)} />
              <div className="flex items-center">
                <label htmlFor="expirationDate" className="text-sm font-medium cursor-pointer">
                  Expiration Date
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Set a date when your entry order should expire if not executed.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
          
          {/* Trade Summary */}
          <div className="space-y-3 p-3 bg-secondary/30 rounded-md">
            <h3 className="text-sm font-medium">Trade Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position Value</span>
                <span>${positionValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Margin</span>
                <span>${marginRequirement.toFixed(2)}</span>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
