import { supabase } from '@/integrations/supabase/client';

import { type EntryOrderParams, type TradeResult } from '../types';

/**
 * Place an entry order (limit/stop) through the Supabase edge function
 */
export async function placeEntryOrder(params: EntryOrderParams): Promise<TradeResult> {
  try {
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
        expirationDate: params.expiration,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to place entry order',
        status: 'failed',
      };
    }

    return {
      success: true,
      tradeId: data.tradeId,
      message: data.message || 'Entry order placed successfully',
      status: 'pending',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed',
    };
  }
}
