
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { TradeResult, EntryOrderParams } from '../types';

/**
 * Place an entry order (limit/stop) through the Supabase edge function
 */
export async function placeEntryOrder(params: EntryOrderParams): Promise<TradeResult> {
  try {
    console.log('Placing entry order:', params);
    
    const { data, error } = await supabase.functions.invoke('execute-trade', {
      body: {
        assetSymbol: params.symbol,
        assetName: params.symbol.replace('USD', ''), // Simplified - in production, pass the full name
        marketType: params.assetCategory || 'Crypto',
        units: params.units,
        pricePerUnit: params.entryPrice,
        tradeType: params.direction,
        orderType: 'entry',
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit,
        expirationDate: params.expiration
      }
    });
    
    if (error) {
      console.error('Error placing entry order:', error);
      return {
        success: false,
        message: error.message || 'Failed to place entry order',
        status: 'failed'
      };
    }
    
    console.log('Entry order placed successfully:', data);
    
    return {
      success: true,
      tradeId: data.tradeId,
      message: data.message || 'Entry order placed successfully',
      status: 'pending'
    };
  } catch (error) {
    console.error('Exception placing entry order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed'
    };
  }
}
