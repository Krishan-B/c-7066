
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user account data
    const { data: accountData, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .eq('id', userId)
      .single();

    if (accountError) {
      throw new Error(`Error fetching account data: ${accountError.message}`);
    }

    // Fetch portfolio positions
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('user_id', userId);

    if (portfolioError) {
      throw new Error(`Error fetching portfolio data: ${portfolioError.message}`);
    }

    // Fetch recent trades
    const { data: recentTrades, error: tradesError } = await supabase
      .from('user_trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (tradesError) {
      throw new Error(`Error fetching trades data: ${tradesError.message}`);
    }

    // Calculate portfolio metrics
    const totalPortfolioValue = portfolioData?.reduce((sum, position) => sum + position.total_value, 0) || 0;
    const totalPortfolioCost = portfolioData?.reduce((sum, position) => sum + (position.average_price * position.units), 0) || 0;
    
    // Calculate total gain/loss
    const totalGain = portfolioData?.reduce((sum, position) => sum + position.pnl, 0) || 0;
    const totalGainPercent = totalPortfolioCost > 0 ? (totalGain / totalPortfolioCost) * 100 : 0;
    
    // Calculate asset allocation
    const allocation: Record<string, number> = {};
    portfolioData?.forEach(position => {
      const marketType = position.market_type;
      if (!allocation[marketType]) {
        allocation[marketType] = 0;
      }
      allocation[marketType] += position.total_value;
    });
    
    // Convert allocation to percentages
    Object.keys(allocation).forEach(key => {
      allocation[key] = totalPortfolioValue > 0 ? (allocation[key] / totalPortfolioValue) * 100 : 0;
    });

    // Build and return the analytics data
    const analytics = {
      total_value: totalPortfolioValue,
      cash_balance: accountData?.cash_balance || 0,
      locked_funds: accountData?.used_margin || 0,
      total_gain: totalGain,
      total_gain_percent: totalGainPercent,
      daily_change: accountData?.unrealized_pnl || 0,  
      daily_change_percent: accountData?.balance > 0 ? (accountData?.unrealized_pnl / accountData?.balance) * 100 : 0,
      allocation,
      performance_metrics: {
        allTimeReturn: accountData?.realized_pnl || 0,
        monthlyReturn: (totalGainPercent / 12) || 0,  // Simplified calculation
        weeklyReturn: (totalGainPercent / 52) || 0,   // Simplified calculation
        dailyReturn: (totalGainPercent / 365) || 0,   // Simplified calculation
      },
      top_holdings: portfolioData?.map(position => ({
        symbol: position.asset_symbol,
        name: position.asset_name,
        units: position.units,
        average_price: position.average_price,
        current_price: position.current_price,
        value: position.total_value,
        pnl: position.pnl,
        change_percent: position.pnl_percentage,
        market_type: position.market_type
      })) || [],
      recent_trades: recentTrades?.map(trade => ({
        id: trade.id,
        symbol: trade.asset_symbol,
        name: trade.asset_name,
        type: trade.trade_type,
        quantity: trade.units,
        price: trade.price_per_unit,
        total: trade.total_amount,
        date: trade.created_at,
        open_date: trade.executed_at,
        closed_at: trade.closed_at,
        entry_price: trade.price_per_unit,
        exit_price: trade.close_price,
        pnl: trade.pnl,
        pnl_percentage: trade.pnl && trade.total_amount ? (trade.pnl / trade.total_amount) * 100 : 0
      })) || []
    };

    // Return the analytics data
    return new Response(JSON.stringify({ success: true, data: analytics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating portfolio analytics:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
