import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TradeDirection } from "@/hooks/useTradeCalculations";
import { calculateMarginRequired } from "@/utils/leverageUtils";

export type OrderType = 'market' | 'entry';

export interface TradeParams {
  assetSymbol: string;
  assetName: string;
  marketType: string;
  units: number;
  pricePerUnit: number;
  tradeType: TradeDirection;
  orderType: OrderType;
  stopLoss?: number | null;
  takeProfit?: number | null;
  expirationDate?: Date | null;
}

export interface OrderResult {
  success: boolean;
  tradeId?: string;
  message: string;
}

export const executeMarketOrder = async (
  tradeParams: TradeParams
): Promise<OrderResult> => {
  try {
    // Calculate total amount
    const totalAmount = tradeParams.units * tradeParams.pricePerUnit;
    
    // Calculate required margin
    const marginRequired = calculateMarginRequired(
      tradeParams.marketType,
      totalAmount
    );
    
    // Get user's account
    const { data: accountData, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .single();
    
    if (accountError) {
      throw new Error(`Failed to get account data: ${accountError.message}`);
    }
    
    // Check if user has enough funds
    if (accountData.available_funds < marginRequired) {
      return {
        success: false,
        message: `Insufficient funds. Required: ${marginRequired.toFixed(2)}, Available: ${accountData.available_funds.toFixed(2)}`
      };
    }
    
    // Create the trade record
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
        order_type: tradeParams.orderType,
        status: tradeParams.orderType === 'market' ? 'open' : 'pending',
        stop_loss: tradeParams.stopLoss || null,
        take_profit: tradeParams.takeProfit || null,
        expiration_date: tradeParams.expirationDate || null,
        executed_at: tradeParams.orderType === 'market' ? new Date().toISOString() : null
      })
      .select()
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to create trade: ${tradeError.message}`);
    }
    
    // Update user account metrics
    const { error: updateError } = await supabase
      .from('user_account')
      .update({
        used_margin: accountData.used_margin + marginRequired,
        available_funds: accountData.available_funds - marginRequired,
        last_updated: new Date().toISOString()
      })
      .eq('id', accountData.id);
    
    if (updateError) {
      throw new Error(`Failed to update account: ${updateError.message}`);
    }
    
    // Update portfolio or create new position if needed
    await updatePortfolio(tradeParams);
    
    return {
      success: true,
      tradeId: tradeData.id,
      message: 'Trade executed successfully'
    };
  } catch (error) {
    console.error('Error executing market order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const executeEntryOrder = async (
  tradeParams: TradeParams
): Promise<OrderResult> => {
  try {
    // For entry orders, we validate the params but don't need to check
    // available funds immediately as they'll be used when the order executes
    
    // Calculate total amount
    const totalAmount = tradeParams.units * tradeParams.pricePerUnit;
    
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
        expiration_date: tradeParams.expirationDate || null
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

export const closePosition = async (
  tradeId: string,
  closePrice: number
): Promise<OrderResult> => {
  try {
    // Get trade details
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .select('*')
      .eq('id', tradeId)
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to get trade data: ${tradeError.message}`);
    }
    
    // Calculate P&L
    const pnl = tradeData.trade_type === 'buy'
      ? (closePrice - tradeData.price_per_unit) * tradeData.units
      : (tradeData.price_per_unit - closePrice) * tradeData.units;
    
    // Update trade to closed status
    const { error: updateError } = await supabase
      .from('user_trades')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        pnl: pnl
      })
      .eq('id', tradeId);
    
    if (updateError) {
      throw new Error(`Failed to close position: ${updateError.message}`);
    }
    
    // Calculate margin that was used for this position
    const marginRequired = calculateMarginRequired(
      tradeData.market_type,
      tradeData.total_amount
    );
    
    // Get user's account
    const { data: accountData, error: accountError } = await supabase
      .from('user_account')
      .select('*')
      .single();
    
    if (accountError) {
      throw new Error(`Failed to get account data: ${accountError.message}`);
    }
    
    // Update user account - release margin and update P&L and balance
    const { error: accountUpdateError } = await supabase
      .from('user_account')
      .update({
        used_margin: accountData.used_margin - marginRequired,
        available_funds: accountData.available_funds + marginRequired + pnl,
        realized_pnl: accountData.realized_pnl + pnl,
        balance: accountData.balance + pnl,
        last_updated: new Date().toISOString()
      })
      .eq('id', accountData.id);
    
    if (accountUpdateError) {
      throw new Error(`Failed to update account: ${accountUpdateError.message}`);
    }
    
    // Update portfolio
    await removeFromPortfolio(tradeData);
    
    return {
      success: true,
      tradeId: tradeId,
      message: `Position closed with P&L: ${pnl.toFixed(2)}`
    };
  } catch (error) {
    console.error('Error closing position:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const cancelPendingOrder = async (
  tradeId: string
): Promise<OrderResult> => {
  try {
    const { error } = await supabase
      .from('user_trades')
      .update({
        status: 'cancelled',
        closed_at: new Date().toISOString()
      })
      .eq('id', tradeId)
      .eq('status', 'pending');
    
    if (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
    
    return {
      success: true,
      tradeId: tradeId,
      message: 'Order cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Helper functions for portfolio management
async function updatePortfolio(tradeParams: TradeParams): Promise<void> {
  try {
    // Check if we already have this asset in the portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('asset_symbol', tradeParams.assetSymbol)
      .single();
    
    if (portfolioError && portfolioError.code !== 'PGRST116') {
      throw new Error(`Portfolio query failed: ${portfolioError.message}`);
    }
    
    if (!portfolioData) {
      // Create new portfolio entry
      await supabase
        .from('user_portfolio')
        .insert({
          asset_symbol: tradeParams.assetSymbol,
          asset_name: tradeParams.assetName,
          market_type: tradeParams.marketType,
          units: tradeParams.units,
          average_price: tradeParams.pricePerUnit,
          current_price: tradeParams.pricePerUnit,
          total_value: tradeParams.units * tradeParams.pricePerUnit,
          pnl: 0,
          pnl_percentage: 0,
        });
    } else {
      // Update existing portfolio entry
      const totalUnits = portfolioData.units + tradeParams.units;
      const totalCost = (portfolioData.average_price * portfolioData.units) + 
                        (tradeParams.pricePerUnit * tradeParams.units);
      const newAvgPrice = totalCost / totalUnits;
      
      await supabase
        .from('user_portfolio')
        .update({
          units: totalUnits,
          average_price: newAvgPrice,
          current_price: tradeParams.pricePerUnit,
          total_value: totalUnits * tradeParams.pricePerUnit,
          last_updated: new Date().toISOString()
        })
        .eq('id', portfolioData.id);
    }
  } catch (error) {
    console.error('Error updating portfolio:', error);
    // We don't want to fail the whole operation if portfolio update fails
    toast.error('Error updating portfolio. Please check your portfolio data.');
  }
}

async function removeFromPortfolio(trade: any): Promise<void> {
  try {
    // Check if we have this asset in the portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('asset_symbol', trade.asset_symbol)
      .single();
    
    if (portfolioError) {
      throw new Error(`Portfolio query failed: ${portfolioError.message}`);
    }
    
    if (portfolioData) {
      // If units match exactly, remove the entry
      if (Math.abs(portfolioData.units - trade.units) < 0.0001) {
        await supabase
          .from('user_portfolio')
          .delete()
          .eq('id', portfolioData.id);
      } else {
        // Otherwise, reduce the units
        const newUnits = portfolioData.units - trade.units;
        
        await supabase
          .from('user_portfolio')
          .update({
            units: newUnits,
            total_value: newUnits * portfolioData.current_price,
            last_updated: new Date().toISOString()
          })
          .eq('id', portfolioData.id);
      }
    }
  } catch (error) {
    console.error('Error updating portfolio on position close:', error);
    toast.error('Error updating portfolio. Please check your portfolio data.');
  }
}
