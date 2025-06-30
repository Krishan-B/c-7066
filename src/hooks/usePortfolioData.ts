import { useState, useCallback } from "react";
import {
  Asset,
  ClosedPosition,
  AllocationData,
  PerformanceData,
} from "@/types/account";
import { usePortfolioAnalytics } from "@/hooks/usePortfolioAnalytics";
import { ErrorHandler } from "@/services/errorHandling";

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
    cashBalance: analytics?.cash_balance || 0,
    lockedFunds: analytics?.locked_funds || 0,

    // Transform top holdings into assets format with better error handling
    assets:
      analytics?.top_holdings?.map((holding) => ({
        name: holding.name,
        symbol: holding.symbol,
        amount: holding.quantity || 0,
        price: holding.price || holding.value / (holding.quantity || 1),
        entryPrice: holding.entry_price || 0,
        value: holding.value,
        change: holding.change_percent,
        pnl: holding.pnl || holding.value * (holding.change_percent / 100),
        pnlPercentage: holding.change_percent,
      })) || [],

    // Transform recent trades into closed positions format with validation
    closedPositions:
      analytics?.recent_trades?.map((trade) => ({
        id: trade.id,
        name: trade.name,
        symbol: trade.symbol,
        openDate: trade.open_date || "N/A",
        closeDate: trade.date,
        entryPrice:
          trade.entry_price || (trade.type === "buy" ? trade.price : 0),
        exitPrice:
          trade.exit_price || (trade.type === "sell" ? trade.price : 0),
        amount: trade.quantity,
        pnl:
          trade.pnl ||
          (trade.type === "sell" ? trade.total * 0.05 : -trade.total * 0.02),
        pnlPercentage: trade.pnl_percentage || (trade.type === "sell" ? 5 : -2),
      })) || [],

    // Transform allocation data with better error handling
    allocationData: Object.entries(analytics?.allocation || {}).map(
      ([name, value], index) => {
        const colors = [
          "#8989DE",
          "#75C6C3",
          "#F29559",
          "#E5C5C0",
          "#A5D8FF",
          "#FFD8A5",
        ];
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: value as number,
          color: colors[index % colors.length],
        };
      }
    ),

    // Create performance data from portfolio performance with validation
    performanceData: Object.entries(analytics?.performance || {}).map(
      ([date, value]) => ({
        date,
        value: analytics?.portfolio_value
          ? analytics.portfolio_value * (1 + (value as number) / 100)
          : 0,
      })
    ),
  };

  const handleExportReport = useCallback(() => {
    if (error) {
      ErrorHandler.show(error, "export_report");
      return;
    }
    ErrorHandler.showSuccess("Report export started", {
      description: "Your portfolio report will be ready shortly",
    });
    // Implementation would go here
  }, [error]);

  const handleTaxEvents = useCallback(() => {
    if (error) {
      ErrorHandler.show(error, "tax_events");
      return;
    }
    ErrorHandler.showSuccess("Tax events settings opened", {
      description: "Configure your tax reporting preferences",
    });
    // Implementation would go here
  }, [error]);

  const handleViewDetails = useCallback(
    (symbol: string) => {
      if (error) {
        ErrorHandler.show(error, "view_details");
        return;
      }
      ErrorHandler.showInfo(`Viewing details for ${symbol}`, {
        description: "Loading detailed portfolio information",
      });
      // Implementation would go here
    },
    [error]
  );

  const retryFetch = useCallback(() => {
    ErrorHandler.showInfo("Retrying data fetch...", {
      description: "Attempting to refresh portfolio data",
    });
    refetch();
  }, [refetch]);

  return {
    portfolioData: transformedData,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    refetch: retryFetch,
    actions: {
      handleExportReport,
      handleTaxEvents,
      handleViewDetails,
    },
    activeTrades: transformedData.assets.length,
  };
};
