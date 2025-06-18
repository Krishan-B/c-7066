import { supabase } from '@/integrations/supabase/client';

import { type TradeResult } from '../types';

/**
 * Cancels a pending order
 */
export async function cancelPendingOrder(tradeId: string): Promise<TradeResult> {
  try {
    const { data, error } = await supabase.functions.invoke('execute-trade', {
      body: {
        action: 'cancel_order',
        tradeId,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to cancel order',
        status: 'failed',
      };
    }

    return {
      success: true,
      message: data.message || 'Order cancelled successfully',
      status: 'cancelled',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed',
    };
  }
}
