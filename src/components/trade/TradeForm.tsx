
import { useState, useEffect } from "react";
import { Asset } from "@/hooks/useMarketData";
import { OrderTypeSelector } from "@/components/trade";
import { TradeSummary } from "@/components/trade";
import { AssetCategorySelector } from "./AssetCategorySelector";
import { AssetSelector } from "./AssetSelector";
import { UnitsInput } from "./UnitsInput";
import { StopLossCheckbox } from "./StopLossCheckbox";
import { TakeProfitCheckbox } from "./TakeProfitCheckbox";
import { TradeActionButton } from "./TradeActionButton";
import { EntryRateInput } from "./EntryRateInput";
import { StopLossSettings } from "./StopLossSettings";
import { TakeProfitSettings } from "./TakeProfitSettings";
import { usePriceMovement } from "@/hooks/usePriceMovement";
import { useTradeCalculations } from "@/hooks/useTradeCalculations";

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
  
  // Use our custom hooks
  const { buyPrice, sellPrice } = usePriceMovement(currentPrice);
  
  // Filter assets based on selected category
  const filteredAssets = marketData?.filter(a => a.market_type === assetCategory) || [];
  
  // Use the trade calculations hook with proper parameters
  const tradeCalculations = useTradeCalculations(units, currentPrice, assetCategory, availableFunds);
  
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
    onSubmit(units, orderType, [tradeCalculations.leverage]);
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
        requiredFunds={tradeCalculations.requiredFunds}
        canAfford={tradeCalculations.canAfford}
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
        <EntryRateInput currentPrice={currentPrice} />
      )}
      
      {/* Stop Loss Checkbox */}
      <StopLossCheckbox
        hasStopLoss={hasStopLoss}
        setHasStopLoss={setHasStopLoss}
        isExecuting={isExecuting}
      />
      
      {/* Stop Loss Settings */}
      {hasStopLoss && <StopLossSettings currentPrice={currentPrice} />}
      
      {/* Take Profit Checkbox */}
      <TakeProfitCheckbox
        hasTakeProfit={hasTakeProfit}
        setHasTakeProfit={setHasTakeProfit}
        isExecuting={isExecuting}
      />
      
      {/* Take Profit Settings */}
      {hasTakeProfit && <TakeProfitSettings currentPrice={currentPrice} />}
      
      {/* Trade Summary */}
      <TradeSummary
        currentPrice={currentPrice}
        parsedAmount={tradeCalculations.requiredFunds}
        fee={tradeCalculations.fee}
        total={tradeCalculations.total}
        isLoading={isLoading}
      />
      
      {/* Trade Action Button */}
      <TradeActionButton
        action={action}
        selectedAsset={selectedAsset}
        isExecuting={isExecuting}
        marketIsOpen={marketIsOpen}
        parsedUnits={tradeCalculations.parsedUnits}
        canAfford={tradeCalculations.canAfford}
        buyPrice={buyPrice}
        sellPrice={sellPrice}
      />
    </form>
  );
};

export default TradeForm;
