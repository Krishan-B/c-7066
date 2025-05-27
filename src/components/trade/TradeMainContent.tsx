import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCombinedMarketData, type MarketType } from "@/hooks/market";
import { useTradeCalculations } from "@/hooks/trades/useTradeCalculations";

interface SelectedAsset {
  name: string;
  symbol: string;
  market_type: MarketType;
}

interface TradeMainContentProps {
  assetCategory: MarketType;
  onAssetCategoryChange: (category: MarketType) => void;
  selectedAsset: SelectedAsset;
  onAssetSelect: (symbol: string) => void;
  orderType: "market" | "entry";
  setOrderType: (type: "market" | "entry") => void;
  units: string;
  setUnits: (units: string) => void;
  onExecuteTrade: (action: "buy" | "sell") => void;
  isExecuting: boolean;
  tradeAction: "buy" | "sell";
  hasStopLoss: boolean;
  setHasStopLoss: (has: boolean) => void;
  hasTakeProfit: boolean;
  setHasTakeProfit: (has: boolean) => void;
  hasExpirationDate: boolean;
  setHasExpirationDate: (has: boolean) => void;
  orderRate: string;
  setOrderRate: (rate: string) => void;
  stopLossRate?: string;
  setStopLossRate?: (rate: string) => void;
  takeProfitRate?: string;
  setTakeProfitRate?: (rate: string) => void;
  setExpirationDate?: (date: string | undefined) => void;
}

// Numeric input validation function
const validateNumericInput = (value: string): string => {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return "0.01";
  return value;
};

export function TradeMainContent({
  assetCategory,
  onAssetCategoryChange,
  selectedAsset,
  onAssetSelect,
  orderType,
  setOrderType,
  units,
  setUnits,
  isExecuting,
  hasStopLoss,
  setHasStopLoss,
  hasTakeProfit,
  setHasTakeProfit,
  hasExpirationDate,
  setHasExpirationDate,
  orderRate,
  setOrderRate,
  stopLossRate = "",
  setStopLossRate = () => {},
  takeProfitRate = "",
  setTakeProfitRate = () => {},
  setExpirationDate = () => {},
}: TradeMainContentProps) {
  // Fetch market data for all categories
  const { marketData, isLoading: isLoadingMarkets } = useCombinedMarketData(
    [assetCategory], 
    { refetchInterval: 30000 }
  );
  
  // Get current asset price
  const currentAsset = marketData.find(asset => 
    asset.symbol === selectedAsset.symbol
  );
  const currentPrice = currentAsset?.price || 0;
  
  // Filter assets based on selected category
  const filteredAssets = marketData.filter(
    asset => asset.market_type === assetCategory
  );
   // Asset categories
  const assetCategories: MarketType[] = [
    "Crypto",
    "Stock",
    "Forex",
    "Index",
    "Commodities"
  ];
  
  // Calculate trade values
  const { 
    leverage, 
    positionValue, 
    requiredFunds 
  } = useTradeCalculations(
    units, // pass as string
    currentPrice,
    assetCategory,
    10000
  );
  
  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!setExpirationDate) return; // Guard clause for optional prop
    
    if (date) {
      const minDate = new Date();
      if (date < minDate) {
        return; // Don't allow past dates
      }
      setExpirationDate(date.toISOString());
    } else {
      setExpirationDate(undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Asset Category Selection */}
      <div className="space-y-2">
        <Label>Asset Category</Label>
        <Select 
          value={assetCategory} 
          onValueChange={onAssetCategoryChange}
          disabled={isExecuting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {assetCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asset Selection */}
      <div className="space-y-2">
        <Label>Select Asset</Label>
        <Select 
          value={selectedAsset.symbol} 
          onValueChange={onAssetSelect}
          disabled={isExecuting || isLoadingMarkets}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingMarkets ? (
              <SelectItem value="loading">Loading assets...</SelectItem>
            ) : filteredAssets.length === 0 ? (
              <SelectItem value="none">No assets available</SelectItem>
            ) : (
              filteredAssets.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Current Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Current Price</Label>
          <div className="text-xl font-medium">
            ${currentPrice.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <Label>Leverage</Label>
          <div className="text-xl font-medium">
            {leverage}x
          </div>
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="space-y-2">
        <Label>Order Type</Label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={orderType === "market" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setOrderType("market")}
            disabled={isExecuting}
          >
            Market Order
          </Button>
          <Button
            type="button"
            variant={orderType === "entry" ? "default" : "outline"}
            className={`flex-1 ${orderType === "entry" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
            onClick={() => setOrderType("entry")}
            disabled={isExecuting}
          >
            Entry Order
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {orderType === "market" 
            ? "Execute immediately at the current market price" 
            : "Set the price at which you want your order to be executed"}
        </p>
      </div>

      {/* Unit Amount */}
      <div className="space-y-2">
        <Label htmlFor="units">Units</Label>
        <Input
          id="units"
          type="number"
          value={units}
          onChange={(e) => setUnits(validateNumericInput(e.target.value))}
          step="0.01"
          min="0.01"
          disabled={isExecuting}
        />
        <div className="text-xs text-muted-foreground">
          <div>Position Value: ${positionValue.toFixed(2)}</div>
          <div>Required Margin: ${requiredFunds.toFixed(2)}</div>
        </div>
      </div>

      {/* Entry Price (for entry orders) */}
      {orderType === "entry" && (
        <div className="space-y-2">
          <Label htmlFor="entry-price">Entry Price</Label>
          <Input
            id="entry-price"
            type="number"
            value={orderRate}
            onChange={(e) => setOrderRate(validateNumericInput(e.target.value))}
            placeholder={`Current: ${currentPrice.toFixed(2)}`}
            step="0.01"
            min="0.01"
            disabled={isExecuting}
          />
          <p className="text-xs text-muted-foreground">
            The price at which your order will be executed
          </p>
        </div>
      )}

      {/* Stop Loss */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="stop-loss">Stop Loss</Label>
          <Switch
            id="stop-loss"
            checked={hasStopLoss}
            onCheckedChange={setHasStopLoss}
            disabled={isExecuting}
          />
        </div>
        {hasStopLoss && (
          <div className="pl-6 space-y-2 border-l-2 border-muted-foreground/20">
            <Label htmlFor="stop-loss-price">Stop Loss Price</Label>
            <Input
              id="stop-loss-price"
              type="number"
              value={stopLossRate}
              onChange={(e) => setStopLossRate(validateNumericInput(e.target.value))}
              placeholder="Set price"
              step="0.01"
              min="0.01"
              disabled={isExecuting}
            />
            <p className="text-xs text-muted-foreground">
              Your position will be closed automatically if price reaches this level
            </p>
          </div>
        )}
      </div>

      {/* Take Profit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="take-profit">Take Profit</Label>
          <Switch
            id="take-profit"
            checked={hasTakeProfit}
            onCheckedChange={setHasTakeProfit}
            disabled={isExecuting}
          />
        </div>
        {hasTakeProfit && (
          <div className="pl-6 space-y-2 border-l-2 border-muted-foreground/20">
            <Label htmlFor="take-profit-price">Take Profit Price</Label>
            <Input
              id="take-profit-price"
              type="number"
              value={takeProfitRate}
              onChange={(e) => setTakeProfitRate(validateNumericInput(e.target.value))}
              placeholder="Set price"
              step="0.01"
              min="0.01"
              disabled={isExecuting}
            />
            <p className="text-xs text-muted-foreground">
              Your position will be closed automatically when this price is reached
            </p>
          </div>
        )}
      </div>

      {/* Expiration Date (for entry orders) */}
      {orderType === "entry" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="expiration">Expiration Date</Label>
            <Switch
              id="expiration"
              checked={hasExpirationDate}
              onCheckedChange={setHasExpirationDate}
              disabled={isExecuting}
            />
          </div>
          {hasExpirationDate && (
            <div className="pl-6 space-y-2 border-l-2 border-muted-foreground/20">
              <Popover>
                <PopoverTrigger asChild>                    <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                    disabled={isExecuting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {hasExpirationDate ? (
                      format(new Date(), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Order will be cancelled if not executed by this date
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
