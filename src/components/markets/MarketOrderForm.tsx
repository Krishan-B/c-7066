
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedOrderForm, AdvancedOrderFormValues } from "@/components/trade/AdvancedOrderForm";
import { toast } from "sonner";
import { useMarketData, Asset } from "@/hooks/useMarketData";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import { mockAccountMetrics } from "@/utils/metricUtils";

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
  
  // Available funds from account metrics (would come from a real API in production)
  const availableFunds = mockAccountMetrics.availableFunds;
  
  // Handle order submission
  const handleOrderSubmit = (values: AdvancedOrderFormValues, action: "buy" | "sell") => {
    console.log('Order values:', values, 'Action:', action);
    
    // In a real app, this would submit the order to an API
    const orderTypeDisplay = values.orderType === "market" ? "Market" : "Entry";
    
    // Using sonner toast for transactional notifications
    toast(`${orderTypeDisplay} ${action.toUpperCase()} order for ${selectedAsset.symbol} created successfully`, {
      description: `Order type: ${orderTypeDisplay}, Units: ${values.units}, Stop Loss: ${values.stopLoss ? 'Yes' : 'No'}, Take Profit: ${values.takeProfit ? 'Yes' : 'No'}`,
    });
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
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOrderForm;
