
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedOrderForm, AdvancedOrderFormValues } from "@/components/trade/AdvancedOrderForm";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import { useAccountMetrics } from "@/hooks/useAccountMetrics";
import { useTradeExecution } from "@/hooks/useTradeExecution";
import { validateTradeWithErrorHandling } from "@/services/trades/validation/tradeValidation";
import { isMarketOpen } from "@/utils/marketHours";
import { useAuth } from "@/hooks/useAuth";

interface MarketOrderFormProps {
  selectedAsset: {
    name: string;
    symbol: string;
    price: number;
    market_type?: string;
  };
}

const MarketOrderForm = ({ selectedAsset }: MarketOrderFormProps) => {
  const [assetCategory, setAssetCategory] = useState<string>(selectedAsset.market_type || "Crypto");
  const { user } = useAuth();
  
  // Update asset category when selected asset changes
  useEffect(() => {
    if (selectedAsset.market_type) {
      setAssetCategory(selectedAsset.market_type);
    }
  }, [selectedAsset]);
  
  // Fetch market data for the selected category
  const { marketData, isLoading } = useCombinedMarketData([assetCategory], {
    refetchInterval: 60000 // Refresh every minute
  });
  
  // Use real account metrics
  const { metrics, refreshMetrics } = useAccountMetrics();
  const availableFunds = metrics?.availableFunds || 10000;
  
  // Use our enhanced trade execution hook
  const { executeTrade, isExecuting } = useTradeExecution();
  
  // Check if market is open
  const marketOpenStatus = isMarketOpen(assetCategory);
  
  // Handle order submission with validation
  const handleOrderSubmit = async (values: AdvancedOrderFormValues, action: "buy" | "sell") => {
    console.log('Order values:', values, 'Action:', action);
    
    // Parse the units as a number
    const units = parseFloat(values.units) || 0;
    
    // Calculate entry price for entry orders
    let entryPrice;
    if (values.orderType === "entry") {
      entryPrice = parseFloat(values.orderRate || "0");
    }
    
    // Validate the trade
    const isValid = validateTradeWithErrorHandling({
      userId: user?.id,
      symbol: selectedAsset.symbol,
      units,
      price: selectedAsset.price,
      direction: action,
      orderType: values.orderType,
      entryPrice,
      availableFunds,
      marketOpen: values.orderType === 'entry' ? true : marketOpenStatus
    });
    
    if (!isValid) {
      return;
    }
    
    // Calculate stop loss and take profit prices if enabled
    let stopLoss;
    let takeProfit;
    
    if (values.stopLoss && values.stopLossRate) {
      stopLoss = parseFloat(values.stopLossRate);
    }
    
    if (values.takeProfit && values.takeProfitRate) {
      takeProfit = parseFloat(values.takeProfitRate);
    }
    
    // Calculate expiration date for entry orders
    let expiration;
    if (values.orderType === "entry" && values.expirationDate && 
        values.expirationDay && values.expirationMonth && values.expirationYear) {
      const day = parseInt(values.expirationDay);
      const month = parseInt(values.expirationMonth) - 1; // JS months are 0-indexed
      const year = parseInt(values.expirationYear);
      expiration = new Date(year, month, day).toISOString();
    }
    
    // Execute the trade
    const result = await executeTrade({
      symbol: selectedAsset.symbol,
      assetCategory: values.assetCategory || assetCategory,
      direction: action,
      orderType: values.orderType,
      units: units,
      currentPrice: selectedAsset.price,
      entryPrice,
      stopLoss,
      takeProfit,
      expiration
    });
    
    if (result.success) {
      // Refresh account metrics after successful trade
      refreshMetrics();
    }
  };

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade {selectedAsset.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdvancedOrderForm
            currentPrice={selectedAsset.price}
            symbol={selectedAsset.symbol}
            onOrderSubmit={handleOrderSubmit}
            availableFunds={availableFunds}
            assetCategory={assetCategory}
            onAssetCategoryChange={setAssetCategory}
            marketData={marketData}
            isLoading={isLoading || isExecuting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOrderForm;
