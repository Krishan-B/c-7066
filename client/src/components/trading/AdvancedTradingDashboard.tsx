/**
 * Advanced Trading Dashboard Component
 * Comprehensive trading interface using the new trading engine
 * Date: June 19, 2025
 */

import React, { useEffect, useState } from 'react';
import { YahooFinanceService } from '@/services/market/yahooFinanceService';
import { TradingEngineService } from '@/services/trading/tradingEngine';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAccountMonitor,
  usePositionManager,
  useQuickTrade,
  useTradingEngine,
} from '@/hooks/trading/useTradingEngine';

interface TradingDashboardProps {
  selectedAsset?: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    assetClass: 'FOREX' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES';
  };
}

export function AdvancedTradingDashboard({ selectedAsset }: TradingDashboardProps) {
  const { positions, accountMetrics, loading, error, refreshAll } = useTradingEngine();

  const { executeMarketOrder, isExecuting } = useQuickTrade();
  const { closeAllPositions, isClosing } = usePositionManager();
  const { isMarginCall, getMarginUtilization, canPlaceTrade } = useAccountMonitor();

  // Trading form state
  const [tradeForm, setTradeForm] = useState({
    units: 1,
    stopLoss: '',
    takeProfit: '',
    orderType: 'market' as 'market' | 'limit' | 'stop',
    limitPrice: '',
  });

  // Margin calculation state
  const [marginCalc, setMarginCalc] = useState<any>(null);

  // Calculate margin when form changes
  useEffect(() => {
    if (selectedAsset && tradeForm.units > 0) {
      const price =
        tradeForm.orderType === 'limit' && tradeForm.limitPrice
          ? parseFloat(tradeForm.limitPrice)
          : selectedAsset.price;

      if (price > 0) {
        TradingEngineService.calculateMargin(selectedAsset.assetClass, tradeForm.units, price)
          .then(setMarginCalc)
          .catch(console.error);
      }
    }
  }, [selectedAsset, tradeForm.units, tradeForm.orderType, tradeForm.limitPrice]);

  // Handle order execution
  const handleExecuteOrder = async (direction: 'buy' | 'sell') => {
    if (!selectedAsset || !marginCalc) return;

    const price =
      tradeForm.orderType === 'limit' && tradeForm.limitPrice
        ? parseFloat(tradeForm.limitPrice)
        : selectedAsset.price;

    const stopLoss = tradeForm.stopLoss ? parseFloat(tradeForm.stopLoss) : undefined;
    const takeProfit = tradeForm.takeProfit ? parseFloat(tradeForm.takeProfit) : undefined;

    if (tradeForm.orderType === 'market') {
      await executeMarketOrder(
        selectedAsset.symbol,
        selectedAsset.assetClass,
        direction,
        tradeForm.units,
        price,
        stopLoss,
        takeProfit
      );
    } else {
      // For limit/stop orders, use the trading engine service directly
      const result = await TradingEngineService.placeOrder({
        symbol: selectedAsset.symbol,
        assetClass: selectedAsset.assetClass,
        orderType: tradeForm.orderType,
        direction,
        units: tradeForm.units,
        price,
        stopLoss,
        takeProfit,
      });

      console.log('Order result:', result);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => TradingEngineService.formatCurrency(value);
  const formatPercentage = (value: number) => TradingEngineService.formatPercentage(value);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Account Overview */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Account Overview
            {isMarginCall && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Margin Call
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.account ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-muted h-20 animate-pulse rounded" />
              ))}
            </div>
          ) : accountMetrics ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(accountMetrics.balance)}</div>
                  <div className="text-muted-foreground text-sm">Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(accountMetrics.equity)}</div>
                  <div className="text-muted-foreground text-sm">Equity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountMetrics.usedMargin)}
                  </div>
                  <div className="text-muted-foreground text-sm">Used Margin</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountMetrics.freeMargin)}
                  </div>
                  <div className="text-muted-foreground text-sm">Free Margin</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${accountMetrics.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(accountMetrics.unrealizedPnl)}
                  </div>
                  <div className="text-muted-foreground text-sm">Unrealized P&L</div>
                </div>
              </div>

              {/* Margin Level Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Margin Level</span>
                  <span className={accountMetrics.marginLevel <= 1 ? 'font-bold text-red-600' : ''}>
                    {accountMetrics.marginLevel.toFixed(2)}%
                  </span>
                </div>
                <Progress value={Math.min(accountMetrics.marginLevel, 100)} className="h-2" />
                {accountMetrics.marginLevel <= 1 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Margin call triggered! Please close positions or add funds.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Trading Panel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedAsset ? `Trade ${selectedAsset.symbol}` : 'Select an Asset to Trade'}
          </CardTitle>
          {selectedAsset && (
            <CardDescription>
              Current Price: {formatCurrency(selectedAsset.price)}
              <span
                className={`ml-2 ${selectedAsset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {selectedAsset.change >= 0 ? '+' : ''}
                {selectedAsset.change.toFixed(4)}({formatPercentage(selectedAsset.changePercent)})
              </span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {selectedAsset ? (
            <Tabs defaultValue="market" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="limit">Limit</TabsTrigger>
                <TabsTrigger value="stop">Stop</TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="units">Units</Label>
                    <Input
                      id="units"
                      type="number"
                      value={tradeForm.units}
                      onChange={(e) =>
                        setTradeForm((prev) => ({
                          ...prev,
                          units: parseFloat(e.target.value) || 0,
                        }))
                      }
                      step="0.001"
                      min="0.001"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stopLoss">Stop Loss</Label>
                      <Input
                        id="stopLoss"
                        type="number"
                        value={tradeForm.stopLoss}
                        onChange={(e) =>
                          setTradeForm((prev) => ({ ...prev, stopLoss: e.target.value }))
                        }
                        placeholder="Optional"
                        step="0.0001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="takeProfit">Take Profit</Label>
                      <Input
                        id="takeProfit"
                        type="number"
                        value={tradeForm.takeProfit}
                        onChange={(e) =>
                          setTradeForm((prev) => ({ ...prev, takeProfit: e.target.value }))
                        }
                        placeholder="Optional"
                        step="0.0001"
                      />
                    </div>
                  </div>

                  {marginCalc && (
                    <div className="bg-muted space-y-2 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span>Position Value:</span>
                        <span className="font-medium">
                          {formatCurrency(marginCalc.positionValue)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Required Margin:</span>
                        <span className="font-medium">
                          {formatCurrency(marginCalc.requiredMargin)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Leverage:</span>
                        <span className="font-medium">1:{marginCalc.leverage}</span>
                      </div>
                      {!canPlaceTrade(marginCalc.requiredMargin) && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Insufficient margin to place this trade
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleExecuteOrder('buy')}
                      disabled={
                        isExecuting ||
                        !marginCalc ||
                        !canPlaceTrade(marginCalc?.requiredMargin || 0)
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {isExecuting ? 'Executing...' : 'Buy'}
                    </Button>
                    <Button
                      onClick={() => handleExecuteOrder('sell')}
                      disabled={
                        isExecuting ||
                        !marginCalc ||
                        !canPlaceTrade(marginCalc?.requiredMargin || 0)
                      }
                      variant="destructive"
                    >
                      <TrendingDown className="mr-2 h-4 w-4" />
                      {isExecuting ? 'Executing...' : 'Sell'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="limit" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="limitPrice">Limit Price</Label>
                    <Input
                      id="limitPrice"
                      type="number"
                      value={tradeForm.limitPrice}
                      onChange={(e) =>
                        setTradeForm((prev) => ({
                          ...prev,
                          limitPrice: e.target.value,
                          orderType: 'limit',
                        }))
                      }
                      placeholder={`Current: ${selectedAsset.price}`}
                      step="0.0001"
                    />
                  </div>
                  {/* Similar form fields as market order */}
                  <div>
                    <Label htmlFor="units">Units</Label>
                    <Input
                      id="units"
                      type="number"
                      value={tradeForm.units}
                      onChange={(e) =>
                        setTradeForm((prev) => ({
                          ...prev,
                          units: parseFloat(e.target.value) || 0,
                        }))
                      }
                      step="0.001"
                      min="0.001"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleExecuteOrder('buy')}
                      disabled={isExecuting || !tradeForm.limitPrice}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Buy Limit
                    </Button>
                    <Button
                      onClick={() => handleExecuteOrder('sell')}
                      disabled={isExecuting || !tradeForm.limitPrice}
                      variant="destructive"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Sell Limit
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stop" className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Stop orders execute when the market price reaches your specified level.
                  </AlertDescription>
                </Alert>
                {/* Similar implementation for stop orders */}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              Select an asset from the market data to start trading
            </div>
          )}
        </CardContent>
      </Card>

      {/* Positions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Open Positions ({positions.length})
            </span>
            {positions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => closeAllPositions({})}
                disabled={isClosing}
              >
                Close All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.positions ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted h-16 animate-pulse rounded" />
              ))}
            </div>
          ) : positions.length > 0 ? (
            <div className="space-y-3">
              {positions.map((position) => (
                <div key={position.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{position.symbol}</div>
                      <div className="text-muted-foreground text-sm">
                        <Badge variant={position.direction === 'buy' ? 'default' : 'destructive'}>
                          {position.direction.toUpperCase()}
                        </Badge>
                        <span className="ml-2">{position.units} units</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-medium ${position.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatCurrency(position.unrealized_pnl)}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {formatPercentage(position.pnl_percentage)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Entry: {formatCurrency(position.entry_price)}</span>
                    <span>Current: {formatCurrency(position.current_price)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        /* Handle close position */
                      }}
                      disabled={isClosing}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">No open positions</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
