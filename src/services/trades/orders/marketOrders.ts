
import { supabase } from "@/integrations/supabase/client";
import { TradeParams, OrderResult } from "../types";
import { calculateMarginRequired } from "../leverageUtils";
import { updatePortfolio } from "../portfolioService";

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
