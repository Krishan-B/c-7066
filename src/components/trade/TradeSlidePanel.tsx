import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { ErrorHandler } from "@/services/errorHandling";
import { isMarketOpen } from "@/utils/marketHours";
import { useAuth } from "@/hooks/useAuth";
import { getLeverageForAssetType } from "@/utils/leverageUtils";
import { mockAccountMetrics } from "@/utils/metricUtils";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";

// Import the new component files
import { TradeSlidePanelAssetSelection } from "./TradeSlidePanelAssetSelection";
import { TradeSlidePanelPriceActions } from "./TradeSlidePanelPriceActions";
import { TradeSlidePanelUnitsInput } from "./TradeSlidePanelUnitsInput";
import { TradeSlidePanelOrderTypeSelector } from "./TradeSlidePanelOrderTypeSelector";
import { TradeSlidePanelEntryRate } from "./TradeSlidePanelEntryRate";
import { TradeSlidePanelOptionCheckbox } from "./TradeSlidePanelOptionCheckbox";
import { TradeSlidePanelSummary } from "./TradeSlidePanelSummary";
import { StopLossCheckbox } from "./StopLossCheckbox";
import { TakeProfitCheckbox } from "./TakeProfitCheckbox";

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
    market_type: "Crypto",
  });
  const [orderType, setOrderType] = useState<"market" | "entry">("market");
  const [units, setUnits] = useState("0.01");
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasStopLoss, setHasStopLoss] = useState(false);
  const [hasTakeProfit, setHasTakeProfit] = useState(false);
  const [hasExpirationDate, setHasExpirationDate] = useState(false);
  const [orderRate, setOrderRate] = useState("");

  // Use the combined market data hook for the selected category
  const { marketData, isLoading, refetch } = useCombinedMarketData(
    [assetCategory],
    { refetchInterval: 1000 * 10 }
  );

  // Find current price in market data
  const currentAssetData = marketData.find(
    (item) => item.symbol === selectedAsset.symbol
  );
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
    const assetsInCategory = marketData.filter(
      (asset) => asset.market_type === category
    );
    if (assetsInCategory.length > 0) {
      setSelectedAsset({
        name: assetsInCategory[0].name,
        symbol: assetsInCategory[0].symbol,
        market_type: category,
      });
    }
  };

  // Handle asset selection
  const handleAssetSelect = (symbol: string) => {
    const asset = marketData.find((a) => a.symbol === symbol);
    if (asset) {
      setSelectedAsset({
        name: asset.name,
        symbol: asset.symbol,
        market_type: asset.market_type,
      });
    }
  };

  // Handle order execution
  const handleExecuteTrade = async (action: "buy" | "sell") => {
    if (!marketIsOpen && orderType === "market") {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "market_closed",
          message:
            "The market is currently closed. Please try again during market hours or use an entry order.",
        })
      );
      return;
    }

    if (!user) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "authentication_error",
          message: "Please sign in to execute trades.",
        })
      );
      return;
    }

    if (!canAfford && action === "buy") {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "insufficient_funds",
          message: "You do not have enough funds to execute this trade.",
        })
      );
      return;
    }

    setIsExecuting(true);
    setTradeAction(action);

    try {
      // Simulate network delay for trade execution (0.5 - 1.5 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

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
        ErrorHandler.handleSuccess(
          `Position Opened: ${action.toUpperCase()} ${selectedAsset.symbol}`,
          {
            description: `${action.toUpperCase()} order for ${parsedUnits} ${selectedAsset.symbol} at ${action === "buy" ? "$" + buyPrice.toFixed(4) : "$" + sellPrice.toFixed(4)} executed successfully.`,
          }
        );
      } else {
        ErrorHandler.handleSuccess(
          `Entry Order Placed: ${action.toUpperCase()} ${selectedAsset.symbol}`,
          {
            description: `${action.toUpperCase()} entry order for ${parsedUnits} ${selectedAsset.symbol} at $${orderRate} has been placed.`,
          }
        );
      }

      // Close the panel after successful execution
      setTimeout(() => onOpenChange(false), 1500);
    } catch (error) {
      console.error("Trade execution error:", error);
      ErrorHandler.handleError(error, {
        description:
          "There was an error executing your trade. Please try again.",
        retryFn: async () => handleExecuteTrade(action),
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
          <TradeSlidePanelAssetSelection
            assetCategory={assetCategory}
            onAssetCategoryChange={handleAssetCategoryChange}
            selectedAsset={selectedAsset.symbol}
            onAssetSelect={handleAssetSelect}
            isLoading={isLoading}
            isExecuting={isExecuting}
            marketData={marketData}
          />

          {/* Real-time prices with Buy/Sell buttons */}
          <TradeSlidePanelPriceActions
            buyPrice={buyPrice}
            sellPrice={sellPrice}
            onExecuteTrade={handleExecuteTrade}
            isExecuting={isExecuting}
            tradeAction={tradeAction}
            marketIsOpen={marketIsOpen}
            orderType={orderType}
            canAfford={canAfford}
            parsedUnits={parsedUnits}
          />

          {/* Units Input */}
          <TradeSlidePanelUnitsInput
            units={units}
            setUnits={setUnits}
            isExecuting={isExecuting}
            marginRequirement={marginRequirement}
            canAfford={canAfford}
            availableFunds={availableFunds}
          />

          {/* Order Type Selection */}
          <TradeSlidePanelOrderTypeSelector
            orderType={orderType}
            setOrderType={setOrderType}
            isExecuting={isExecuting}
          />

          {/* Entry Order Rate (only for entry orders) */}
          {orderType === "entry" && (
            <TradeSlidePanelEntryRate
              orderRate={orderRate}
              setOrderRate={setOrderRate}
              currentPrice={currentPrice}
              isExecuting={isExecuting}
            />
          )}

          {/* Stop Loss Checkbox */}
          <StopLossCheckbox
            hasStopLoss={hasStopLoss}
            setHasStopLoss={setHasStopLoss}
            isExecuting={isExecuting}
          />

          {/* Take Profit Checkbox */}
          <TakeProfitCheckbox
            hasTakeProfit={hasTakeProfit}
            setHasTakeProfit={setHasTakeProfit}
            isExecuting={isExecuting}
          />

          {/* Expiration Date Checkbox (only for entry orders) */}
          {orderType === "entry" && (
            <TradeSlidePanelOptionCheckbox
              id="expirationDate"
              label="Expiration Date"
              checked={hasExpirationDate}
              onCheckedChange={() => setHasExpirationDate(!hasExpirationDate)}
              tooltip="Set a date when your entry order should expire if not executed."
              disabled={isExecuting}
            />
          )}

          {/* Trade Summary */}
          <TradeSlidePanelSummary
            positionValue={positionValue}
            marginRequirement={marginRequirement}
            fee={fee}
            totalCost={totalCost}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
