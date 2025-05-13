
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
    const { symbol } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get Finnhub API key from environment
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Finnhub API key not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch data from Finnhub API
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the quote data
    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        source: "Finnhub.io" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data from Finnhub:", error.message);
    
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
