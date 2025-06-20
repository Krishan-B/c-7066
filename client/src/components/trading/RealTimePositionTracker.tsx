/**
 * Real-Time Position Tracker Component
 * Advanced position monitoring with live P&L updates
 * Date: June 19, 2025
 */

import React, { useCallback, useEffect, useState } from 'react';
import { YahooFinanceService } from '@/services/market/yahooFinanceService';
import { TradingEngineService } from '@/services/trading/tradingEngine';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  Percent,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAccountMonitor, usePositionManager } from '@/hooks/trading/useTradingEngine';

interface PositionTrackerProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  showClosedPositions?: boolean;
}

export function RealTimePositionTracker({
  autoRefresh = true,
  refreshInterval = 5000,
  showClosedPositions = false,
}: PositionTrackerProps) {
  const { positions, closePosition, closeAllPositions, refreshPositions, isClosing } =
    usePositionManager();

  const { accountMetrics, isMarginCall, getMarginUtilization } = useAccountMonitor();

  // Real-time price updates
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Position analytics
  const [positionAnalytics, setPositionAnalytics] = useState({
    totalPositions: 0,
    totalPnL: 0,
    winningPositions: 0,
    losingPositions: 0,
    largestWin: 0,
    largestLoss: 0,
    totalVolume: 0,
  });

  /**
   * Update live prices for all positions
   */
  const updateLivePrices = useCallback(async () => {
    if (positions.length === 0) return;

    try {
      const symbols = Array.from(new Set(positions.map((p) => p.symbol)));
      const priceData = await YahooFinanceService.getMultipleQuotes(symbols);

      const prices: Record<string, number> = {};
      priceData.forEach((quote) => {
        if (quote.symbol && quote.regularMarketPrice) {
          prices[quote.symbol] = quote.regularMarketPrice;
        }
      });

      setLivePrices(prices);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update live prices:', error);
    }
  }, [positions]);

  /**
   * Calculate position analytics
   */
  const calculateAnalytics = useCallback(() => {
    const analytics = positions.reduce(
      (acc, position) => {
        const currentPrice = livePrices[position.symbol] || position.current_price;
        let pnl: number;

        if (position.direction === 'buy') {
          pnl = (currentPrice - position.entry_price) * position.units;
        } else {
          pnl = (position.entry_price - currentPrice) * position.units;
        }

        return {
          totalPositions: acc.totalPositions + 1,
          totalPnL: acc.totalPnL + pnl,
          winningPositions: acc.winningPositions + (pnl > 0 ? 1 : 0),
          losingPositions: acc.losingPositions + (pnl < 0 ? 1 : 0),
          largestWin: Math.max(acc.largestWin, pnl),
          largestLoss: Math.min(acc.largestLoss, pnl),
          totalVolume: acc.totalVolume + position.position_value,
        };
      },
      {
        totalPositions: 0,
        totalPnL: 0,
        winningPositions: 0,
        losingPositions: 0,
        largestWin: 0,
        largestLoss: 0,
        totalVolume: 0,
      }
    );

    setPositionAnalytics(analytics);
  }, [positions, livePrices]);

  /**
   * Handle position close
   */
  const handleClosePosition = async (positionId: string, symbol: string) => {
    const currentPrice =
      livePrices[symbol] || positions.find((p) => p.id === positionId)?.current_price || 0;
    await closePosition(positionId, currentPrice);
  };

  /**
   * Handle close all positions
   */
  const handleCloseAllPositions = async () => {
    await closeAllPositions(livePrices);
  };

  // Auto-refresh prices
  useEffect(() => {
    if (autoRefresh && positions.length > 0) {
      const interval = setInterval(updateLivePrices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, updateLivePrices, positions.length]);

  // Initial price update
  useEffect(() => {
    updateLivePrices();
  }, [updateLivePrices]);

  // Calculate analytics when positions or prices change
  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  // Format functions
  const formatCurrency = (value: number) => TradingEngineService.formatCurrency(value);
  const formatPercentage = (value: number) => TradingEngineService.formatPercentage(value);

  return (
    <div className="space-y-6">
      {/* Position Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Position Analytics
            <Badge variant={positionAnalytics.totalPnL >= 0 ? 'default' : 'destructive'}>
              {formatCurrency(positionAnalytics.totalPnL)}
            </Badge>
          </CardTitle>
          <CardDescription>
            Last updated: {lastUpdate.toLocaleTimeString()}
            {autoRefresh && <span className="ml-2 text-green-600">● Live</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{positionAnalytics.totalPositions}</div>
              <div className="text-muted-foreground text-sm">Total Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {positionAnalytics.winningPositions}
              </div>
              <div className="text-muted-foreground text-sm">Winning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {positionAnalytics.losingPositions}
              </div>
              <div className="text-muted-foreground text-sm">Losing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(positionAnalytics.largestWin)}
              </div>
              <div className="text-muted-foreground text-sm">Largest Win</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(positionAnalytics.largestLoss)}
              </div>
              <div className="text-muted-foreground text-sm">Largest Loss</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(positionAnalytics.totalVolume)}
              </div>
              <div className="text-muted-foreground text-sm">Total Volume</div>
            </div>
          </div>

          {/* Win Rate Progress */}
          {positionAnalytics.totalPositions > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Win Rate</span>
                <span>
                  {(
                    (positionAnalytics.winningPositions / positionAnalytics.totalPositions) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <Progress
                value={
                  (positionAnalytics.winningPositions / positionAnalytics.totalPositions) * 100
                }
                className="h-2"
              />
            </div>
          )}

          {/* Margin Call Warning */}
          {isMarginCall && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Margin call active! Consider closing positions to improve margin level.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Open Positions ({positions.length})
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={updateLivePrices}
                disabled={positions.length === 0}
              >
                <Clock className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              {positions.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCloseAllPositions}
                  disabled={isClosing}
                >
                  <X className="mr-2 h-4 w-4" />
                  Close All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Entry Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Market Value</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead className="text-right">P&L %</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-center">SL/TP</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => {
                    const currentPrice = livePrices[position.symbol] || position.current_price;
                    const marketValue = position.units * currentPrice;

                    let pnl: number;
                    if (position.direction === 'buy') {
                      pnl = (currentPrice - position.entry_price) * position.units;
                    } else {
                      pnl = (position.entry_price - currentPrice) * position.units;
                    }

                    const pnlPercentage = (pnl / position.position_value) * 100;
                    const isProfitable = pnl >= 0;

                    return (
                      <TableRow key={position.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{position.symbol}</div>
                            <div className="text-muted-foreground text-xs">
                              {position.asset_class}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={position.direction === 'buy' ? 'default' : 'destructive'}>
                            {position.direction === 'buy' ? (
                              <TrendingUp className="mr-1 h-3 w-3" />
                            ) : (
                              <TrendingDown className="mr-1 h-3 w-3" />
                            )}
                            {position.direction.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{position.units}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(position.entry_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {formatCurrency(currentPrice)}
                            {livePrices[position.symbol] && (
                              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(marketValue)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(pnl)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatPercentage(pnlPercentage)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(position.margin_used)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            {position.stop_loss && (
                              <div className="flex items-center gap-1 text-xs">
                                <Shield className="h-3 w-3 text-red-500" />
                                {formatCurrency(position.stop_loss)}
                              </div>
                            )}
                            {position.take_profit && (
                              <div className="flex items-center gap-1 text-xs">
                                <Target className="h-3 w-3 text-green-500" />
                                {formatCurrency(position.take_profit)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClosePosition(position.id, position.symbol)}
                            disabled={isClosing}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Close
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart3 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-muted-foreground mb-2 text-lg font-medium">No Open Positions</h3>
              <p className="text-muted-foreground text-sm">
                Start trading to see your positions here with real-time updates
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Margin Status */}
      {accountMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Margin Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used Margin</span>
                  <span className="font-medium">{formatCurrency(accountMetrics.usedMargin)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Free Margin</span>
                  <span className="font-medium">{formatCurrency(accountMetrics.freeMargin)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margin Level</span>
                  <span
                    className={`font-medium ${accountMetrics.marginLevel <= 1 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {accountMetrics.marginLevel.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Margin Utilization</div>
                <Progress value={getMarginUtilization()} className="h-3" />
                <div className="text-muted-foreground text-xs">
                  {getMarginUtilization().toFixed(1)}% of equity used as margin
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Risk Level</div>
                <div className="flex items-center gap-2">
                  {accountMetrics.marginLevel > 5 ? (
                    <Badge variant="default">Low Risk</Badge>
                  ) : accountMetrics.marginLevel > 2 ? (
                    <Badge variant="secondary">Medium Risk</Badge>
                  ) : (
                    <Badge variant="destructive">High Risk</Badge>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  Margin call at {accountMetrics.marginCallLevel}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
