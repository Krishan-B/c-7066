
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate mock portfolio analytics
const generatePortfolioAnalytics = (userId: string) => {
  // In a real implementation, we would query user portfolio data from the database
  // For now, we'll generate mock data
  
  return {
    portfolio_value: 124567.89,
    daily_change: 1243.56,
    daily_change_percent: 1.02,
    total_gain: 24567.89,
    total_gain_percent: 24.56,
    cash_balance: 4215.89,
    locked_funds: 850.00,
    allocation: {
      stocks: 65,
      crypto: 20,
      commodities: 10,
      forex: 5,
    },
    performance: {
      '1D': 1.02,
      '1W': -0.5,
      '1M': 3.2,
      '3M': 8.7,
      '1Y': 12.4,
      'YTD': 9.8,
    },
    top_holdings: [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        value: 18750.25,
        allocation: 15.05,
        change_percent: 0.8,
        quantity: 120,
        price: 156.25,
        entry_price: 142.65,
        pnl: 1632.00,
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        value: 15230.40,
        allocation: 12.23,
        change_percent: 1.2,
        quantity: 45,
        price: 338.45,
        entry_price: 310.20,
        pnl: 1271.25,
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        value: 12450.30,
        allocation: 9.99,
        change_percent: -0.5,
        quantity: 85,
        price: 146.48,
        entry_price: 148.65,
        pnl: -184.45,
      },
      {
        symbol: "BTCUSD",
        name: "Bitcoin",
        value: 10500.00,
        allocation: 8.43,
        change_percent: 2.3,
        quantity: 0.25,
        price: 42000.00,
        entry_price: 36250.00,
        pnl: 1437.50,
      },
      {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        value: 9870.15,
        allocation: 7.92,
        change_percent: -0.3,
        quantity: 60,
        price: 164.50,
        entry_price: 166.25,
        pnl: -105.00,
      },
    ],
    recent_trades: [
      {
        id: "trade-1",
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        type: "buy",
        quantity: 10,
        price: 875.40,
        total: 8754.00,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        open_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        entry_price: 875.40,
        exit_price: 0,
        pnl: 0,
        pnl_percentage: 0,
      },
      {
        id: "trade-2",
        symbol: "TSLA",
        name: "Tesla Inc.",
        type: "sell",
        quantity: 5,
        price: 235.30,
        total: 1176.50,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        open_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        entry_price: 187.45,
        exit_price: 235.30,
        pnl: 239.25,
        pnl_percentage: 25.5,
      },
      {
        id: "trade-3",
        symbol: "ETHUSD",
        name: "Ethereum",
        type: "buy",
        quantity: 2.5,
        price: 3255.75,
        total: 8139.38,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        open_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        entry_price: 1890.50,
        exit_price: 0,
        pnl: 3413.13,
        pnl_percentage: 72.3,
      }
    ]
  };
};

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

    // Generate portfolio analytics
    const analytics = generatePortfolioAnalytics(userId);

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
