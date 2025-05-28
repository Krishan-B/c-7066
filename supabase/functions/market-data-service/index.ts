
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./utils/cors.ts";
import { 
  updateDatabaseWithMarketData,
  fetchYahooFinanceData, 
  fetchAlphaVantageForexData, 
  fetchCoinGeckoData 
} from "./api/data-sources.ts";
import { checkCachedData } from "./utils/cache-helper.ts";
import type { Asset } from "./types.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketType, symbols, forceRefresh } = await req.json();
    console.log(`Fetching ${marketType} data for symbols: ${symbols}`);
    
    if (!marketType) {
      throw new Error("Market type is required");
    }

    // Check if we have recent data (within last 15 minutes) unless force refresh is specified
    if (!forceRefresh) {
      const cachedData = await checkCachedData(supabase, marketType, symbols);
      if (cachedData) {
        return new Response(JSON.stringify({ 
          success: true, 
          data: cachedData,
          source: 'cache'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    
    // Determine which source to use based on market type
    let marketData: Asset[] = [];
    
    switch(marketType.toLowerCase()) {
      case 'stock':
      case 'stocks':
        marketData = await fetchYahooFinanceData(symbols);
        break;
      case 'forex':
        marketData = await fetchAlphaVantageForexData(symbols);
        break;
      case 'crypto':
      case 'cryptocurrency':
        marketData = await fetchCoinGeckoData(symbols);
        break;
      case 'index':
      case 'indices':
        marketData = await fetchYahooFinanceData(symbols);
        break;
      case 'commodity':
      case 'commodities':
        marketData = await fetchAlphaVantageForexData(symbols); // Alpha Vantage also supports commodities
        break;
      default:
        throw new Error(`Unsupported market type: ${marketType}`);
    }
    
    // Update the database with the fetched data
    await updateDatabaseWithMarketData(supabase, marketData, marketType);

    // Return the fetched market data
    return new Response(JSON.stringify({ 
      success: true, 
      data: marketData,
      source: 'api'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error fetching market data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
