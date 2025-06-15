import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpenPositionsTable from './OpenPositionsTable';
import PendingOrdersTable from './PendingOrdersTable';
import ClosedTradesTable from './ClosedTradesTable';
import OrderHistoryTable from './OrderHistoryTable';
import { AdvancedOrderForm } from '@/components/trade/AdvancedOrderForm';
import type { AdvancedOrderFormValues } from '@/components/trade/AdvancedOrderForm';
import { toast } from 'sonner';
import type { OrderTabsProps } from './OrderTabs.d';
import { useTradeExecution } from '@/hooks/trades/useTradeExecution';
import { useCombinedMarketData } from '@/hooks/market';
import type { MarketType } from '@/hooks/market';

const OrderTabs: React.FC<OrderTabsProps> = ({
  activeTab,
  onTabChange,
  positions,
  orders,
  history,
  isLoading,
  onClosePosition,
  onCancelOrder,
  accountMetrics,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [assetCategory, setAssetCategory] = useState<MarketType>('Crypto');

  // Fetch real-time market data
  const { marketData, isLoading: isLoadingMarketData } = useCombinedMarketData(
    [assetCategory],
    { refetchInterval: 30000 } // 30 seconds
  );

  // Get current price for selected symbol
  const currentAsset = marketData.find((asset) => asset.symbol === selectedSymbol);
  const currentPrice = currentAsset?.price || 67432.21;

  // Use our trade execution hook
  const { executeTrade, isExecuting } = useTradeExecution();

  // Handle asset category change with type safety
  const handleAssetCategoryChange = (category: string) => {
    // Validate that the category is a valid MarketType
    if (
      category === 'Crypto' ||
      category === 'Stock' ||
      category === 'Forex' ||
      category === 'Index' ||
      category === 'Commodities'
    ) {
      setAssetCategory(category);

      // Select the first asset in this category
      const assetsInCategory = marketData.filter((asset) => asset.market_type === category);
      const firstAsset = assetsInCategory[0];
      if (firstAsset?.symbol) {
        setSelectedSymbol(firstAsset.symbol);
      }
    }
  };

  // Handle order submission
  const handleOrderSubmit = async (values: AdvancedOrderFormValues, action: 'buy' | 'sell') => {
    console.warn('Order values:', values, 'Action:', action);

    // Parse the units as a number
    const units = parseFloat(values.units) || 0;

    // Don't allow trades with 0 or negative units
    if (units <= 0) {
      toast.error('Please enter a valid number of units');
      return;
    }

    // Calculate entry price for entry orders
    let entryPrice;
    if (values.orderType === 'entry') {
      entryPrice = parseFloat(values.orderRate || '0');
      if (!entryPrice || entryPrice <= 0) {
        toast.error('Please enter a valid entry price');
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
    if (
      values.orderType === 'entry' &&
      values.expirationDate &&
      values.expirationDay &&
      values.expirationMonth &&
      values.expirationYear
    ) {
      const day = parseInt(values.expirationDay);
      const month = parseInt(values.expirationMonth) - 1; // JS months are 0-indexed
      const year = parseInt(values.expirationYear);
      expiration = new Date(year, month, day).toISOString();
    }

    // Execute the trade
    await executeTrade({
      symbol: selectedSymbol,
      assetCategory: values.assetCategory || assetCategory,
      direction: action,
      orderType: values.orderType,
      units: units,
      currentPrice: currentPrice,
      entryPrice,
      stopLoss,
      takeProfit,
      expiration,
    });
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
            availableFunds={accountMetrics?.availableFunds || 0}
            assetCategory={assetCategory}
            onAssetCategoryChange={handleAssetCategoryChange}
            marketData={marketData}
            isLoading={isLoadingMarketData || isExecuting}
          />
        </div>
      </TabsContent>

      <TabsContent value="closed">
        <ClosedTradesTable closedTrades={history} isLoading={isLoading.closed} />
      </TabsContent>

      <TabsContent value="history">
        <OrderHistoryTable ordersHistory={history} />
      </TabsContent>
    </Tabs>
  );
};

export default OrderTabs;
