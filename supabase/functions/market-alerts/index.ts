
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate mock alerts based on market conditions
const generateMarketAlerts = () => {
  return [
    {
      id: "alert-1",
      type: "price_movement",
      symbol: "BTCUSD",
      name: "Bitcoin",
      message: "Bitcoin price surged 5% in the last hour",
      importance: "high",
      created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    },
    {
      id: "alert-2",
      type: "news",
      symbol: "AAPL",
      name: "Apple Inc.",
      message: "Apple announces new product launch event for next week",
      importance: "medium",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "alert-3",
      type: "technical",
      symbol: "US500",
      name: "S&P 500",
      message: "S&P 500 approaching key resistance level at 5,250",
      importance: "medium",
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "alert-4",
      type: "price_movement",
      symbol: "META",
      name: "Meta Platforms Inc.",
      message: "META down 3% following regulatory news",
      importance: "medium",
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString()
    },
    {
      id: "alert-5",
      type: "earnings",
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      message: "NVIDIA reports earnings today after market close",
      importance: "high",
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
  ];
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get alerts
    const alerts = generateMarketAlerts();
    
    // Return the alerts
    return new Response(JSON.stringify({ success: true, data: alerts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching market alerts:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
