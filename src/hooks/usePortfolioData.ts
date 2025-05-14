
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Asset, PortfolioData, PerformanceData } from "@/types/account";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function usePortfolioData() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [timeframe, setTimeframe] = useState<string>("1m");
  const { user } = useAuth();
  
  // This will track active trades count
  const [activeTrades, setActiveTrades] = useState<number>(0);

  const fetchPortfolioData = async () => {
    if (!user) {
      return null;
    }
    
    const { data: analytics, error } = await supabase.functions.invoke('portfolio-analytics', {
      body: { user_id: user.id }
    });

    if (error) {
      console.error('Error fetching portfolio data:', error);
      throw error;
    }

    console.log('Portfolio analytics data:', analytics);

    const processedData: PortfolioData = {
      totalValue: analytics?.total_value || 0,
      cashBalance: analytics?.cash_balance || 0,
      lockedFunds: analytics?.locked_funds || 0,
      totalPnL: analytics?.total_gain || 0,
      totalPnLPercentage: analytics?.total_gain_percent || 0,
      dayChange: analytics?.daily_change || 0,
      dayChangePercentage: analytics?.daily_change_percent || 0,
      
      // Transform top holdings into assets format with all required properties
      assets: analytics?.top_holdings?.map(holding => ({
        name: holding.name,
        symbol: holding.symbol,
        amount: holding.units || holding.quantity || 0,
        price: holding.current_price || holding.price || 0,
        entryPrice: holding.average_price || holding.entry_price || 0,
        value: holding.value || 0,
        change: holding.change_percent || 0,
        pnl: holding.pnl || (holding.value * (holding.change_percent / 100)),
        pnlPercentage: holding.change_percent || 0,
        // Add the required properties that were missing
        change_percentage: holding.change_percent || 0,
        market_type: holding.market_type || "Stock",
        volume: holding.volume || "N/A",
        market_cap: undefined,
        id: undefined,
        last_updated: undefined
      })) || [],
      
      // Transform recent trades into closed positions format
      closedPositions: analytics?.recent_trades?.map(trade => ({
        id: trade.id,
        symbol: trade.asset_symbol || trade.symbol,
        name: trade.asset_name || trade.name,
        openDate: trade.open_date || trade.executed_at,
        closeDate: trade.closed_at || trade.date,
        entryPrice: trade.entry_price || trade.price_per_unit || trade.price,
        exitPrice: trade.exit_price || trade.close_price,
        amount: trade.quantity || trade.units,
        pnl: trade.pnl,
        pnlPercentage: trade.pnl_percentage || (trade.pnl / (trade.price_per_unit * trade.units)) * 100,
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

    // Track active trades count
    setActiveTrades((analytics?.recent_trades || []).filter(t => !t.closed_at).length);
    
    return processedData;
  };

  const { 
    data: data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['portfolio-data', user?.id, timeframe],
    queryFn: fetchPortfolioData,
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setPortfolioData(data);
    }
  }, [data]);

  // Portfolio actions handlers
  const handleExportReport = () => {
    console.log('Exporting portfolio report');
    // Implementation for exporting report
  };

  const handleTaxEvents = () => {
    console.log('Showing tax events');
    // Implementation for tax events
  };

  const handleViewDetails = (asset: Asset) => {
    console.log('Viewing details for asset:', asset);
    // Implementation for viewing asset details
  };
  
  // Helper function to generate colors for chart
  function getChartColor(index: number): string {
    const colors = [
      '#8989DE', '#75C6C3', '#EF4444', '#10B981', 
      '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'
    ];
    return colors[index % colors.length];
  }
  
  // Helper function to generate mock performance data based on timeframe
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

  return { 
    portfolioData, 
    timeframe, 
    setTimeframe, 
    activeTrades,
    isLoading,
    error,
    refetch,
    actions: {
      handleExportReport,
      handleTaxEvents,
      handleViewDetails
    }
  };
}
