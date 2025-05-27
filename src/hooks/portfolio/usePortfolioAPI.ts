import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import type { PortfolioData } from "@/types/account";
import type { MarketType } from "@/hooks/market/types";

interface PortfolioApiResult {
  data: PortfolioData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

interface PortfolioHolding {
  name?: string;
  symbol?: string;
  units?: number;
  quantity?: number;
  current_price?: number;
  price?: number;
  average_price?: number;
  entry_price?: number;
  value?: number;
  change_percent?: number;
  pnl?: number;
  market_type?: MarketType;
  volume?: number | string;
  market_cap?: number;
  id?: string | number;
  last_updated?: string;
}

interface PortfolioTrade {
  id?: string | number;
  asset_symbol?: string;
  symbol?: string;
  asset_name?: string;
  name?: string;
  open_date?: string;
  executed_at?: string;
  closed_at?: string;
  date?: string;
  entry_price?: number;
  price_per_unit?: number;
  price?: number;
  exit_price?: number;
  close_price?: number;
  quantity?: number;
  units?: number;
  pnl?: number;
  pnl_percentage?: number;
}

interface Analytics {
  total_value?: number;
  cash_balance?: number;
  locked_funds?: number;
  total_gain?: number;
  total_gain_percent?: number;
  daily_change?: number;
  daily_change_percent?: number;
  top_holdings?: PortfolioHolding[];
  recent_trades?: PortfolioTrade[];
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
  
      return processPortfolioData(analytics);
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
}

// Helper function to process raw API data
function processPortfolioData(analytics: Analytics): PortfolioData {
  const transformHolding = (holding: PortfolioHolding) => ({
    name: holding.name || '',
    symbol: holding.symbol || '',
    amount: holding.units || holding.quantity || 0,
    price: holding.current_price || holding.price || 0,
    entryPrice: holding.average_price || holding.entry_price || 0,
    value: holding.value || 0,
    change: holding.change_percent || 0,
    pnl: holding.pnl || (holding.value ?? 0) * ((holding.change_percent ?? 0) / 100),
    pnlPercentage: holding.change_percent || 0,
    change_percentage: holding.change_percent || 0,
    market_type: (holding.market_type || 'Stock') as MarketType,
    volume: holding.volume?.toString() || "N/A",
    market_cap: holding.market_cap?.toString() || undefined,
    id: holding.id?.toString() || '',
    last_updated: holding.last_updated || new Date().toISOString()
  });

  const transformTrade = (trade: PortfolioTrade) => {
    const exitPrice = trade.exit_price || trade.close_price || 0;
    const entryPrice = trade.entry_price || trade.price_per_unit || trade.price || 0;
    
    return {
      id: trade.id?.toString() || '',
      symbol: trade.asset_symbol || trade.symbol || '',
      name: trade.asset_name || trade.name || '',
      openDate: trade.open_date || trade.executed_at || new Date().toISOString(),
      closeDate: trade.closed_at || trade.date || new Date().toISOString(),
      entryPrice,
      exitPrice,
      amount: trade.quantity || trade.units || 0,
      pnl: trade.pnl || 0,
      pnlPercentage: trade.pnl_percentage || 
        (entryPrice > 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0)
    };
  };

  return {
    totalValue: analytics?.total_value || 0,
    cashBalance: analytics?.cash_balance || 0,
    lockedFunds: analytics?.locked_funds || 0,
    totalPnL: analytics?.total_gain || 0,
    totalPnLPercentage: analytics?.total_gain_percent || 0,
    dayChange: analytics?.daily_change || 0,
    dayChangePercentage: analytics?.daily_change_percent || 0,
    assets: (analytics?.top_holdings || []).map(transformHolding),
    closedPositions: (analytics?.recent_trades || []).map(transformTrade)
  };
}
