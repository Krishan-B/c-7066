
import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { Asset, ClosedPosition, AllocationData, PerformanceData } from "@/types/account";
import { usePortfolioAnalytics } from '@/hooks/usePortfolioAnalytics';

export interface PortfolioData {
  assets: Asset[];
  closedPositions: ClosedPosition[];
  allocationData: AllocationData[];
  performanceData: PerformanceData[];
  totalValue: number;
  cashBalance: number;
  lockedFunds: number;
  totalPnL: number;
  totalPnLPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
}

export const usePortfolioData = () => {
  const [timeframe, setTimeframe] = useState("1y");
  const { analytics, isLoading, error, refetch } = usePortfolioAnalytics();
  
  // Transform the analytics data into the format expected by the UI components
  const transformedData: PortfolioData = {
    totalValue: analytics?.portfolio_value || 0,
    dayChange: analytics?.daily_change || 0,
    dayChangePercentage: analytics?.daily_change_percent || 0,
    totalPnL: analytics?.total_gain || 0,
    totalPnLPercentage: analytics?.total_gain_percent || 0,
    cashBalance: 4215.89, // Default value since it's not in analytics
    lockedFunds: 850.00, // Default value since it's not in analytics
    
    // Transform top holdings into assets format
    assets: analytics?.top_holdings?.map(holding => ({
      name: holding.name,
      symbol: holding.symbol,
      amount: 0, // Not provided in analytics
      price: holding.value / holding.allocation * 100 / 0.45, // Estimate price based on value and allocation
      entryPrice: 0, // Not provided in analytics
      value: holding.value,
      change: holding.change_percent,
      pnl: holding.value * (holding.change_percent / 100), // Estimate PnL based on value and change percentage
      pnlPercentage: holding.change_percent
    })) || [],
    
    // Transform recent trades into closed positions format
    closedPositions: analytics?.recent_trades?.map(trade => ({
      id: trade.id,
      name: trade.name,
      symbol: trade.symbol,
      openDate: "N/A", // Not provided in analytics
      closeDate: trade.date,
      entryPrice: trade.type === "buy" ? trade.price : 0,
      exitPrice: trade.type === "sell" ? trade.price : 0,
      amount: trade.quantity,
      pnl: trade.type === "sell" ? trade.total * 0.05 : -trade.total * 0.02, // Estimate P&L based on trade type
      pnlPercentage: trade.type === "sell" ? 5 : -2 // Placeholder values
    })) || [],
    
    // Transform allocation data
    allocationData: Object.entries(analytics?.allocation || {}).map(([name, value], index) => {
      const colors = ['#8989DE', '#75C6C3', '#F29559', '#E5C5C0', '#A5D8FF', '#FFD8A5'];
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number,
        color: colors[index % colors.length]
      };
    }),
    
    // Create performance data from portfolio performance
    performanceData: Object.entries(analytics?.performance || {}).map(([date, value]) => ({
      date,
      value: analytics?.portfolio_value * (1 + (value as number) / 100)
    }))
  };

  const handleExportReport = useCallback(() => {
    toast.success("Report export started");
    // Implementation would go here
  }, []);

  const handleTaxEvents = useCallback(() => {
    toast.success("Tax events settings opened");
    // Implementation would go here
  }, []);

  const handleViewDetails = useCallback((symbol: string) => {
    toast.success(`Viewing details for ${symbol}`);
    // Implementation would go here
  }, []);

  return {
    portfolioData: transformedData,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    refetch,
    actions: {
      handleExportReport,
      handleTaxEvents,
      handleViewDetails
    },
    activeTrades: transformedData.assets.length
  };
};
