/**
 * Performance Analytics Service
 * Comprehensive trading performance tracking and analysis
 * Date: June 19, 2025
 */

import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  averageHoldTime: number;
  totalVolume: number;
  returnOnAccount: number;
}

export interface PerformanceByAssetClass {
  assetClass: string;
  trades: number;
  winRate: number;
  pnl: number;
  volume: number;
  averageReturn: number;
}

export interface PerformanceByTimeframe {
  period: string;
  trades: number;
  pnl: number;
  winRate: number;
  volume: number;
  returnPercent: number;
}

export interface TradingStatistics {
  overview: PerformanceMetrics;
  byAssetClass: PerformanceByAssetClass[];
  byTimeframe: PerformanceByTimeframe[];
  recentTrades: any[];
  bestTrades: any[];
  worstTrades: any[];
  monthlyPerformance: any[];
}

export class PerformanceAnalyticsService {
  /**
   * Get comprehensive trading statistics
   */
  static async getTradingStatistics(userId?: string): Promise<TradingStatistics> {
    try {
      console.log('Fetching comprehensive trading statistics...');

      // Get all trades (both open and closed positions)
      const { data: allTrades, error: tradesError } = await supabase
        .from('user_trades')
        .select('*')
        .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (tradesError) {
        throw new Error(`Failed to fetch trades: ${tradesError.message}`);
      }

      // Get current positions for unrealized P&L
      const { data: positions, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'open');

      if (positionsError) {
        throw new Error(`Failed to fetch positions: ${positionsError.message}`);
      }

      // Get account information
      const { data: account, error: accountError } = await supabase
        .from('user_account')
        .select('*')
        .eq('id', userId || (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (accountError) {
        throw new Error(`Failed to fetch account: ${accountError.message}`);
      }

      const trades = allTrades || [];
      const overview = this.calculateOverviewMetrics(trades, positions || [], account);
      const byAssetClass = this.calculateAssetClassPerformance(trades);
      const byTimeframe = this.calculateTimeframePerformance(trades);
      const recentTrades = trades.slice(0, 10);
      const bestTrades = this.getBestTrades(trades, 5);
      const worstTrades = this.getWorstTrades(trades, 5);
      const monthlyPerformance = this.calculateMonthlyPerformance(trades);

      console.log('Trading statistics calculated successfully');

      return {
        overview,
        byAssetClass,
        byTimeframe,
        recentTrades,
        bestTrades,
        worstTrades,
        monthlyPerformance,
      };
    } catch (error) {
      console.error('Error fetching trading statistics:', error);
      throw new Error(
        `Failed to fetch trading statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate overview performance metrics
   */
  private static calculateOverviewMetrics(
    trades: any[],
    positions: any[],
    account: any
  ): PerformanceMetrics {
    const closedTrades = trades.filter((trade) => trade.status === 'closed' && trade.pnl !== null);
    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter((trade) => (trade.pnl || 0) > 0).length;
    const losingTrades = closedTrades.filter((trade) => (trade.pnl || 0) < 0).length;

    const totalRealizedPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0);
    const totalPnL = totalRealizedPnL + totalUnrealizedPnL;

    const wins = closedTrades
      .filter((trade) => (trade.pnl || 0) > 0)
      .map((trade) => trade.pnl || 0);
    const losses = closedTrades
      .filter((trade) => (trade.pnl || 0) < 0)
      .map((trade) => Math.abs(trade.pnl || 0));

    const averageWin = wins.length > 0 ? wins.reduce((sum, win) => sum + win, 0) / wins.length : 0;
    const averageLoss =
      losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0;
    const largestWin = wins.length > 0 ? Math.max(...wins) : 0;
    const largestLoss = losses.length > 0 ? Math.max(...losses) : 0;

    const totalWinAmount = wins.reduce((sum, win) => sum + win, 0);
    const totalLossAmount = losses.reduce((sum, loss) => sum + loss, 0);
    const profitFactor =
      totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 999 : 0;

    // Calculate total volume
    const totalVolume = trades.reduce((sum, trade) => sum + (trade.total_amount || 0), 0);

    // Calculate average hold time (for closed trades)
    const tradesWithDuration = closedTrades.filter((trade) => trade.executed_at && trade.closed_at);
    const averageHoldTime =
      tradesWithDuration.length > 0
        ? tradesWithDuration.reduce((sum, trade) => {
            const duration =
              new Date(trade.closed_at).getTime() - new Date(trade.executed_at).getTime();
            return sum + duration / (1000 * 60 * 60); // Convert to hours
          }, 0) / tradesWithDuration.length
        : 0;

    // Calculate return on account
    const accountBalance = account?.cash_balance || 0;
    const returnOnAccount = accountBalance > 0 ? (totalPnL / accountBalance) * 100 : 0;

    // Calculate Sharpe ratio (simplified)
    const returns = closedTrades.map((trade) => {
      const tradeValue = trade.total_amount || 0;
      return tradeValue > 0 ? ((trade.pnl || 0) / tradeValue) * 100 : 0;
    });

    const avgReturn =
      returns.length > 0 ? returns.reduce((sum, ret) => sum + ret, 0) / returns.length : 0;
    const variance =
      returns.length > 1
        ? returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / (returns.length - 1)
        : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningPnL = 0;

    closedTrades.forEach((trade) => {
      runningPnL += trade.pnl || 0;
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalPnL,
      realizedPnL: totalRealizedPnL,
      unrealizedPnL: totalUnrealizedPnL,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      averageHoldTime,
      totalVolume,
      returnOnAccount,
    };
  }

  /**
   * Calculate performance by asset class
   */
  private static calculateAssetClassPerformance(trades: any[]): PerformanceByAssetClass[] {
    const assetClassMap = new Map<string, any>();

    trades.forEach((trade) => {
      const assetClass = trade.market_type || 'Unknown';

      if (!assetClassMap.has(assetClass)) {
        assetClassMap.set(assetClass, {
          assetClass,
          trades: 0,
          wins: 0,
          totalPnL: 0,
          totalVolume: 0,
        });
      }

      const data = assetClassMap.get(assetClass);

      if (trade.status === 'closed' && trade.pnl !== null) {
        data.trades++;
        data.totalPnL += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) {
          data.wins++;
        }
      }

      data.totalVolume += trade.total_amount || 0;
    });

    return Array.from(assetClassMap.values()).map((data) => ({
      assetClass: data.assetClass,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      pnl: data.totalPnL,
      volume: data.totalVolume,
      averageReturn: data.totalVolume > 0 ? (data.totalPnL / data.totalVolume) * 100 : 0,
    }));
  }

  /**
   * Calculate performance by timeframe
   */
  private static calculateTimeframePerformance(trades: any[]): PerformanceByTimeframe[] {
    const now = new Date();
    const timeframes = [
      { name: 'Today', days: 1 },
      { name: 'This Week', days: 7 },
      { name: 'This Month', days: 30 },
      { name: 'Last 3 Months', days: 90 },
      { name: 'This Year', days: 365 },
    ];

    return timeframes.map((timeframe) => {
      const cutoffDate = new Date(now.getTime() - timeframe.days * 24 * 60 * 60 * 1000);
      const filteredTrades = trades.filter((trade) => {
        const tradeDate = new Date(trade.created_at);
        return tradeDate >= cutoffDate && trade.status === 'closed' && trade.pnl !== null;
      });

      const totalPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const totalVolume = filteredTrades.reduce((sum, trade) => sum + (trade.total_amount || 0), 0);
      const wins = filteredTrades.filter((trade) => (trade.pnl || 0) > 0).length;

      return {
        period: timeframe.name,
        trades: filteredTrades.length,
        pnl: totalPnL,
        winRate: filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0,
        volume: totalVolume,
        returnPercent: totalVolume > 0 ? (totalPnL / totalVolume) * 100 : 0,
      };
    });
  }

  /**
   * Get best performing trades
   */
  private static getBestTrades(trades: any[], limit: number = 5): any[] {
    return trades
      .filter((trade) => trade.status === 'closed' && trade.pnl !== null)
      .sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
      .slice(0, limit)
      .map((trade) => ({
        ...trade,
        returnPercent: trade.total_amount > 0 ? ((trade.pnl || 0) / trade.total_amount) * 100 : 0,
      }));
  }

  /**
   * Get worst performing trades
   */
  private static getWorstTrades(trades: any[], limit: number = 5): any[] {
    return trades
      .filter((trade) => trade.status === 'closed' && trade.pnl !== null)
      .sort((a, b) => (a.pnl || 0) - (b.pnl || 0))
      .slice(0, limit)
      .map((trade) => ({
        ...trade,
        returnPercent: trade.total_amount > 0 ? ((trade.pnl || 0) / trade.total_amount) * 100 : 0,
      }));
  }

  /**
   * Calculate monthly performance
   */
  private static calculateMonthlyPerformance(trades: any[]): any[] {
    const monthlyMap = new Map<string, any>();

    trades.forEach((trade) => {
      if (trade.status === 'closed' && trade.pnl !== null && trade.closed_at) {
        const date = new Date(trade.closed_at);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            trades: 0,
            pnl: 0,
            volume: 0,
            wins: 0,
          });
        }

        const data = monthlyMap.get(monthKey);
        data.trades++;
        data.pnl += trade.pnl || 0;
        data.volume += trade.total_amount || 0;

        if ((trade.pnl || 0) > 0) {
          data.wins++;
        }
      }
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((data) => ({
        ...data,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        returnPercent: data.volume > 0 ? (data.pnl / data.volume) * 100 : 0,
      }));
  }

  /**
   * Get performance comparison with benchmarks
   */
  static async getPerformanceComparison(userId?: string): Promise<any> {
    try {
      const stats = await this.getTradingStatistics(userId);

      // Simplified benchmark comparison
      const benchmarks = {
        spx500: { name: 'S&P 500', annualReturn: 10.5, volatility: 15.0 },
        nasdaq: { name: 'NASDAQ', annualReturn: 12.3, volatility: 18.5 },
        forex: { name: 'Currency Carry', annualReturn: 5.5, volatility: 8.0 },
        crypto: { name: 'Bitcoin', annualReturn: 45.0, volatility: 65.0 },
      };

      const userAnnualReturn = stats.overview.returnOnAccount;
      const userVolatility = Math.abs(stats.overview.sharpeRatio) * 15; // Approximation

      const comparison = Object.entries(benchmarks).map(([key, benchmark]) => ({
        benchmark: benchmark.name,
        userReturn: userAnnualReturn,
        benchmarkReturn: benchmark.annualReturn,
        outperformance: userAnnualReturn - benchmark.annualReturn,
        userVolatility: userVolatility,
        benchmarkVolatility: benchmark.volatility,
        riskAdjustedPerformance: userVolatility > 0 ? userAnnualReturn / userVolatility : 0,
        benchmarkRiskAdjusted: benchmark.annualReturn / benchmark.volatility,
      }));

      return {
        userMetrics: {
          annualReturn: userAnnualReturn,
          volatility: userVolatility,
          sharpeRatio: stats.overview.sharpeRatio,
          maxDrawdown: stats.overview.maxDrawdown,
        },
        comparison,
        summary: {
          bestPerforming: comparison.find(
            (c) => c.outperformance === Math.max(...comparison.map((x) => x.outperformance))
          ),
          averageOutperformance:
            comparison.reduce((sum, c) => sum + c.outperformance, 0) / comparison.length,
        },
      };
    } catch (error) {
      console.error('Error getting performance comparison:', error);
      throw error;
    }
  }

  /**
   * Format currency values
   */
  static formatCurrency(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format percentage values
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  }

  /**
   * Get performance grade based on metrics
   */
  static getPerformanceGrade(metrics: PerformanceMetrics): {
    grade: string;
    description: string;
    color: string;
  } {
    const { winRate, profitFactor, sharpeRatio, returnOnAccount } = metrics;

    let score = 0;

    // Win rate scoring (0-25 points)
    if (winRate >= 70) score += 25;
    else if (winRate >= 60) score += 20;
    else if (winRate >= 50) score += 15;
    else if (winRate >= 40) score += 10;
    else score += 5;

    // Profit factor scoring (0-25 points)
    if (profitFactor >= 2.0) score += 25;
    else if (profitFactor >= 1.5) score += 20;
    else if (profitFactor >= 1.2) score += 15;
    else if (profitFactor >= 1.0) score += 10;
    else score += 0;

    // Sharpe ratio scoring (0-25 points)
    if (sharpeRatio >= 2.0) score += 25;
    else if (sharpeRatio >= 1.5) score += 20;
    else if (sharpeRatio >= 1.0) score += 15;
    else if (sharpeRatio >= 0.5) score += 10;
    else score += 5;

    // Return on account scoring (0-25 points)
    if (returnOnAccount >= 20) score += 25;
    else if (returnOnAccount >= 15) score += 20;
    else if (returnOnAccount >= 10) score += 15;
    else if (returnOnAccount >= 5) score += 10;
    else if (returnOnAccount >= 0) score += 5;
    else score += 0;

    if (score >= 85) {
      return { grade: 'A+', description: 'Excellent trading performance', color: 'text-green-600' };
    } else if (score >= 75) {
      return { grade: 'A', description: 'Very good trading performance', color: 'text-green-500' };
    } else if (score >= 65) {
      return { grade: 'B+', description: 'Good trading performance', color: 'text-blue-600' };
    } else if (score >= 55) {
      return { grade: 'B', description: 'Above average performance', color: 'text-blue-500' };
    } else if (score >= 45) {
      return { grade: 'C+', description: 'Average trading performance', color: 'text-yellow-600' };
    } else if (score >= 35) {
      return { grade: 'C', description: 'Below average performance', color: 'text-yellow-500' };
    } else if (score >= 25) {
      return { grade: 'D', description: 'Poor trading performance', color: 'text-orange-500' };
    } else {
      return { grade: 'F', description: 'Needs significant improvement', color: 'text-red-600' };
    }
  }
}
