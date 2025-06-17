import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import OrderTabs from '@/components/orders/OrderTabs';
import { TradeButton } from '@/components/trade';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';
import { useAccountMetrics } from '@/hooks/portfolio/useAccountMetrics';
import { useTradeManagement } from '@/hooks/trades/useTradeManagement';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('open');
  const {
    openPositions,
    pendingOrders,
    closedTrades,
    loading,
    fetchOpenPositions,
    fetchPendingOrders,
    fetchClosedTrades,
    closePosition,
    cancelOrder,
  } = useTradeManagement();
  const { metrics, refreshMetrics } = useAccountMetrics();

  const handleRefresh = () => {
    toast.success('Refreshing trade data...');
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
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4 text-center">You need to sign in to view your orders</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Orders & Positions</h1>
            <p className="text-muted-foreground">
              Manage your CFD trading positions and pending orders
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
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
