
import { useState, useEffect } from "react";
import { Asset } from "@/hooks/useMarketData";
import { OrderTypeSelector } from "@/components/trade";
import { TradeSummary } from "@/components/trade";
import { getLeverageForAssetType } from "@/utils/leverageUtils";
import { AssetCategorySelector } from "./AssetCategorySelector";
import { AssetSelector } from "./AssetSelector";
import { UnitsInput } from "./UnitsInput";
import { StopLossCheckbox } from "./StopLossCheckbox";
import { TakeProfitCheckbox } from "./TakeProfitCheckbox";
import { TradeActionButton } from "./TradeActionButton";

interface TradeFormProps {
  action: "buy" | "sell";
  asset: {
    name: string;
    symbol: string;
    price: number;
    market_type: string;
  };
  currentPrice: number;
  isLoading: boolean;
  isExecuting: boolean;
  marketIsOpen: boolean;
  fixedLeverage?: number;
  onSubmit: (amount: string, orderType: string, leverage?: number[]) => void;
  availableFunds?: number;
  marketData?: Asset[];
}

const TradeForm = ({
  action,
  asset,
  currentPrice,
  isLoading,
  isExecuting,
  marketIsOpen,
  fixedLeverage = 1, // Default to 1:1 (no leverage) if not provided
  onSubmit,
  availableFunds = 10000,
  marketData = [],
}: TradeFormProps) => {
  const [units, setUnits] = useState("0.1");
  const [orderType, setOrderType] = useState("market");
  const [assetCategory, setAssetCategory] = useState(asset.market_type);
  const [selectedAsset, setSelectedAsset] = useState(asset.symbol);
  const [hasStopLoss, setHasStopLoss] = useState(false);
  const [hasTakeProfit, setHasTakeProfit] = useState(false);
  const [buyPrice, setBuyPrice] = useState(currentPrice * 1.001);
  const [sellPrice, setSellPrice] = useState(currentPrice * 0.999);
  
  // Update buy/sell prices when current price changes
  useEffect(() => {
    setBuyPrice(currentPrice * 1.001);
    setSellPrice(currentPrice * 0.999);
    
    // Simulate real-time price movement
    const interval = setInterval(() => {
      const random = Math.random() * 0.002 - 0.001;
      setBuyPrice(prev => prev * (1 + random));
      setSellPrice(prev => prev * (1 + random));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentPrice]);
  
  // Filter assets based on selected category
  const filteredAssets = marketData?.filter(a => a.market_type === assetCategory) || [];
  
  // Calculate values based on units
  const parsedUnits = parseFloat(units) || 0;
  const leverage = getLeverageForAssetType(assetCategory);
  const positionValue = currentPrice * parsedUnits;
  const requiredFunds = positionValue / leverage;
  const fee = requiredFunds * 0.001; // 0.1% fee
  const total = requiredFunds + fee;
  
  // Check if user has enough funds
  const canAfford = availableFunds >= requiredFunds;

  const handleAssetCategoryChange = (value: string) => {
    setAssetCategory(value);
    
    // Reset asset selection if there are assets in this category
    const assetsInCategory = marketData?.filter(a => a.market_type === value);
    if (assetsInCategory && assetsInCategory.length > 0) {
      setSelectedAsset(assetsInCategory[0].symbol);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(units, orderType, [leverage]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Asset Category Selection */}
      <AssetCategorySelector
        assetCategory={assetCategory}
        setAssetCategory={handleAssetCategoryChange}
        isExecuting={isExecuting}
      />
      
      {/* Asset Selection */}
      <AssetSelector
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        isExecuting={isExecuting}
        isLoading={isLoading}
        filteredAssets={filteredAssets}
      />
      
      {/* Units Input */}
      <UnitsInput
        units={units}
        setUnits={setUnits}
        isExecuting={isExecuting}
        requiredFunds={requiredFunds}
        canAfford={canAfford}
        availableFunds={availableFunds}
      />
      
      {/* Order Type Selection */}
      <OrderTypeSelector
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        disabled={isExecuting}
      />
      
      {/* Show Entry Rate input if entry order is selected */}
      {orderType === "entry" && (
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Order rate:</label>
          <div className="flex items-center">
            <button 
              type="button" 
              className="px-3 py-2 border border-input bg-background rounded-l-md"
              onClick={() => {}}
            >
              -
            </button>
            <input 
              type="text" 
              className="flex-1 text-center border-y border-input bg-background py-2"
              placeholder="Enter rate"
              defaultValue={currentPrice.toFixed(4)}
            />
            <button 
              type="button" 
              className="px-3 py-2 border border-input bg-background rounded-r-md"
              onClick={() => {}}
            >
              +
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rate should be above {(currentPrice * 0.98).toFixed(4)} or below {(currentPrice * 1.02).toFixed(4)}
          </p>
        </div>
      )}
      
      {/* Stop Loss Checkbox */}
      <StopLossCheckbox
        hasStopLoss={hasStopLoss}
        setHasStopLoss={setHasStopLoss}
        isExecuting={isExecuting}
      />
      
      {/* Stop Loss Settings */}
      {hasStopLoss && (
        <div className="ml-6 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Close rate:</label>
              <div className="flex items-center">
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-l-md"
                  onClick={() => {}}
                >
                  -
                </button>
                <input 
                  type="text" 
                  className="flex-1 text-center border-y border-input bg-background py-2"
                  placeholder="Rate"
                />
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-r-md"
                  onClick={() => {}}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Close amount:</label>
              <div className="flex items-center">
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-l-md"
                  onClick={() => {}}
                >
                  -
                </button>
                <input 
                  type="text" 
                  className="flex-1 text-center border-y border-input bg-background py-2"
                  placeholder="Amount"
                />
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-r-md"
                  onClick={() => {}}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rate should be between {(currentPrice * 0.9).toFixed(4)} and {(currentPrice * 0.95).toFixed(4)}
          </p>
        </div>
      )}
      
      {/* Take Profit Checkbox */}
      <TakeProfitCheckbox
        hasTakeProfit={hasTakeProfit}
        setHasTakeProfit={setHasTakeProfit}
        isExecuting={isExecuting}
      />
      
      {/* Take Profit Settings */}
      {hasTakeProfit && (
        <div className="ml-6 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Close rate:</label>
              <div className="flex items-center">
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-l-md"
                  onClick={() => {}}
                >
                  -
                </button>
                <input 
                  type="text" 
                  className="flex-1 text-center border-y border-input bg-background py-2"
                  placeholder="Rate"
                />
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-r-md"
                  onClick={() => {}}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Close amount:</label>
              <div className="flex items-center">
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-l-md"
                  onClick={() => {}}
                >
                  -
                </button>
                <input 
                  type="text" 
                  className="flex-1 text-center border-y border-input bg-background py-2"
                  placeholder="Amount"
                />
                <button 
                  type="button" 
                  className="px-3 py-2 border border-input bg-background rounded-r-md"
                  onClick={() => {}}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rate should be between {(currentPrice * 1.05).toFixed(4)} and {(currentPrice * 1.1).toFixed(4)}
          </p>
        </div>
      )}
      
      {/* Trade Summary */}
      <TradeSummary
        currentPrice={currentPrice}
        parsedAmount={requiredFunds}
        fee={fee}
        total={total}
        isLoading={isLoading}
      />
      
      {/* Trade Action Button */}
      <TradeActionButton
        action={action}
        selectedAsset={selectedAsset}
        isExecuting={isExecuting}
        marketIsOpen={marketIsOpen}
        parsedUnits={parsedUnits}
        canAfford={canAfford}
        buyPrice={buyPrice}
        sellPrice={sellPrice}
      />
    </form>
  );
};

export default TradeForm;
