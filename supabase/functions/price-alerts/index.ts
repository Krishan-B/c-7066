
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
    const { operation, alert } = await req.json();
    
    if (!operation) {
      return new Response(
        JSON.stringify({ error: "Operation is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    let result;
    
    switch (operation) {
      case "get":
        // Get user's price alerts
        result = await supabase
          .from("price_alerts")
          .select("*")
          .eq("user_id", userId);
          
        return new Response(
          JSON.stringify({ data: result.data, error: result.error }),
          { headers: corsHeaders }
        );
        
      case "create":
        // Create new price alert
        if (!alert || !alert.asset_symbol || !alert.asset_name || !alert.market_type || !alert.target_price || !alert.condition) {
          return new Response(
            JSON.stringify({ error: "Alert details are required" }),
            { headers: corsHeaders, status: 400 }
          );
        }
        
        result = await supabase
          .from("price_alerts")
          .insert({
            user_id: userId,
            asset_symbol: alert.asset_symbol,
            asset_name: alert.asset_name,
            market_type: alert.market_type,
            target_price: alert.target_price,
            condition: alert.condition
          });
          
        return new Response(
          JSON.stringify({ data: "Alert created", error: result.error }),
          { headers: corsHeaders }
        );
        
      case "delete":
        // Delete price alert
        if (!alert || !alert.id) {
          return new Response(
            JSON.stringify({ error: "Alert ID is required" }),
            { headers: corsHeaders, status: 400 }
          );
        }
        
        result = await supabase
          .from("price_alerts")
          .delete()
          .eq("id", alert.id)
          .eq("user_id", userId);
          
        return new Response(
          JSON.stringify({ data: "Alert deleted", error: result.error }),
          { headers: corsHeaders }
        );
        
      case "check":
        // Check if any price alerts have been triggered
        // First, get all active alerts for the user
        const { data: alerts, error: alertsError } = await supabase
          .from("price_alerts")
          .select("*")
          .eq("user_id", userId)
          .eq("is_triggered", false);
          
        if (alertsError) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch alerts" }),
            { headers: corsHeaders, status: 500 }
          );
        }
        
        // Get current market data for the assets
        const symbols = [...new Set(alerts.map(a => a.asset_symbol))];
        const marketTypes = [...new Set(alerts.map(a => a.market_type))];
        
        const triggeredAlerts = [];
        
        for (const marketType of marketTypes) {
          const { data: marketData, error: marketError } = await supabase
            .from("market_data")
            .select("*")
            .in("symbol", symbols)
            .eq("market_type", marketType);
            
          if (marketError) {
            console.error("Error fetching market data:", marketError);
            continue;
          }
          
          // Check if any alerts have been triggered
          for (const alert of alerts) {
            const asset = marketData.find(m => 
              m.symbol === alert.asset_symbol && 
              m.market_type === alert.market_type
            );
            
            if (!asset) continue;
            
            let isTriggered = false;
            
            if (alert.condition === "above" && asset.price >= alert.target_price) {
              isTriggered = true;
            } else if (alert.condition === "below" && asset.price <= alert.target_price) {
              isTriggered = true;
            }
            
            if (isTriggered) {
              // Update the alert status
              const { error: updateError } = await supabase
                .from("price_alerts")
                .update({ 
                  is_triggered: true,
                  triggered_at: new Date().toISOString()
                })
                .eq("id", alert.id);
                
              if (!updateError) {
                triggeredAlerts.push({
                  ...alert,
                  current_price: asset.price
                });
              }
            }
          }
        }
        
        return new Response(
          JSON.stringify({ data: { triggered: triggeredAlerts } }),
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
