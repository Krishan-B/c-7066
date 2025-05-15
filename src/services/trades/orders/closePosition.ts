
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { TradeResult } from '../types';

/**
 * Closes an open trade position
 */
export async function closePosition(
  tradeId: string,
  currentPrice: number
): Promise<TradeResult> {
  try {
    console.log(`Closing position ${tradeId} at price ${currentPrice}`);
    
    const { data, error } = await supabase.functions.invoke('execute-trade', {
      body: {
        action: 'close_position',
        tradeId,
        currentPrice
      }
    });
    
    if (error) {
      console.error('Error closing position:', error);
      return {
        success: false,
        message: error.message || 'Failed to close position',
        status: 'failed'
      };
    }
    
    console.log('Position closed successfully:', data);
    
    return {
      success: true,
      message: data.message || 'Position closed successfully',
      status: 'closed'
    };
  } catch (error) {
    console.error('Exception closing position:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed'
    };
  }
}
