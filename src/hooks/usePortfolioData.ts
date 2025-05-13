
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/hooks/market/types";
import { useAuth } from "@/hooks/useAuth";
import { PortfolioData } from "@/types/account";

export function usePortfolioData() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchPortfolioData() {
      setLoading(true);
      try {
        const { data: analytics, error } = await supabase.functions.invoke('portfolio-analytics', {
          body: { user_id: user.id }
        });

        if (error) {
          console.error('Error fetching portfolio data:', error);
          return;
        }

        console.log('Portfolio analytics data:', analytics);

        setPortfolioData({
          totalValue: analytics?.total_value || 0,
          cashBalance: analytics?.cash_balance || 0,
          lockedFunds: analytics?.locked_funds || 0,
          
          // Transform top holdings into assets format with all required properties
          assets: analytics?.top_holdings?.map(holding => ({
            name: holding.name,
            symbol: holding.symbol,
            amount: holding.units,
            price: holding.current_price,
            entryPrice: holding.average_price,
            value: holding.value,
            change: holding.change_percent,
            pnl: holding.pnl || (holding.value * (holding.change_percent / 100)),
            pnlPercentage: holding.change_percent,
            // Add the required properties that were missing
            change_percentage: holding.change_percent,
            market_type: holding.market_type || "Stock",
            volume: "N/A",
            market_cap: undefined,
            id: undefined,
            last_updated: undefined
          })) || [],
          
          // Transform recent trades into closed positions format with validation
          closedPositions: analytics?.recent_trades?.map(trade => ({
            id: trade.id,
            symbol: trade.asset_symbol,
            name: trade.asset_name,
            entryDate: new Date(trade.executed_at),
            closeDate: new Date(trade.closed_at),
            entryPrice: trade.price_per_unit,
            closePrice: trade.close_price,
            units: trade.units,
            pnl: trade.pnl,
            pnlPercentage: (trade.pnl / (trade.price_per_unit * trade.units)) * 100,
            direction: trade.trade_type
          })) || [],
          
          // Return performance metrics directly
          performance: analytics?.performance_metrics || {
            allTimeReturn: 0,
            monthlyReturn: 0,
            weeklyReturn: 0,
            dailyReturn: 0
          },
          
          // Return monthly returns array directly
          monthlyReturns: analytics?.monthly_returns || []
        });
      } catch (err) {
        console.error('Error in portfolio data processing:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolioData();
  }, [user]);

  return { portfolioData, loading };
}
