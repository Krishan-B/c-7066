
import { supabase } from "@/integrations/supabase/client";
import { TradeParams, OrderResult, OrderType } from "./types";
import { updatePortfolio, removeFromPortfolio } from "./portfolioService";
import { calculateMarginRequired } from "./leverageUtils";

/**
 * Executes a market order for immediate trade execution
 * @param tradeParams Parameters for the trade to be executed
 */
export const executeMarketOrder = async (
  tradeParams: TradeParams
): Promise<OrderResult> => {
  try {
    // Calculate total amount
    const totalAmount = tradeParams.units * tradeParams.pricePerUnit;
    
    // Calculate required margin
    const marginRequired = calculateMarginRequired(
      tradeParams.marketType,
      totalAmount
    );
    
    // Get user's account
    const { data: accountData, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .single();
    
    if (accountError) {
      throw new Error(`Failed to get account data: ${accountError.message}`);
    }
    
    // Check if user has enough funds
    if (accountData.available_funds < marginRequired) {
      return {
        success: false,
        message: `Insufficient funds. Required: ${marginRequired.toFixed(2)}, Available: ${accountData.available_funds.toFixed(2)}`
      };
    }
    
    // Create the trade record - Convert Date to ISO string for PostgreSQL
    const expirationDateString = tradeParams.expirationDate ? 
      tradeParams.expirationDate.toISOString() : null;
    
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .insert({
        asset_symbol: tradeParams.assetSymbol,
        asset_name: tradeParams.assetName,
        market_type: tradeParams.marketType,
        units: tradeParams.units,
        price_per_unit: tradeParams.pricePerUnit,
        total_amount: totalAmount,
        trade_type: tradeParams.tradeType,
        order_type: tradeParams.orderType,
        status: tradeParams.orderType === 'market' ? 'open' : 'pending',
        stop_loss: tradeParams.stopLoss || null,
        take_profit: tradeParams.takeProfit || null,
        expiration_date: expirationDateString,
        executed_at: tradeParams.orderType === 'market' ? new Date().toISOString() : null
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
        used_margin: accountData.used_margin + marginRequired,
        available_funds: accountData.available_funds - marginRequired,
        last_updated: new Date().toISOString()
      })
      .eq('id', accountData.id);
    
    if (updateError) {
      throw new Error(`Failed to update account: ${updateError.message}`);
    }
    
    // Update portfolio or create new position if needed
    await updatePortfolio(tradeParams);
    
    return {
      success: true,
      tradeId: tradeData.id,
      message: 'Trade executed successfully'
    };
  } catch (error) {
    console.error('Error executing market order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Places a pending entry order for future execution
 * @param tradeParams Parameters for the trade to be placed
 */
export const executeEntryOrder = async (
  tradeParams: TradeParams
): Promise<OrderResult> => {
  try {
    // For entry orders, we validate the params but don't need to check
    // available funds immediately as they'll be used when the order executes
    
    // Calculate total amount
    const totalAmount = tradeParams.units * tradeParams.pricePerUnit;
    
    // Convert Date to ISO string for PostgreSQL
    const expirationDateString = tradeParams.expirationDate ? 
      tradeParams.expirationDate.toISOString() : null;
    
    // Create the trade record as a pending order
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .insert({
        asset_symbol: tradeParams.assetSymbol,
        asset_name: tradeParams.assetName,
        market_type: tradeParams.marketType,
        units: tradeParams.units,
        price_per_unit: tradeParams.pricePerUnit,
        total_amount: totalAmount,
        trade_type: tradeParams.tradeType,
        order_type: 'entry',
        status: 'pending',
        stop_loss: tradeParams.stopLoss || null,
        take_profit: tradeParams.takeProfit || null,
        expiration_date: expirationDateString
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
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

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
