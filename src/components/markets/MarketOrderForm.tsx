import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedOrderForm, AdvancedOrderFormValues } from "@/components/trade/AdvancedOrderForm";
import { toast } from "sonner";
import { useCombinedMarketData } from "@/hooks/market";
import { useAccountMetrics } from "@/hooks/useAccountMetrics";
import { useTradeExecution } from "@/hooks/useTradeExecution";

interface MarketOrderFormProps {
  selectedAsset: {
    name: string;
    symbol: string;
    price: number;
  };
}

const MarketOrderForm = ({ selectedAsset }: MarketOrderFormProps) => {
  const [assetCategory, setAssetCategory] = useState<string>("Crypto");
  
  // Fetch market data for the selected category
  const { marketData, isLoading } = useCombinedMarketData([assetCategory], {
    refetchInterval: 60000 // Refresh every minute
  });
  
  // Use real account metrics instead of mock data
  const { metrics, refreshMetrics } = useAccountMetrics();
  const availableFunds = metrics?.availableFunds || 10000;
  
  // Use our new trade execution hook
  const { executeTrade, isExecuting } = useTradeExecution();
  
  // Handle order submission
  const handleOrderSubmit = async (values: AdvancedOrderFormValues, action: "buy" | "sell") => {
    console.log('Order values:', values, 'Action:', action);
    
    // Parse the units as a number
    const units = parseFloat(values.units) || 0;
    
    // Don't allow trades with 0 or negative units
    if (units <= 0) {
      toast.error("Please enter a valid number of units");
      return;
    }
    
    // Calculate entry price for entry orders
    let entryPrice;
    if (values.orderType === "entry") {
      entryPrice = parseFloat(values.orderRate || "0");
      if (!entryPrice || entryPrice <= 0) {
        toast.error("Please enter a valid entry price");
        return;
      }
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
