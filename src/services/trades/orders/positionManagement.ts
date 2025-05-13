
import { supabase } from "@/integrations/supabase/client";
import { OrderResult } from "../types";
import { calculateMarginRequired } from "../leverageUtils";
import { removeFromPortfolio } from "../portfolioService";

/**
 * Closes an open position
 * @param tradeId ID of the trade to close
 * @param closePrice Price at which to close the position
 */
export const closePosition = async (
  tradeId: string,
  closePrice: number
): Promise<OrderResult> => {
  try {
    // Get trade details
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .select('*')
      .eq('id', tradeId)
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to get trade data: ${tradeError.message}`);
    }
    
    // Calculate P&L
    const pnl = tradeData.trade_type === 'buy'
      ? (closePrice - tradeData.price_per_unit) * tradeData.units
      : (tradeData.price_per_unit - closePrice) * tradeData.units;
    
    // Update trade to closed status
    const { error: updateError } = await supabase
      .from('user_trades')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        pnl: pnl
      })
      .eq('id', tradeId);
    
    if (updateError) {
      throw new Error(`Failed to close position: ${updateError.message}`);
    }
    
    // Calculate margin that was used for this position
    const marginRequired = calculateMarginRequired(
      tradeData.market_type,
      tradeData.total_amount
    );
    
    // Get user's account
    const { data: accountData, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .single();
    
    if (accountError) {
      throw new Error(`Failed to get account data: ${accountError.message}`);
    }
    
    // Update user account - release margin and update P&L and balance
    // Use cash_balance instead of balance
    const { error: accountUpdateError } = await supabase
      .from('user_account')
      .update({
        used_margin: accountData.used_margin - marginRequired,
        available_funds: accountData.available_funds + marginRequired + pnl,
        realized_pnl: accountData.realized_pnl + pnl,
        cash_balance: accountData.cash_balance + pnl,
        last_updated: new Date().toISOString()
      })
      .eq('id', accountData.id);
    
    if (accountUpdateError) {
      throw new Error(`Failed to update account: ${accountUpdateError.message}`);
    }
    
    // Update portfolio
    await removeFromPortfolio(tradeData);
    
    return {
      success: true,
      tradeId: tradeId,
      message: `Position closed with P&L: ${pnl.toFixed(2)}`
    };
  } catch (error) {
    console.error('Error closing position:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Cancels a pending order
 * @param tradeId ID of the order to cancel
 */
export const cancelPendingOrder = async (
  tradeId: string
): Promise<OrderResult> => {
  try {
    const { error } = await supabase
      .from('user_trades')
      .update({
        status: 'cancelled',
        closed_at: new Date().toISOString()
      })
      .eq('id', tradeId)
      .eq('status', 'pending');
    
    if (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
    
    return {
      success: true,
      tradeId: tradeId,
      message: 'Order cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
