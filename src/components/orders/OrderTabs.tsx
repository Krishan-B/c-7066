import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OpenPositionsTable from "./OpenPositionsTable";
import PendingOrdersTable from "./PendingOrdersTable";
import ClosedTradesTable from "./ClosedTradesTable";
import OrderHistoryTable from "./OrderHistoryTable";
import {
  AdvancedOrderForm,
  AdvancedOrderFormValues,
} from "@/components/trade/AdvancedOrderForm";
import {
  openTrades,
  pendingOrders,
  closedTrades,
  ordersHistory,
} from "./mockData";
import { ErrorHandler } from "@/services/errorHandling";

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, onTabChange }) => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [currentPrice, setCurrentPrice] = useState(67432.21);

  const handleCloseTrade = async (tradeId: string) => {
    try {
      // In a real app, this would call an API to close the trade
      // Mock successful API call
      ErrorHandler.handleSuccess(`Trade ${tradeId} closed successfully`);
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: `Failed to close trade ${tradeId}`,
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      // In a real app, this would call an API to cancel the pending order
      // Mock successful API call
      ErrorHandler.handleSuccess(`Order ${orderId} cancelled successfully`);
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: `Failed to cancel order ${orderId}`,
      });
    }
  };

  // Handle order submission
  const handleOrderSubmit = async (
    values: AdvancedOrderFormValues,
    action: "buy" | "sell"
  ) => {
    try {
      console.log("Order values:", values, "Action:", action);

      // In a real app, this would submit the order to an API
      const orderTypeDisplay =
        values.orderType === "market" ? "Market" : "Entry";

      // Mock successful API call
      ErrorHandler.handleSuccess(
        `${orderTypeDisplay} ${action.toUpperCase()} order for ${selectedSymbol} created successfully`,
        {
          description: `Order type: ${orderTypeDisplay}, Stop Loss: ${values.stopLoss ? "Yes" : "No"}, Take Profit: ${values.takeProfit ? "Yes" : "No"}`,
        }
      );
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: "Failed to submit order",
        retryFn: async () => handleOrderSubmit(values, action),
      });
    }
  };

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={onTabChange}
    >
      <TabsList className="mb-4 grid grid-cols-4 w-full md:w-auto">
        <TabsTrigger value="open">Open Positions</TabsTrigger>
        <TabsTrigger value="pending">Pending Orders</TabsTrigger>
        <TabsTrigger value="closed">Closed Positions</TabsTrigger>
        <TabsTrigger value="history">Orders History</TabsTrigger>
      </TabsList>

      <TabsContent value="open">
        <OpenPositionsTable
          openTrades={openTrades}
          onCloseTrade={handleCloseTrade}
        />
      </TabsContent>

      <TabsContent value="pending">
        <PendingOrdersTable
          pendingOrders={pendingOrders}
          onCancelOrder={handleCancelOrder}
        />

        {/* Advanced Order Form */}
        <div className="mt-6">
          <AdvancedOrderForm
            currentPrice={currentPrice}
            symbol={selectedSymbol}
            onOrderSubmit={handleOrderSubmit}
          />
        </div>
      </TabsContent>

      <TabsContent value="closed">
        <ClosedTradesTable closedTrades={closedTrades} />
      </TabsContent>

      <TabsContent value="history">
        <OrderHistoryTable ordersHistory={ordersHistory} />
      </TabsContent>
    </Tabs>
  );
};

export default OrderTabs;
