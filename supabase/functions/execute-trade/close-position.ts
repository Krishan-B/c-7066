
import { TradeResult } from './types.ts';
import { calculateMarginRequired, getUserAccount } from './utils.ts';

/**
 * Close an open position
 */
export async function closePosition(
  supabase: any,
  userId: string,
  tradeId: string,
  closePrice: number
): Promise<TradeResult> {
  try {
    // Get the trade to close
    const { data: trade, error: tradeError } = await supabase
      .from('user_trades')
      .select('*')
      .eq('id', tradeId)
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to fetch trade: ${tradeError.message}`);
    }
    
    if (trade.status !== 'open') {
      return {
        success: false,
        message: `Trade is not open (current status: ${trade.status})`
      };
    }
    
    // Calculate profit/loss
    const pnl = trade.trade_type === 'buy'
      ? (closePrice - trade.price_per_unit) * trade.units
      : (trade.price_per_unit - closePrice) * trade.units;
    
    // Calculate margin to be released
    const marginRequired = calculateMarginRequired(trade.market_type, trade.total_amount);
    
    // Get user account
    const { account, error: accountError } = await getUserAccount(supabase, userId);
    
    if (accountError) {
      throw new Error(accountError);
    }
    
    // Update trade record
    const { error: updateTradeError } = await supabase
      .from('user_trades')
      .update({
        status: 'closed',
        close_price: closePrice,
        closed_at: new Date().toISOString(),
        pnl: pnl
      })
      .eq('id', tradeId);
    
    if (updateTradeError) {
      throw new Error(`Failed to update trade: ${updateTradeError.message}`);
    }
    
    // Update user account
    const { error: updateAccountError } = await supabase
      .from('user_account')
      .update({
        cash_balance: account!.cash_balance + pnl,
        equity: account!.cash_balance + pnl + (account!.unrealized_pnl - pnl || 0),
        used_margin: Math.max(0, account!.used_margin - marginRequired),
        available_funds: account!.available_funds + marginRequired,
        realized_pnl: (account!.realized_pnl || 0) + pnl,
        unrealized_pnl: Math.max(0, (account!.unrealized_pnl || 0) - pnl),
        last_updated: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateAccountError) {
      throw new Error(`Failed to update account: ${updateAccountError.message}`);
    }
    
    // Update portfolio if needed
    // This should either reduce position size or remove entirely
    
    return {
      success: true,
      message: `Position closed at ${closePrice}. P&L: ${pnl.toFixed(2)}`
    };
  } catch (error) {
    console.error('Error closing position:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
