
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { TradeResult, MarketOrderParams } from '../types';
import { matchOrder } from './orderMatching';

/**
 * Execute a market order with enhanced matching logic, market hours validation,
 * and risk checks
 */
export async function executeMarketOrder(params: MarketOrderParams): Promise<TradeResult> {
  try {
    console.log('Executing market order:', params);

    // First attempt to match the order locally with enhanced logic
    const matchResult = await matchOrder({
      symbol: params.symbol,
      assetCategory: params.assetCategory,
      direction: params.direction,
      units: params.units,
      currentPrice: params.currentPrice,
      userId: params.userId,
      availableMargin: 10000, // TODO: Get from user's account
      currentDailyLoss: 0 // TODO: Calculate from today's trades
    });

    if (!matchResult.success) {
      return matchResult;
    }

    // If order matching succeeds, persist the trade
    const { data, error } = await supabase.functions.invoke('execute-trade', {
      body: {
        assetSymbol: params.symbol,
        assetName: params.symbol.replace('USD', ''),
        marketType: params.assetCategory,
        units: matchResult.filledUnits,
        pricePerUnit: matchResult.averagePrice,
        tradeType: params.direction,
        orderType: 'market',
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit,
        slippage: matchResult.slippage
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
