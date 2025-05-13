
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OpenPositionsTable from "./OpenPositionsTable";
import PendingOrdersTable from "./PendingOrdersTable";
import ClosedTradesTable from "./ClosedTradesTable";
import OrderHistoryTable from "./OrderHistoryTable";
import { AdvancedOrderForm, AdvancedOrderFormValues } from "@/components/trade/AdvancedOrderForm";
import { toast } from "sonner";
import { AccountMetrics } from "@/types/account";
import { Trade } from "@/hooks/useTradeManagement";
import { OrderTabsProps } from "./OrderTabs.d";

const OrderTabs: React.FC<OrderTabsProps> = ({ 
  activeTab, 
  onTabChange,
  positions,
  orders,
  history,
  isLoading,
  onClosePosition,
  onCancelOrder,
  accountMetrics
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [currentPrice, setCurrentPrice] = useState(67432.21);

  // Handle order submission
  const handleOrderSubmit = (values: AdvancedOrderFormValues, action: "buy" | "sell") => {
    console.log('Order values:', values, 'Action:', action);
    
    // In a real app, this would submit the order to an API
    const orderTypeDisplay = values.orderType === "market" ? "Market" : "Entry";
    
    toast.success(
      `${orderTypeDisplay} ${action.toUpperCase()} order for ${selectedSymbol} created successfully`, 
      { 
        description: `Order type: ${orderTypeDisplay}, Stop Loss: ${values.stopLoss ? 'Yes' : 'No'}, Take Profit: ${values.takeProfit ? 'Yes' : 'No'}` 
      }
    );
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4 grid grid-cols-4 w-full md:w-auto">
        <TabsTrigger value="open">Open Positions</TabsTrigger>
        <TabsTrigger value="pending">Pending Orders</TabsTrigger>
        <TabsTrigger value="closed">Closed Positions</TabsTrigger>
        <TabsTrigger value="history">Orders History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="open">
        <OpenPositionsTable
          openTrades={positions}
          onCloseTrade={onClosePosition}
          isLoading={isLoading.open}
        />
      </TabsContent>
      
      <TabsContent value="pending">
        <PendingOrdersTable
          pendingOrders={orders}
          onCancelOrder={onCancelOrder}
          isLoading={isLoading.pending}
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
        <ClosedTradesTable 
          closedTrades={history}
          isLoading={isLoading.closed} 
        />
      </TabsContent>
      
      <TabsContent value="history">
        <OrderHistoryTable ordersHistory={history} />
      </TabsContent>
    </Tabs>
  );
};

export default OrderTabs;
