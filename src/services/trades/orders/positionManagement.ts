import { supabase } from '@/integrations/supabase/client';

import { type TradeResult } from '../types';

/**
 * Close an open position at the current market price
 */
export async function closePosition(tradeId: string, currentPrice: number): Promise<TradeResult> {
  try {
    const { data: _data, error } = await supabase
      .from('user_trades')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        close_price: currentPrice,
        // PnL calculation should ideally be done server-side for accuracy
        // This is just a simple approximation
      })
      .eq('id', tradeId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to close position',
        status: 'failed',
      };
    }

    // Update user account by releasing margin
    if (_data) {
      // In a real implementation, we would call an edge function to handle
      // the complex account balance updates including margin release and PnL calculation
    }

    return {
      success: true,
      message: 'Position closed successfully',
      status: 'closed',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed',
    };
  }
}

/**
 * Cancel a pending order
 */
export async function cancelPendingOrder(tradeId: string): Promise<TradeResult> {
  try {
    const { data: _data, error } = await supabase
      .from('user_trades')
      .update({
        status: 'cancelled',
        closed_at: new Date().toISOString(),
      })
      .eq('id', tradeId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to cancel order',
        status: 'failed',
      };
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
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
