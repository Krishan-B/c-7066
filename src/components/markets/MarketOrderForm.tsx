
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedOrderForm, AdvancedOrderFormValues } from "@/components/trade/AdvancedOrderForm";
import { toast } from "sonner";

interface MarketOrderFormProps {
  selectedAsset: {
    name: string;
    symbol: string;
    price: number;
  };
}

const MarketOrderForm = ({ selectedAsset }: MarketOrderFormProps) => {
  // Handle order submission
  const handleOrderSubmit = (values: AdvancedOrderFormValues, action: "buy" | "sell") => {
    console.log('Order values:', values, 'Action:', action);
    
    // In a real app, this would submit the order to an API
    const orderTypeDisplay = values.orderType === "market" ? "Market" : "Entry";
    
    // Using sonner toast for transactional notifications
    toast(`${orderTypeDisplay} ${action.toUpperCase()} order for ${selectedAsset.symbol} created successfully`, {
      description: `Order type: ${orderTypeDisplay}, Stop Loss: ${values.stopLoss ? 'Yes' : 'No'}, Take Profit: ${values.takeProfit ? 'Yes' : 'No'}`,
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
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOrderForm;
