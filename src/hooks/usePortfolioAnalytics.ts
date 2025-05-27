
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export interface PortfolioAnalytics {
  portfolio_value: number;
  daily_change: number;
  daily_change_percent: number;
  total_gain: number;
  total_gain_percent: number;
  cash_balance: number;
  locked_funds: number;
  allocation: Record<string, number>;
  performance: Record<string, number>;
  top_holdings: Array<{
    symbol: string;
    name: string;
    value: number;
    allocation: number;
    change_percent: number;
    quantity?: number;
    price?: number;
    entry_price?: number;
    pnl?: number;
  }>;
  recent_trades: Array<{
    id: string;
    symbol: string;
    name: string;
    type: string;
    quantity: number;
    price: number;
    total: number;
    date: string;
    open_date?: string;
    entry_price?: number;
    exit_price?: number;
    pnl?: number;
    pnl_percentage?: number;
  }>;
}

export const usePortfolioAnalytics = () => {
  const { user } = useAuth();
  
  const fetchPortfolioAnalytics = async (): Promise<PortfolioAnalytics | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase.functions.invoke('portfolio-analytics', {
      body: { userId: user.id }
    });
    
    if (error) {
      console.error("Error fetching portfolio analytics:", error);
      throw new Error(error.message);
    }
    
    return data?.data || null;
  };
  
  const { 
    data: analytics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["portfolio-analytics", user?.id],
    queryFn: fetchPortfolioAnalytics,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  return {
    analytics,
    isLoading,
    error,
    refetch
  };
};
