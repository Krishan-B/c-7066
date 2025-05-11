
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTypeSelector } from "@/components/trade";
import { TradeSummary } from "@/components/trade"; 
import { formatLeverageRatio } from "@/utils/leverageUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset } from "@/hooks/useMarketData";
import { getLeverageForAssetType } from "@/utils/leverageUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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

const ASSET_CATEGORIES = ["Crypto", "Stocks", "Forex", "Indices", "Commodities"];

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
      <div>
        <label htmlFor="asset-category" className="text-sm font-medium block mb-1">
          Asset Category
        </label>
        <Select
          value={assetCategory}
          onValueChange={handleAssetCategoryChange}
          disabled={isExecuting}
        >
          <SelectTrigger id="asset-category" className="w-full">
            <SelectValue placeholder="Select asset category" />
          </SelectTrigger>
          <SelectContent>
            {ASSET_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Asset Selection */}
      <div>
        <label htmlFor="asset" className="text-sm font-medium block mb-1">
          Select Asset
        </label>
        <Select
          value={selectedAsset}
          onValueChange={setSelectedAsset}
          disabled={isExecuting}
        >
          <SelectTrigger id="asset" className="w-full">
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading">Loading...</SelectItem>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((a) => (
                <SelectItem key={a.symbol} value={a.symbol}>
                  {a.name} ({a.symbol})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none">No assets available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Units Input */}
      <div>
        <label htmlFor="units" className="text-sm font-medium block mb-1">
          Units
        </label>
        <Input
          id="units"
          type="number"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          placeholder="Enter units"
          className="w-full"
          disabled={isExecuting}
          step="0.01"
        />
        <div className="flex justify-between mt-1">
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setUnits("0.1")}
          >
            0.1
          </button>
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setUnits("1")}
          >
            1
          </button>
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setUnits("10")}
          >
            10
          </button>
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setUnits("100")}
          >
            100
          </button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Funds required to open the position: <span className={`font-medium ${!canAfford ? 'text-red-500' : ''}`}>${requiredFunds.toFixed(2)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Available: <span className="font-medium">${availableFunds.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Order Type Selection */}
      <OrderTypeSelector
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        disabled={isExecuting}
      />
      
      {/* Stop Loss Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="stopLoss" 
          checked={hasStopLoss} 
          onCheckedChange={() => setHasStopLoss(!hasStopLoss)} 
          disabled={isExecuting}
        />
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
        <Checkbox 
          id="takeProfit" 
          checked={hasTakeProfit} 
          onCheckedChange={() => setHasTakeProfit(!hasTakeProfit)} 
          disabled={isExecuting}
        />
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
      
      {/* Trade Summary */}
      <TradeSummary
        currentPrice={currentPrice}
        parsedAmount={requiredFunds}
        fee={fee}
        total={total}
        isLoading={isLoading}
      />
      
      <Button
        type="submit"
        className={`w-full ${
          action === "buy"
            ? "bg-success hover:bg-success/90"
            : "bg-warning hover:bg-warning/90"
        } text-white`}
        disabled={isExecuting || !marketIsOpen || parsedUnits <= 0 || !canAfford}
      >
        {isExecuting
          ? "Processing..."
          : `${action === "buy" ? "Buy" : "Sell"} ${selectedAsset}`}
      </Button>
    </form>
  );
};

export default TradeForm;
