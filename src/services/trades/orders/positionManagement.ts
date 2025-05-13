
import { supabase } from "@/integrations/supabase/client";
import { TradeResult, TradeStatus } from "../types";

/**
 * Close an open position
 */
export async function closePosition(
  tradeId: string, 
  closePrice: number
): Promise<TradeResult> {
  try {
    // Fetch the trade first to get details
    const { data: trade, error: fetchError } = await supabase
      .from('trades')
      .select()
      .eq('id', tradeId)
      .single();
      
    if (fetchError) {
      throw new Error(`Failed to fetch trade: ${fetchError.message}`);
    }
    
    if (trade.status !== 'open') {
      throw new Error(`Cannot close position with status: ${trade.status}`);
    }
    
    // Calculate profit/loss
    const openPrice = trade.price_per_unit;
    const units = trade.units;
    const direction = trade.direction;
    
    let pnl = 0;
    if (direction === 'buy') {
      // For buy positions, profit = (closePrice - openPrice) * units
      pnl = (closePrice - openPrice) * units;
    } else {
      // For sell positions, profit = (openPrice - closePrice) * units
      pnl = (openPrice - closePrice) * units;
    }
    
    // Update the trade record
    const { data, error } = await supabase
      .from('trades')
      .update({
        status: 'closed',
        close_price: closePrice,
        close_date: new Date().toISOString(),
        pnl: pnl
      })
      .eq('id', tradeId)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to close position: ${error.message}`);
    }
    
    return {
      success: true,
      tradeId: data.id,
      message: `Successfully closed position with profit/loss of ${pnl.toFixed(2)}`,
      status: 'closed' as TradeStatus
    };
    
  } catch (error) {
    console.error("Close position error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: 'failed' as TradeStatus
    };
  }
}

/**
 * Cancel a pending order
 */
export async function cancelOrder(orderId: string): Promise<TradeResult> {
  try {
    // Update the order status
    const { data, error } = await supabase
      .from('trades')
      .update({
        status: 'cancelled',
        close_date: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
    
    return {
      success: true,
      tradeId: data.id,
      message: `Successfully cancelled order`,
      status: 'cancelled' as TradeStatus
    };
    
  } catch (error) {
    console.error("Cancel order error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: 'failed' as TradeStatus
    };
  }
}
