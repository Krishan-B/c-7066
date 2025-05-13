
import { useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";

// Import refactored components
import { TradeMainContent } from "./TradeMainContent";
import { TradePanelFooter } from "./TradePanelFooter";

interface TradeSlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeSlidePanel({ open, onOpenChange }: TradeSlidePanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State variables
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
  
  // Fetch market data for asset selection
  const { marketData } = useCombinedMarketData(
    [assetCategory], 
    { refetchInterval: 1000 * 30 }
  );
  
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
    setIsExecuting(true);
    setTradeAction(action);
    
    try {
      // Simulate network delay for trade execution (0.5 - 1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Create order object based on order type
      const orderDetails = {
        asset: selectedAsset.symbol,
        action: action,
        orderType: orderType,
        stopLoss: hasStopLoss,
        takeProfit: hasTakeProfit,
        expiration: hasExpirationDate && orderType === "entry",
      };
      
      // Display different success message based on order type
      if (orderType === "market") {
        toast({
          title: `Position Opened: ${action.toUpperCase()} ${selectedAsset.symbol}`,
          description: `${action.toUpperCase()} order executed successfully.`,
          variant: action === "buy" ? "default" : "destructive",
        });
      } else {
        toast({
          title: `Entry Order Placed: ${action.toUpperCase()} ${selectedAsset.symbol}`,
          description: `${action.toUpperCase()} entry order at $${orderRate} has been placed.`,
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
          {/* Main Content */}
          <TradeMainContent 
            assetCategory={assetCategory}
            onAssetCategoryChange={handleAssetCategoryChange}
            selectedAsset={selectedAsset}
            onAssetSelect={handleAssetSelect}
            orderType={orderType}
            setOrderType={setOrderType}
            units={units}
            setUnits={setUnits}
            onExecuteTrade={handleExecuteTrade}
            isExecuting={isExecuting}
            tradeAction={tradeAction}
            hasStopLoss={hasStopLoss}
            setHasStopLoss={setHasStopLoss}
            hasTakeProfit={hasTakeProfit}
            setHasTakeProfit={setHasTakeProfit}
            hasExpirationDate={hasExpirationDate}
            setHasExpirationDate={setHasExpirationDate}
            orderRate={orderRate}
            setOrderRate={setOrderRate}
          />
          
          {/* Trade panel footer with execute buttons */}
          <TradePanelFooter
            onExecuteTrade={handleExecuteTrade}
            isExecuting={isExecuting}
            tradeAction={tradeAction}
            selectedAsset={selectedAsset}
            orderType={orderType}
            canAfford={true} // This will be calculated in TradeMainContent
            parsedUnits={parseFloat(units) || 0}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Add a default export to fix the QuickTradePanel import issue
export default TradeSlidePanel;
