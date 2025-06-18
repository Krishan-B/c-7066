import { supabase } from '@/integrations/supabase/client';

import { type TradeResult } from '../types';

/**
 * Closes an open trade position
 */
export async function closePosition(tradeId: string, currentPrice: number): Promise<TradeResult> {
  try {
    const { data, error } = await supabase.functions.invoke('execute-trade', {
      body: {
        action: 'close_position',
        tradeId,
        currentPrice,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to close position',
        status: 'failed',
      };
    }

    return {
      success: true,
      message: data.message || 'Position closed successfully',
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
