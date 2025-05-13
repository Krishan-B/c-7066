
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TradeRequest, TradeResult } from './types.ts';
import { 
  corsHeaders, 
  validateTradeRequest, 
  getSupabaseClient, 
  getUserFromToken 
} from './utils.ts';
import { executeMarketOrder, executeEntryOrder } from './orders.ts';

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    const { user, error: userError } = await getUserFromToken(supabase, authHeader);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: userError || 'User authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const tradeRequest: TradeRequest = await req.json();
    
    // Validate request
    if (!validateTradeRequest(tradeRequest)) {
      return new Response(
        JSON.stringify({ error: 'Invalid trade parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process based on order type
    let result: TradeResult;
    
    if (tradeRequest.orderType === 'market') {
      result = await executeMarketOrder(supabase, user.id, tradeRequest);
    } else {
      result = await executeEntryOrder(supabase, user.id, tradeRequest);
    }

    return new Response(
      JSON.stringify(result),
      { status: result.success ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing trade:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
