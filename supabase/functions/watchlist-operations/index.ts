
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

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Extract the JWT token from request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid authorization header" }),
      { headers: corsHeaders, status: 401 }
    );
  }

  const jwt = authHeader.substring(7);
  
  try {
    // Verify the JWT token and get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: corsHeaders, status: 401 }
      );
    }
    
    const userId = user.id;
    const { operation, asset } = await req.json();
    
    if (!operation) {
      return new Response(
        JSON.stringify({ error: "Operation is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    let result;
    
    switch (operation) {
      case "get":
        // Get user's watchlist
        result = await supabase
          .from("user_watchlist")
          .select("*")
          .eq("user_id", userId);
          
        return new Response(
          JSON.stringify({ data: result.data, error: result.error }),
          { headers: corsHeaders }
        );
        
      case "add":
        // Add asset to watchlist
        if (!asset || !asset.symbol || !asset.name || !asset.market_type) {
          return new Response(
            JSON.stringify({ error: "Asset details are required" }),
            { headers: corsHeaders, status: 400 }
          );
        }
        
        // Check if the asset already exists in the watchlist
        const { data: existingAsset, error: checkError } = await supabase
          .from("user_watchlist")
          .select("*")
          .eq("user_id", userId)
          .eq("asset_symbol", asset.symbol)
          .eq("market_type", asset.market_type)
          .maybeSingle();
        
        if (checkError) {
          return new Response(
            JSON.stringify({ error: "Failed to check existing watchlist" }),
            { headers: corsHeaders, status: 500 }
          );
        }
        
        if (existingAsset) {
          return new Response(
            JSON.stringify({ message: "Asset already in watchlist" }),
            { headers: corsHeaders }
          );
        }
        
        // Add to watchlist
        result = await supabase
          .from("user_watchlist")
          .insert({
            user_id: userId,
            asset_symbol: asset.symbol,
            asset_name: asset.name,
            market_type: asset.market_type
          });
          
        return new Response(
          JSON.stringify({ data: "Asset added to watchlist", error: result.error }),
          { headers: corsHeaders }
        );
        
      case "remove":
        // Remove asset from watchlist
        if (!asset || !asset.symbol || !asset.market_type) {
          return new Response(
            JSON.stringify({ error: "Asset details are required" }),
            { headers: corsHeaders, status: 400 }
          );
        }
        
        result = await supabase
          .from("user_watchlist")
          .delete()
          .eq("user_id", userId)
          .eq("asset_symbol", asset.symbol)
          .eq("market_type", asset.market_type);
          
        return new Response(
          JSON.stringify({ data: "Asset removed from watchlist", error: result.error }),
          { headers: corsHeaders }
        );
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid operation" }),
          { headers: corsHeaders, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
