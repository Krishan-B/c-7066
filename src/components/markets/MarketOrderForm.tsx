import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AdvancedOrderForm,
  AdvancedOrderFormValues,
} from "@/components/trade/AdvancedOrderForm";
import { useMarketData, Asset } from "@/hooks/useMarketData";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import { mockAccountMetrics } from "@/utils/metricUtils";
import { ErrorHandler } from "@/services/errorHandling";

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
    refetchInterval: 60000, // Refresh every minute
  });

  // Available funds from account metrics (would come from a real API in production)
  const availableFunds = mockAccountMetrics.availableFunds;

  // Handle order submission
  const handleOrderSubmit = (
    values: AdvancedOrderFormValues,
    action: "buy" | "sell"
  ) => {
    console.log("Order values:", values, "Action:", action);

    try {
      // In a real app, this would submit the order to an API
      const orderTypeDisplay =
        values.orderType === "market" ? "Market" : "Entry";

      // Success notification with details using ErrorHandler
      ErrorHandler.handleSuccess(
        `${orderTypeDisplay} ${action.toUpperCase()} order placed`,
        {
          description: `${values.units} ${selectedAsset.symbol} at ${values.orderType === "market" ? "market price" : values.orderRate || "custom price"}`,
          action: {
            label: "View Orders",
            onClick: () => {
              // Navigate to orders page or open orders panel
              console.log("Navigate to orders");
            },
          },
        }
      );
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "order_placement_error",
          message: "Failed to place order",
          details: { error, values, action },
          retryable: true,
        }),
        {
          description: `Unable to place ${action} order for ${selectedAsset.symbol}. Please try again.`,
          retryFn: async () => {
            handleOrderSubmit(values, action);
          },
        }
      );
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
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOrderForm;
