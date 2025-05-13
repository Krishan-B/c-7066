
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EntryOrderParams, TradeResult, TradeStatus } from "../types";

/**
 * Place an entry order (execution at specified price)
 */
export async function placeEntryOrder(params: EntryOrderParams): Promise<TradeResult> {
  try {
    const { 
      symbol, 
      direction, 
      units, 
      entryPrice,
      currentPrice,
      stopLoss,
      takeProfit,
      expiration,
      userId 
    } = params;
    
    // Get asset name for the symbol (in a real app would come from a lookup)
    const assetName = symbol.split('-')[0] || symbol;
    const marketType = symbol.includes('USD') ? 'Crypto' : 'Stocks';
    
    // Insert pending order record - use user_trades table instead of trades
    const { data, error } = await supabase
      .from('user_trades')
      .insert({
        user_id: userId,
        asset_symbol: symbol,
        asset_name: assetName,
        market_type: marketType,
        trade_type: direction,  // Using trade_type instead of direction
        order_type: 'entry',
        units: units,
        price_per_unit: entryPrice,
        total_amount: units * entryPrice,
        status: 'pending',
        stop_loss: stopLoss,
        take_profit: takeProfit,
        expiration_date: expiration
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to place entry order: ${error.message}`);
    }
    
    return {
      success: true,
      tradeId: data.id,
      message: `Successfully placed ${direction} entry order for ${units} units of ${symbol} at ${entryPrice}`,
      status: 'pending' as TradeStatus
    };
    
  } catch (error) {
    console.error("Entry order placement error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: 'failed' as TradeStatus
    };
  }
}

// Alias for backwards compatibility
export const executeEntryOrder = placeEntryOrder;
