
import { TradeRequest, TradeResult } from './types.ts';
import { getUserAccount } from './utils.ts';

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
