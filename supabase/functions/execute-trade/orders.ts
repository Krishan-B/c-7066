
import { TradeRequest, TradeResult } from './types.ts';
import { calculateMarginRequired } from './utils.ts';
import { updatePortfolio } from './portfolio.ts';
import { getUserAccount } from './utils.ts';

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
