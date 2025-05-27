
import { type TradeResult } from './types.ts';

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
