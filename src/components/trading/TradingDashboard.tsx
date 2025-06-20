
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw } from 'lucide-react';
import { useTradingEngine } from '@/hooks/useTradingEngine';
import AccountMetricsDisplay from './AccountMetricsDisplay';
import PositionsTable from './PositionsTable';
import OrdersTable from './OrdersTable';
import TradingPanel from './TradingPanel';
import type { Asset } from '@/hooks/useMarketData';

interface TradingDashboardProps {
  selectedAsset?: Asset;
}

const TradingDashboard = ({ selectedAsset }: TradingDashboardProps) => {
  const { accountMetrics, openPositions, pendingOrders, isLoading, refreshData } = useTradingEngine();
  const [isTradingPanelOpen, setIsTradingPanelOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Account Metrics */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trading Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsTradingPanelOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>

      <AccountMetricsDisplay metrics={accountMetrics} isLoading={isLoading} />

      {/* Trading Tables */}
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="positions" className="flex items-center gap-2">
            Open Positions
            {openPositions.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {openPositions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            Pending Orders
            {pendingOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="positions">
          <PositionsTable 
            positions={openPositions} 
            isLoading={isLoading}
            onRefresh={refreshData}
          />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersTable 
            orders={pendingOrders} 
            isLoading={isLoading}
            onRefresh={refreshData}
          />
        </TabsContent>
      </Tabs>

      {/* Trading Panel */}
      <TradingPanel
        isOpen={isTradingPanelOpen}
        onClose={() => setIsTradingPanelOpen(false)}
        selectedAsset={selectedAsset}
        availableFunds={accountMetrics?.available_funds || 0}
      />
    </div>
  );
};

export default TradingDashboard;
