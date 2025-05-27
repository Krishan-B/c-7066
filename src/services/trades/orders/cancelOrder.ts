
import { supabase } from '@/integrations/supabase/client';
import { type TradeResult } from '../types';

/**
 * Cancels a pending order
 */
export async function cancelPendingOrder(
  tradeId: string
): Promise<TradeResult> {
  try {
    console.log(`Cancelling order ${tradeId}`);
    
    const { data, error } = await supabase.functions.invoke('execute-trade', {
      body: {
        action: 'cancel_order',
        tradeId
      }
    });
    
    if (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel order',
        status: 'failed'
      };
    }
    
    console.log('Order cancelled successfully:', data);
    
    return {
      success: true,
      message: data.message || 'Order cancelled successfully',
      status: 'cancelled'
    };
  } catch (error) {
    console.error('Exception cancelling order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed'
    };
  }
}
