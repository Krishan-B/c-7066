/**
 * Comprehensive Trading Dashboard Integration
 * Main trading interface bringing together all trading engine components
 * Date: June 19, 2025
 */

import React, { useEffect, useState } from 'react';
import { PerformanceAnalyticsService } from '@/services/analytics/performanceAnalytics';
import { TradingEngineService } from '@/services/trading/tradingEngine';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Eye,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { AdvancedTradingDashboard } from '@/components/trading/AdvancedTradingDashboard';
import { RealTimeMarketDataStream } from '@/components/trading/RealTimeMarketDataStream';
import { RealTimePositionTracker } from '@/components/trading/RealTimePositionTracker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccountMonitor, useTradingEngine } from '@/hooks/trading/useTradingEngine';

interface ComprehensiveTradingDashboardProps {
  userId?: string;
}

export function ComprehensiveTradingDashboard({ userId }: ComprehensiveTradingDashboardProps) {
  const { positions, accountMetrics, loading, error, refreshAll } = useTradingEngine();

  const { isMarginCall, getMarginUtilization } = useAccountMonitor();

  // Selected asset for trading
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Performance analytics
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [performanceGrade, setPerformanceGrade] = useState<any>(null);

  // Risk metrics
  const [riskMetrics, setRiskMetrics] = useState<any>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState('trading');

  // Load performance analytics
  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        const stats = await PerformanceAnalyticsService.getTradingStatistics(userId);
        setPerformanceStats(stats);

        const grade = PerformanceAnalyticsService.getPerformanceGrade(stats.overview);
        setPerformanceGrade(grade);
      } catch (error) {
        console.error('Failed to load performance data:', error);
      }
    };

    loadPerformanceData();
  }, [userId]);

  // Load risk metrics
  useEffect(() => {
    const loadRiskMetrics = async () => {
      try {
        // Note: This would call the risk management edge function
        // For now, we'll simulate the data
        setRiskMetrics({
          overall: {
            riskScore: 3.2,
            riskLevel: 'medium',
            marginLevel: accountMetrics?.marginLevel || 100,
            marginUtilization: getMarginUtilization(),
          },
          portfolio: {
            totalPositions: positions.length,
            diversificationScore: 7.5,
            correlationRisk: 15,
            warnings: isMarginCall ? ['Margin call active'] : [],
            recommendations: [],
          },
        });
      } catch (error) {
        console.error('Failed to load risk metrics:', error);
      }
    };

    if (accountMetrics) {
      loadRiskMetrics();
    }
  }, [accountMetrics, positions, isMarginCall, getMarginUtilization]);

  // Handle asset selection from market data
  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setActiveTab('trading');
  };

  // Format currency
  const formatCurrency = (value: number) => TradingEngineService.formatCurrency(value);
  const formatPercentage = (value: number) => TradingEngineService.formatPercentage(value);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load trading dashboard: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Trading Dashboard Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
              <p className="text-muted-foreground">
                Advanced CFD trading with real-time analytics and risk management
              </p>
            </div>
            <div className="flex items-center gap-4">
              {performanceGrade && (
                <Badge
                  variant={
                    performanceGrade.grade.startsWith('A')
                      ? 'default'
                      : performanceGrade.grade.startsWith('B')
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="px-3 py-1 text-lg"
                >
                  Grade: {performanceGrade.grade}
                </Badge>
              )}
              {isMarginCall && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Margin Call
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={refreshAll}
                disabled={loading.account || loading.positions}
              >
                <Activity className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {accountMetrics && (
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-6 py-3">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-6">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(accountMetrics.balance)}</div>
                <div className="text-muted-foreground text-xs">Balance</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(accountMetrics.equity)}</div>
                <div className="text-muted-foreground text-xs">Equity</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${accountMetrics.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(accountMetrics.unrealizedPnl)}
                </div>
                <div className="text-muted-foreground text-xs">Unrealized P&L</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{positions.length}</div>
                <div className="text-muted-foreground text-xs">Open Positions</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${accountMetrics.marginLevel <= 1 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {accountMetrics.marginLevel.toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-xs">Margin Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {performanceStats ? formatPercentage(performanceStats.overview.winRate) : '--'}
                </div>
                <div className="text-muted-foreground text-xs">Win Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Positions
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Market Data
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Management
            </TabsTrigger>
          </TabsList>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <AdvancedTradingDashboard selectedAsset={selectedAsset} />
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            <RealTimePositionTracker autoRefresh={true} refreshInterval={5000} />
          </TabsContent>

          {/* Market Data Tab */}
          <TabsContent value="market" className="space-y-6">
            <RealTimeMarketDataStream
              onAssetSelect={handleAssetSelect}
              selectedAssets={selectedAsset ? [selectedAsset.symbol] : []}
              autoRefresh={true}
              refreshInterval={5000}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {performanceStats ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Overview
                      {performanceGrade && (
                        <Badge variant="outline" className={performanceGrade.color}>
                          {performanceGrade.grade}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">
                          {performanceStats.overview.totalTrades}
                        </div>
                        <div className="text-muted-foreground text-sm">Total Trades</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(performanceStats.overview.winRate)}
                        </div>
                        <div className="text-muted-foreground text-sm">Win Rate</div>
                      </div>
                      <div>
                        <div
                          className={`text-2xl font-bold ${performanceStats.overview.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(performanceStats.overview.totalPnL)}
                        </div>
                        <div className="text-muted-foreground text-sm">Total P&L</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {performanceStats.overview.profitFactor.toFixed(2)}
                        </div>
                        <div className="text-muted-foreground text-sm">Profit Factor</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {performanceStats.overview.sharpeRatio.toFixed(2)}
                        </div>
                        <div className="text-muted-foreground text-sm">Sharpe Ratio</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {formatPercentage(performanceStats.overview.returnOnAccount)}
                        </div>
                        <div className="text-muted-foreground text-sm">Return on Account</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Class Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Asset Class</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {performanceStats.byAssetClass.map((assetClass: any) => (
                        <div
                          key={assetClass.assetClass}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{assetClass.assetClass}</div>
                            <div className="text-muted-foreground text-sm">
                              {assetClass.trades} trades • {formatPercentage(assetClass.winRate)}{' '}
                              win rate
                            </div>
                          </div>
                          <div
                            className={`text-right ${assetClass.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            <div className="font-medium">{formatCurrency(assetClass.pnl)}</div>
                            <div className="text-sm">
                              {formatPercentage(assetClass.averageReturn)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Performance */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {performanceStats.byTimeframe.slice(0, 3).map((period: any) => (
                        <div key={period.period} className="text-center">
                          <div className="text-lg font-bold">{period.period}</div>
                          <div
                            className={`text-2xl font-bold ${period.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {formatCurrency(period.pnl)}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {period.trades} trades • {formatPercentage(period.winRate)} win rate
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                    Loading Analytics
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Please wait while we calculate your performance metrics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risk" className="space-y-6">
            {riskMetrics ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Risk Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Risk Overview
                      <Badge
                        variant={
                          riskMetrics.overall.riskLevel === 'low'
                            ? 'default'
                            : riskMetrics.overall.riskLevel === 'medium'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {riskMetrics.overall.riskLevel.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Risk Score</span>
                        <span className="font-bold">
                          {riskMetrics.overall.riskScore.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin Level</span>
                        <span
                          className={`font-bold ${riskMetrics.overall.marginLevel <= 1 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {riskMetrics.overall.marginLevel.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin Utilization</span>
                        <span className="font-bold">
                          {riskMetrics.overall.marginUtilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Positions</span>
                        <span className="font-bold">{riskMetrics.portfolio.totalPositions}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Portfolio Risk */}
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Risk Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Diversification Score</span>
                        <span className="font-bold">
                          {riskMetrics.portfolio.diversificationScore.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Correlation Risk</span>
                        <span className="font-bold">
                          {riskMetrics.portfolio.correlationRisk.toFixed(1)}%
                        </span>
                      </div>

                      {/* Warnings */}
                      {riskMetrics.portfolio.warnings.length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-inside list-disc">
                              {riskMetrics.portfolio.warnings.map(
                                (warning: string, index: number) => (
                                  <li key={index}>{warning}</li>
                                )
                              )}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Recommendations */}
                      {riskMetrics.portfolio.recommendations.length > 0 && (
                        <Alert>
                          <Target className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-inside list-disc">
                              {riskMetrics.portfolio.recommendations.map(
                                (recommendation: string, index: number) => (
                                  <li key={index}>{recommendation}</li>
                                )
                              )}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                    Loading Risk Analysis
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Please wait while we analyze your portfolio risk
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
