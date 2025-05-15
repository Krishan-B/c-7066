
import { TradeRequest, TradeResult } from './types.ts';
import { calculateMarginRequired, getUserAccount } from './utils.ts';
import { updatePortfolio } from './portfolio.ts';

/**
 * Execute a market order
 */
export async function executeMarketOrder(
  supabase: any, 
  userId: string, 
  params: TradeRequest
): Promise<TradeResult> {
  try {
    // Calculate total amount
    const totalAmount = params.units * params.pricePerUnit;
    
    // Calculate required margin
    const marginRequired = calculateMarginRequired(params.marketType, totalAmount);
    
    // Get user's account
    const { account, error: accountError } = await getUserAccount(supabase, userId);
    
    if (accountError) {
      throw new Error(accountError);
    }
    
    // Check if user has enough funds
    if (account!.available_funds < marginRequired) {
      return {
        success: false,
        message: `Insufficient funds. Required: ${marginRequired.toFixed(2)}, Available: ${account!.available_funds.toFixed(2)}`
      };
    }
    
    // Create the trade record
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .insert({
        user_id: userId,
        asset_symbol: params.assetSymbol,
        asset_name: params.assetName,
        market_type: params.marketType,
        units: params.units,
        price_per_unit: params.pricePerUnit,
        total_amount: totalAmount,
        trade_type: params.tradeType,
        order_type: params.orderType,
        status: 'open',
        stop_loss: params.stopLoss || null,
        take_profit: params.takeProfit || null,
        executed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to create trade: ${tradeError.message}`);
    }
    
    // Update user account metrics
    const { error: updateError } = await supabase
      .from('user_account')
      .update({
        used_margin: account!.used_margin + marginRequired,
        available_funds: account!.available_funds - marginRequired,
        unrealized_pnl: account!.unrealized_pnl || 0, // Ensure this field exists
        equity: account!.cash_balance + (account!.unrealized_pnl || 0), // Calculate equity
        last_updated: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      throw new Error(`Failed to update account: ${updateError.message}`);
    }
    
    // Update or create portfolio entry
    await updatePortfolio(supabase, userId, params);
    
    return {
      success: true,
      tradeId: tradeData.id,
      message: 'Trade executed successfully'
    };
  } catch (error) {
    console.error('Error processing market order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Execute an entry order (pending)
 */
export async function executeEntryOrder(
  supabase: any, 
  userId: string, 
  params: TradeRequest
): Promise<TradeResult> {
  try {
    // For entry orders, we validate but don't check funds until execution
    const totalAmount = params.units * params.pricePerUnit;
    
    // Get user's account to validate
    const { account, error: accountError } = await getUserAccount(supabase, userId);
    
    if (accountError) {
      throw new Error(accountError);
    }
    
    // Create the trade record as a pending order
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .insert({
        user_id: userId,
        asset_symbol: params.assetSymbol,
        asset_name: params.assetName,
        market_type: params.marketType,
        units: params.units,
        price_per_unit: params.pricePerUnit,
        total_amount: totalAmount,
        trade_type: params.tradeType,
        order_type: 'entry',
        status: 'pending',
        stop_loss: params.stopLoss || null,
        take_profit: params.takeProfit || null,
        expiration_date: params.expirationDate || null
      })
      .select()
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to create entry order: ${tradeError.message}`);
    }
    
    return {
      success: true,
      tradeId: tradeData.id,
      message: 'Entry order placed successfully'
    };
  } catch (error) {
    console.error('Error placing entry order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

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

/**
 * Cancel a pending order
 */
export async function cancelOrder(
  supabase: any,
  userId: string,
  tradeId: string
): Promise<TradeResult> {
  try {
    // Get the order to cancel
    const { data: trade, error: tradeError } = await supabase
      .from('user_trades')
      .select('*')
      .eq('id', tradeId)
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to fetch trade: ${tradeError.message}`);
    }
    
    if (trade.status !== 'pending') {
      return {
        success: false,
        message: `Order is not pending (current status: ${trade.status})`
      };
    }
    
    // Update trade record
    const { error: updateTradeError } = await supabase
      .from('user_trades')
      .update({
        status: 'cancelled',
        closed_at: new Date().toISOString()
      })
      .eq('id', tradeId);
    
    if (updateTradeError) {
      throw new Error(`Failed to update trade: ${updateTradeError.message}`);
    }
    
    return {
      success: true,
      message: 'Order cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
