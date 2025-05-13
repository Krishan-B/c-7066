
import { useState, useEffect } from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import { TradeSlidePanelAssetSelection } from "./TradeSlidePanelAssetSelection";
import { TradeSlidePanelPriceActions } from "./TradeSlidePanelPriceActions";
import { TradeSlidePanelUnitsInput } from "./TradeSlidePanelUnitsInput";
import { TradeSlidePanelOrderTypeSelector } from "./TradeSlidePanelOrderTypeSelector";
import { TradeSlidePanelEntryRate } from "./TradeSlidePanelEntryRate";
import { TradeSlidePanelOptionCheckbox } from "./TradeSlidePanelOptionCheckbox";
import { TradeSlidePanelSummary } from "./TradeSlidePanelSummary";
import { StopLossCheckbox } from "./StopLossCheckbox";
import { TakeProfitCheckbox } from "./TakeProfitCheckbox";
import { isMarketOpen } from "@/utils/marketHours";
import { getLeverageForAssetType } from "@/utils/leverageUtils";
import { mockAccountMetrics } from "@/utils/metricUtils";

interface TradeMainContentProps {
  assetCategory: string;
  onAssetCategoryChange: (category: string) => void;
  selectedAsset: { name: string; symbol: string; market_type: string };
  onAssetSelect: (symbol: string) => void;
  orderType: "market" | "entry";
  setOrderType: (type: "market" | "entry") => void;
  units: string;
  setUnits: (value: string) => void;
  onExecuteTrade: (action: "buy" | "sell") => void;
  isExecuting: boolean;
  tradeAction: "buy" | "sell";
  hasStopLoss: boolean;
  setHasStopLoss: (value: boolean) => void;
  hasTakeProfit: boolean;
  setHasTakeProfit: (value: boolean) => void;
  hasExpirationDate: boolean;
  setHasExpirationDate: (value: boolean) => void;
  orderRate: string;
  setOrderRate: (value: string) => void;
}

export const TradeMainContent = ({
  assetCategory,
  onAssetCategoryChange,
  selectedAsset,
  onAssetSelect,
  orderType,
  setOrderType,
  units,
  setUnits,
  onExecuteTrade,
  isExecuting,
  tradeAction,
  hasStopLoss,
  setHasStopLoss,
  hasTakeProfit,
  setHasTakeProfit,
  hasExpirationDate,
  setHasExpirationDate,
  orderRate,
  setOrderRate,
}: TradeMainContentProps) => {
  // Use the combined market data hook for the selected category
  const { marketData, isLoading, refetch } = useCombinedMarketData(
    [assetCategory], 
    { refetchInterval: 1000 * 10 }
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
  }, [currentPrice, setOrderRate]);
  
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

  return (
    <div className="space-y-4">
      {/* Asset Selection */}
      <TradeSlidePanelAssetSelection 
        assetCategory={assetCategory}
        onAssetCategoryChange={onAssetCategoryChange}
        selectedAsset={selectedAsset.symbol}
        onAssetSelect={onAssetSelect}
        isLoading={isLoading}
        isExecuting={isExecuting}
        marketData={marketData}
      />
      
      {/* Real-time prices with Buy/Sell buttons */}
      <TradeSlidePanelPriceActions
        buyPrice={buyPrice}
        sellPrice={sellPrice}
        onExecuteTrade={onExecuteTrade}
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
  );
};
