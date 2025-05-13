
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MarketOrderParams, TradeResult, TradeStatus } from "../types";

/**
 * Execute a market order (immediate execution)
 */
export async function executeMarketOrder(params: MarketOrderParams): Promise<TradeResult> {
  try {
    const { 
      symbol, 
      direction, 
      units, 
      currentPrice,
      stopLoss,
      takeProfit,
      userId 
    } = params;
    
    // In a real app, we would call the broker API here
    // For this simulation, we'll just record the trade in our database
    
    // Calculate trade value
    const tradeValue = units * currentPrice;
    
    // Insert trade record
    const { data, error } = await supabase
      .from('trades')
      .insert({
        user_id: userId,
        asset_symbol: symbol,
        direction,
        order_type: 'market',
        units,
        price_per_unit: currentPrice,
        status: 'open',
        stop_loss: stopLoss,
        take_profit: takeProfit,
        trade_value: tradeValue
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to execute market order: ${error.message}`);
    }
    
    return {
      success: true,
      tradeId: data.id,
      message: `Successfully executed ${direction} order for ${units} units of ${symbol} at ${currentPrice}`,
      status: 'open' as TradeStatus
    };
    
  } catch (error) {
    console.error("Market order execution error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: 'failed' as TradeStatus
    };
  }
}
