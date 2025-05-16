
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
  // Determine if this is a paper trade
  const isPaperTrade = params.isPaperTrade || false;
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
    
    // Check if user has enough funds based on account type
    const availableFunds = isPaperTrade
      ? (account!.paper_trading_available_funds || 0)
      : account!.available_funds;
      
    if (availableFunds < marginRequired) {
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
    
    // Update user account metrics based on account type
    const updateFields = isPaperTrade ? {
      paper_trading_used_margin: (account!.paper_trading_used_margin || 0) + marginRequired,
      paper_trading_available_funds: (account!.paper_trading_available_funds || 0) - marginRequired,
      paper_trading_unrealized_pnl: account!.paper_trading_unrealized_pnl || 0,
      paper_trading_equity: (account!.paper_trading_balance || 0) + (account!.paper_trading_unrealized_pnl || 0),
      last_updated: new Date().toISOString()
    } : {
      used_margin: account!.used_margin + marginRequired,
      available_funds: account!.available_funds - marginRequired,
      unrealized_pnl: account!.unrealized_pnl || 0,
      equity: account!.cash_balance + (account!.unrealized_pnl || 0),
      last_updated: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('user_account')
      .update(updateFields
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
