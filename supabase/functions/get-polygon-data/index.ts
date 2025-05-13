
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { symbol, market } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = Deno.env.get("POLYGON_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Polygon API key not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Determine which API to call
    let endpoint = '';
    
    if (market === 'crypto') {
      // Format for crypto is X:BTCUSD
      const formattedSymbol = symbol.includes('X:') ? symbol : `X:${symbol}`;
      endpoint = `/v2/aggs/ticker/${formattedSymbol}/prev`;
    } else if (market === 'forex') {
      // Format for forex is C:EURUSD
      const formattedSymbol = symbol.includes('C:') ? symbol : `C:${symbol}`;
      endpoint = `/v2/aggs/ticker/${formattedSymbol}/prev`;
    } else {
      // Default to stocks
      endpoint = `/v2/aggs/ticker/${symbol}/prev`;
    }
    
    const url = `https://api.polygon.io${endpoint}?apiKey=${apiKey}`;
    
    console.log(`Fetching data from Polygon.io: ${url.replace(apiKey, 'REDACTED')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Polygon API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing Polygon request:", error.message);
    
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
