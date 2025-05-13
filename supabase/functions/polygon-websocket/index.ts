
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
    const { action, symbols } = await req.json();
    
    // Get API key from environment
    const apiKey = Deno.env.get("POLYGON_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Polygon API key not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Handle WebSocket initialization
    if (action === "init") {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "WebSocket initialization data ready",
          key: apiKey
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Handle invalid action
    return new Response(
      JSON.stringify({ error: "Invalid action specified" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error("Error processing Polygon WebSocket request:", error.message);
    
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
