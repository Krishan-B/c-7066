
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
    
    // Get asset name for the symbol (in a real app would come from a lookup)
    const assetName = symbol.split('-')[0] || symbol;
    const marketType = symbol.includes('USD') ? 'Crypto' : 'Stocks';
    
    // Calculate trade value
    const tradeValue = units * currentPrice;
    
    // Insert trade record - use user_trades table instead of trades
    const { data, error } = await supabase
      .from('user_trades')
      .insert({
        user_id: userId,
        asset_symbol: symbol,
        asset_name: assetName,
        market_type: marketType,
        trade_type: direction, // Using trade_type instead of direction
        order_type: 'market',
        units: units,
        price_per_unit: currentPrice,
        total_amount: tradeValue,
        status: 'open',
        stop_loss: stopLoss,
        take_profit: takeProfit
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
