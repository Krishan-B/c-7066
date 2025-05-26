
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { TradeResult, MarketOrderParams } from '../types';

/**
 * Execute a market order through the Supabase edge function
 */
export async function executeMarketOrder(params: MarketOrderParams): Promise<TradeResult> {
  try {
    console.log('Executing market order:', params);
    
    const { data, error } = await supabase.functions.invoke('execute-trade', {
      body: {
        assetSymbol: params.symbol,
        assetName: params.symbol.replace('USD', ''), // Simplified - in production, pass the full name
        marketType: params.assetCategory || 'Crypto',
        units: params.units,
        pricePerUnit: params.currentPrice,
        tradeType: params.direction,
        orderType: 'market',
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit
      }
    });
    
    if (error) {
      console.error('Error executing market order:', error);
      return {
        success: false,
        message: error.message || 'Failed to execute trade',
        status: 'failed'
      };
    }
    
    console.log('Market order executed successfully:', data);
    
    return {
      success: true,
      tradeId: data.tradeId,
      message: data.message || 'Trade executed successfully',
      status: 'open'
    };
  } catch (error) {
    console.error('Exception executing market order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed'
    };
  }
}
