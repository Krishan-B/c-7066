
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./utils/cors.ts";
import { assetGenerators, generateMarketData, updateDatabaseWithMarketData } from "./market-data.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Handles the request, fetches market data, and updates the database
 */
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the market type from the request
    const { market } = await req.json();
    
    if (!market) {
      throw new Error("Market type is required");
    }

    // Generate market data for the specified market
    const marketData = generateMarketData(market, assetGenerators);
    
    // Update the database with the generated data
    await updateDatabaseWithMarketData(marketData, supabase);

    // Return the generated market data
    return new Response(JSON.stringify({ success: true, data: marketData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
