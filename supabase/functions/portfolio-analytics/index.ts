
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Handle OPTIONS preflight requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get user account info
    const { data: accountData, error: accountError } = await supabase
      .from("user_account")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (accountError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user account data" }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    // Get user portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("user_portfolio")
      .select("*")
      .eq("user_id", userId);
      
    if (portfolioError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user portfolio data" }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    // Get recent trades
    const { data: recentTrades, error: tradesError } = await supabase
      .from("user_trades")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (tradesError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user trades data" }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    // Calculate portfolio allocation
    const allocation: {[key: string]: number} = {};
    let totalValue = 0;
    
    portfolioData.forEach(asset => {
      totalValue += asset.total_value;
      
      if (allocation[asset.market_type]) {
        allocation[asset.market_type] += asset.total_value;
      } else {
        allocation[asset.market_type] = asset.total_value;
      }
    });
    
    // Convert allocation to percentages
    Object.keys(allocation).forEach(key => {
      allocation[key] = (allocation[key] / totalValue) * 100;
    });
    
    // Create mock performance data for chart
    const performanceData: {[key: string]: number} = {};
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    let currentValue = accountData.cash_balance + totalValue;
    let percentChange = 0;
    
    // Generate monthly data points
    for (let i = 0; i <= 12; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random fluctuation between -3% and +5%
      const randomChange = ((Math.random() * 8) - 3);
      percentChange += randomChange;
      
      performanceData[dateStr] = percentChange;
    }
    
    // Format top holdings for the UI
    const topHoldings = portfolioData.map(asset => ({
      symbol: asset.asset_symbol,
      name: asset.asset_name,
      value: asset.total_value,
      allocation: (asset.total_value / totalValue) * 100,
      change_percent: asset.pnl_percentage,
      quantity: asset.units,
      price: asset.current_price,
      entry_price: asset.average_price,
      pnl: asset.pnl
    }));
    
    // Calculate portfolio metrics
    const dailyChange = Math.random() * 200 - 100; // Random value between -100 and 100
    const dailyChangePercent = (dailyChange / (accountData.equity - dailyChange)) * 100;
    
    const analyticsData = {
      portfolio_value: totalValue,
      daily_change: dailyChange,
      daily_change_percent: dailyChangePercent,
      total_gain: accountData.realized_pnl + accountData.unrealized_pnl,
      total_gain_percent: ((accountData.realized_pnl + accountData.unrealized_pnl) / accountData.cash_balance) * 100,
      cash_balance: accountData.cash_balance,
      locked_funds: accountData.used_margin,
      allocation: allocation,
      performance: performanceData,
      top_holdings: topHoldings,
      recent_trades: recentTrades
    };
    
    return new Response(
      JSON.stringify({ data: analyticsData }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
