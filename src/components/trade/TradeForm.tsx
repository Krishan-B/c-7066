
import { useState } from "react";
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
      />
    </form>
  );
};

export default TradeForm;
