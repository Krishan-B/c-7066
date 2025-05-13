
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TradeButton } from "@/components/trade";
import OrderTabs from "@/components/orders/OrderTabs";
import { useTradeManagement } from "@/hooks/useTradeManagement";
import { toast } from "sonner";
import { useAccountMetrics } from "@/hooks/useAccountMetrics";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("open");
  const { 
    openPositions, 
    pendingOrders, 
    closedTrades,
    loading, 
    fetchOpenPositions,
    fetchPendingOrders,
    fetchClosedTrades,
    closePosition,
    cancelOrder
  } = useTradeManagement();
  const { metrics, refreshMetrics } = useAccountMetrics();

  const handleRefresh = () => {
    toast.success("Refreshing trade data...");
    fetchOpenPositions();
    fetchPendingOrders();
    fetchClosedTrades();
    refreshMetrics();
  };

  const handleClosePosition = async (tradeId: string, currentPrice: number) => {
    await closePosition(tradeId, currentPrice);
  };

  const handleCancelOrder = async (tradeId: string) => {
    await cancelOrder(tradeId);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-center mb-4">
              You need to sign in to view your orders
            </p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Orders & Positions</h1>
            <p className="text-muted-foreground">
              Manage your CFD trading positions and pending orders
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <TradeButton size="sm" label="New Order" />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Position & Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Passing open positions with the correct prop name based on OrderTabs component */}
            <OrderTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              positions={openPositions}
              orders={pendingOrders}
              history={closedTrades}
              isLoading={loading}
              onClosePosition={handleClosePosition}
              onCancelOrder={handleCancelOrder}
              accountMetrics={metrics}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Orders;
