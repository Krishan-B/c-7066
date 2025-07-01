import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ErrorHandler } from "@/services/errorHandling";

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

const fetchPortfolioAnalytics = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "portfolio-analytics",
      {
        body: { user_id: userId },
      }
    );

    if (error) {
      throw error;
    }

    return data as PortfolioAnalytics;
  } catch (error) {
    ErrorHandler.handleError({
      code: "data_fetch_error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch portfolio analytics",
      details: error,
      retryable: true,
    });
    throw error;
  }
};

export const usePortfolioAnalytics = () => {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-analytics", user?.id],
    queryFn: () => fetchPortfolioAnalytics(user?.id || ""),
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
};
