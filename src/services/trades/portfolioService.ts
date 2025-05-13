import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TradeParams } from "./types";

/**
 * Updates the user's portfolio after executing a trade
 */
export async function updatePortfolio(tradeParams: TradeParams): Promise<void> {
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

/**
 * Removes a position from the user's portfolio after closing a trade
 */
export async function removeFromPortfolio(trade: any): Promise<void> {
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
