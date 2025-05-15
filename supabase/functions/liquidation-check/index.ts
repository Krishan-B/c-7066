
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function checks all open positions and liquidates those that fall below required margin
serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Define leverage map
    const LEVERAGE_MAP: Record<string, number> = {
      'Stocks': 20,
      'Indices': 50,
      'Commodities': 50,
      'Forex': 100,
      'Crypto': 50
    };
    
    // Check for user ID in request (if checking a specific user)
    const { userId } = await req.json().catch(() => ({}));
    let filter = {};
    
    if (userId) {
      filter = { user_id: userId };
    }
    
    // Fetch all users with open positions
    const { data: userAccounts, error: userError } = await supabase
      .from('user_account')
      .select('id, equity, used_margin')
      .filter('used_margin', 'gt', 0);
    
    if (userError) {
      throw new Error(`Error fetching user accounts: ${userError.message}`);
    }
    
    const liquidationResults = [];
    
    // Process each user account
    for (const account of userAccounts || []) {
      // Check if account is at risk (margin level below 20%)
      const marginLevel = (account.equity / account.used_margin) * 100;
      
      if (marginLevel <= 20) {
        console.log(`User ${account.id} has margin level ${marginLevel.toFixed(2)}% - checking positions for liquidation`);
        
        // Fetch open positions for user
        const { data: positions, error: positionsError } = await supabase
          .from('user_trades')
          .select('*')
          .eq('user_id', account.id)
          .eq('status', 'open');
          
        if (positionsError) {
          console.error(`Error fetching positions for user ${account.id}: ${positionsError.message}`);
          continue;
        }
        
        // Process each position
        for (const position of positions || []) {
          try {
            // Get latest price for the asset
            const { data: latestPrice, error: priceError } = await supabase
              .from('market_data')
              .select('price')
              .eq('symbol', position.asset_symbol)
              .single();
              
            if (priceError) {
              console.error(`Error fetching price data for ${position.asset_symbol}: ${priceError.message}`);
              continue;
            }
            
            const currentPrice = latestPrice.price;
            
            // Calculate liquidation price
            const leverage = LEVERAGE_MAP[position.market_type] || 1;
            const marginUsed = (position.price_per_unit * position.units) / leverage;
            const liquidationThreshold = marginUsed * 0.2; // 20% margin level
            
            let liquidationPrice;
            if (position.trade_type === 'buy') {
              liquidationPrice = position.price_per_unit - (liquidationThreshold / position.units);
            } else {
              liquidationPrice = position.price_per_unit + (liquidationThreshold / position.units);
            }
            
            // Check if position needs liquidation
            let shouldLiquidate = false;
            if (position.trade_type === 'buy') {
              shouldLiquidate = currentPrice <= liquidationPrice;
            } else {
              shouldLiquidate = currentPrice >= liquidationPrice;
            }
            
            if (shouldLiquidate || marginLevel < 10) { // Force liquidation if margin level extremely low
              console.log(`Liquidating position ${position.id} for user ${account.id}`);
              
              // Calculate P&L
              let profitLoss;
              if (position.trade_type === 'buy') {
                profitLoss = (currentPrice - position.price_per_unit) * position.units;
              } else {
                profitLoss = (position.price_per_unit - currentPrice) * position.units;
              }
              
              // Update the position as liquidated
              const { error: updateError } = await supabase
                .from('user_trades')
                .update({
                  status: 'liquidated',
                  closed_at: new Date().toISOString(),
                  close_price: currentPrice,
                  pnl: profitLoss
                })
                .eq('id', position.id);
                
              if (updateError) {
                console.error(`Error liquidating position ${position.id}: ${updateError.message}`);
                continue;
              }
              
              // Update portfolio
              await supabase.functions.invoke('portfolio-analytics', {
                body: { userId: account.id }
              });
              
              // Add to results
              liquidationResults.push({
                positionId: position.id,
                userId: account.id,
                symbol: position.asset_symbol,
                liquidationPrice: liquidationPrice,
                currentPrice: currentPrice,
                profitLoss: profitLoss
              });
            }
          } catch (err) {
            console.error(`Error processing position ${position.id}:`, err);
          }
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      liquidations: liquidationResults,
      message: `Checked ${userAccounts?.length || 0} accounts, liquidated ${liquidationResults.length} positions`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in liquidation check:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
