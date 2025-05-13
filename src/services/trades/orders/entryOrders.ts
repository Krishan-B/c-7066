
import { supabase } from "@/integrations/supabase/client";
import { TradeParams, OrderResult } from "../types";

/**
 * Places a pending entry order for future execution
 * @param tradeParams Parameters for the trade to be placed
 */
export const executeEntryOrder = async (
  tradeParams: TradeParams
): Promise<OrderResult> => {
  try {
    // For entry orders, we validate the params but don't need to check
    // available funds immediately as they'll be used when the order executes
    
    // Calculate total amount
    const totalAmount = tradeParams.units * tradeParams.pricePerUnit;
    
    // Convert Date to ISO string for PostgreSQL
    const expirationDateString = tradeParams.expirationDate ? 
      tradeParams.expirationDate.toISOString() : null;
    
    // Create the trade record as a pending order
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .insert({
        asset_symbol: tradeParams.assetSymbol,
        asset_name: tradeParams.assetName,
        market_type: tradeParams.marketType,
        units: tradeParams.units,
        price_per_unit: tradeParams.pricePerUnit,
        total_amount: totalAmount,
        trade_type: tradeParams.tradeType,
        order_type: 'entry',
        status: 'pending',
        stop_loss: tradeParams.stopLoss || null,
        take_profit: tradeParams.takeProfit || null,
        expiration_date: expirationDateString
      })
      .select()
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to create entry order: ${tradeError.message}`);
    }
    
    return {
      success: true,
      tradeId: tradeData.id,
      message: 'Entry order placed successfully'
    };
  } catch (error) {
    console.error('Error placing entry order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
