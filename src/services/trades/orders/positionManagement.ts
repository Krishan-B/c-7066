
import { supabase } from "@/integrations/supabase/client";
import { TradeResult, TradeStatus } from "../types";

/**
 * Close an open position
 * @param tradeId ID of the trade to close
 * @param currentPrice Current market price
 */
export async function closePosition(
  tradeId: string,
  currentPrice: number
): Promise<TradeResult> {
  try {
    // Get the trade to close
    const { data: trade, error: fetchError } = await supabase
      .from('user_trades')
      .select('*')
      .eq('id', tradeId)
      .eq('status', 'open')
      .single();
      
    if (fetchError || !trade) {
      throw new Error(`Failed to fetch trade: ${fetchError?.message || 'Trade not found'}`);
    }
    
    // Calculate profit/loss
    const openPrice = trade.price_per_unit;
    const units = trade.units;
    const direction = trade.trade_type;
    
    let pnl = 0;
    if (direction === 'buy') {
      pnl = (currentPrice - openPrice) * units;
    } else {
      pnl = (openPrice - currentPrice) * units;
    }
    
    // Update trade record
    const { data, error } = await supabase
      .from('user_trades')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        price_per_unit: currentPrice, // Final price
        pnl: pnl
      })
      .eq('id', tradeId)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to close position: ${error.message}`);
    }
    
    // Update user's account balance
    await updateUserBalance(trade.user_id, pnl);
    
    return {
      success: true,
      tradeId,
      message: `Successfully closed position with ${pnl >= 0 ? 'profit' : 'loss'} of ${Math.abs(pnl).toFixed(2)}`,
      status: 'closed' as TradeStatus
    };
    
  } catch (error) {
    console.error("Position closing error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: 'failed' as TradeStatus
    };
  }
}

/**
 * Cancel a pending order
 * @param tradeId ID of the order to cancel
 */
export async function cancelPendingOrder(tradeId: string): Promise<TradeResult> {
  try {
    // Get the order to cancel
    const { data: trade, error: fetchError } = await supabase
      .from('user_trades')
      .select('*')
      .eq('id', tradeId)
      .eq('status', 'pending')
      .single();
      
    if (fetchError || !trade) {
      throw new Error(`Failed to fetch order: ${fetchError?.message || 'Order not found'}`);
    }
    
    // Update order record
    const { error } = await supabase
      .from('user_trades')
      .update({
        status: 'cancelled',
        closed_at: new Date().toISOString()
      })
      .eq('id', tradeId);
      
    if (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
    
    return {
      success: true,
      tradeId,
      message: `Successfully cancelled order for ${trade.units} units of ${trade.asset_symbol}`,
      status: 'cancelled' as TradeStatus
    };
    
  } catch (error) {
    console.error("Order cancellation error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: 'failed' as TradeStatus
    };
  }
}

/**
 * Update user account balance after closing a position
 */
async function updateUserBalance(userId: string, pnl: number): Promise<void> {
  try {
    // Get current balance
    const { data: account, error: fetchError } = await supabase
      .from('user_account')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError || !account) {
      console.error(`Failed to fetch user account: ${fetchError?.message || 'Account not found'}`);
      return;
    }
    
    // Calculate new balance and realized P&L
    const newBalance = account.cash_balance + pnl;
    const newRealizedPnl = account.realized_pnl + pnl;
    
    // Update account
    const { error } = await supabase
      .from('user_account')
      .update({
        cash_balance: newBalance,
        realized_pnl: newRealizedPnl,
        last_updated: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      console.error(`Failed to update user balance: ${error.message}`);
    }
  } catch (error) {
    console.error("Error updating user balance:", error);
  }
}
