
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PortfolioData, PerformanceData } from "@/types/account";

interface PortfolioApiResult {
  data: PortfolioData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<{ data: PortfolioData | null }>;
}

interface PortfolioAnalytics {
  top_holdings: Array<{
    symbol: string;
    market_type: string;
    quantity: number;
    value: number;
    pnl: number;
  }>;
  recent_trades: Array<{
    symbol: string;
    market_type: string;
    entry_price: number;
    exit_price: number;
    quantity: number;
    pnl: number;
    closed_at: string;
  }>;
  performance: {
    total_value: number;
    total_pnl: number;
    daily_pnl: number;
    monthly_returns: Array<{
      month: string;
      return: number;
    }>;
  };
}

export const usePortfolioAPI = (timeframe: string): PortfolioApiResult => {
  const { user } = useAuth();

  const fetchPortfolioData = async (): Promise<PortfolioData | null> => {
    if (!user) {
      return null;
    }
    
    try {
      const { data: analytics, error } = await supabase.functions.invoke('portfolio-analytics', {
        body: { userId: user.id }
      });
  
      if (error) {
        throw new Error(`Error fetching portfolio data: ${error.message}`);
      }
  
      return processPortfolioData(analytics, timeframe);
    } catch (error) {
      console.error("Portfolio API error:", error);
      throw error;
    }
  };

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['portfolio-data', user?.id, timeframe],
    queryFn: fetchPortfolioData,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data: data ?? null,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch
  };
};

// Helper function to process raw API data
function processPortfolioData(analytics: PortfolioAnalytics, timeframe: string): PortfolioData {
  return {
    totalValue: analytics?.total_value || 0,
    cashBalance: analytics?.cash_balance || 0,
    lockedFunds: analytics?.locked_funds || 0,
    totalPnL: analytics?.total_gain || 0,
    totalPnLPercentage: analytics?.total_gain_percent || 0,
    dayChange: analytics?.daily_change || 0,
    dayChangePercentage: analytics?.daily_change_percent || 0,
    
    // Transform top holdings into assets format
    assets: analytics.top_holdings.map(holding => ({
      name: holding.name,
      symbol: holding.symbol,
      amount: holding.units || holding.quantity || 0,
      price: holding.current_price || holding.price || 0,
      entryPrice: holding.average_price || holding.entry_price || 0,
      value: holding.value || 0,
      change: holding.change_percent || 0,
      pnl: holding.pnl || (holding.value * (holding.change_percent / 100)),
      pnlPercentage: holding.change_percent || 0,
      change_percentage: holding.change_percent || 0,
      market_type: holding.market_type || "Stock",
      volume: holding.volume || "N/A",
      market_cap: undefined,
      id: undefined,
      last_updated: undefined
    })) || [],
    
    // Transform recent trades into closed positions format
    closedPositions: analytics.recent_trades.map(trade => ({
      id: trade.id,
      symbol: trade.asset_symbol || trade.symbol,
      name: trade.asset_name || trade.name,
      openDate: trade.open_date || trade.executed_at,
      closeDate: trade.closed_at || trade.date,
      entryPrice: trade.entry_price || trade.price_per_unit || trade.price,
      exitPrice: trade.exit_price || trade.close_price,
      amount: trade.quantity || trade.units,
      pnl: trade.pnl,
      pnlPercentage: trade.pnl_percentage || 
        ((trade.exit_price || 0) > 0 && (trade.price_per_unit || 0) > 0 ? 
         ((trade.exit_price - trade.price_per_unit) / trade.price_per_unit) * 100 : 0),
    })) || [],
    
    // Return performance metrics
    performance: analytics?.performance_metrics || {
      allTimeReturn: 0,
      monthlyReturn: 0,
      weeklyReturn: 0,
      dailyReturn: 0
    },
    
    // Create allocation data for charts
    allocationData: Object.entries(analytics?.allocation || {}).map(([name, value], index) => ({
      name,
      value: value as number,
      color: getChartColor(index)
    })),
    
    // Create performance data for charts
    performanceData: getPerformanceData(timeframe),
    
    // Return monthly returns array
    monthlyReturns: analytics?.monthly_returns || []
  };
}

// Helper function to generate colors for chart
function getChartColor(index: number): string {
  const colors = [
    '#8989DE', '#75C6C3', '#EF4444', '#10B981', 
    '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'
  ];
  return colors[index % colors.length];
}

// Helper function to generate performance data based on timeframe
function getPerformanceData(timeframe: string): PerformanceData[] {
  const data: PerformanceData[] = [];
  const points = timeframe === '1m' ? 30 : 
                timeframe === '3m' ? 90 : 
                timeframe === '6m' ? 180 : 
                timeframe === '1y' ? 365 : 100;
  
  let baseValue = 100000;
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Create some variation in the data
    const randomChange = (Math.random() - 0.5) * 0.02;
    baseValue = baseValue * (1 + randomChange);
    
    data.push({
      date: date.toISOString().substring(0, 10),
      value: baseValue
    });
  }
  
  return data;
}
