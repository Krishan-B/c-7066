import { supabase } from "@/integrations/supabase/client";
import { PortfolioUpdateParams, PortfolioUpdateResult } from "../types";

/**
 * Update user portfolio with a new trade
 */
export async function updatePortfolio(params: PortfolioUpdateParams): Promise<PortfolioUpdateResult> {
  try {
    const { userId, assetId, amount, price, direction } = params;
    
    // Get asset name for the symbol (in a real app would come from a lookup)
    const assetName = assetId.split('-')[0] || assetId;
    const marketType = assetId.includes('USD') ? 'Crypto' : 'Stocks';
    
    // Check if the asset already exists in the portfolio
    const { data: existingAsset, error: fetchError } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_symbol', assetId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
      throw new Error(`Failed to check portfolio: ${fetchError.message}`);
    }
    
    let newUnits = amount;
    let newAveragePrice = price;
    
    // Calculate new position if asset already exists
    if (existingAsset) {
      const currentUnits = existingAsset.units;
      
      if (direction === 'buy') {
        // Increase position
        const totalValue = (currentUnits * existingAsset.average_price) + (amount * price);
        newUnits = currentUnits + amount;
        newAveragePrice = totalValue / newUnits;
      } else {
        // Decrease position
        newUnits = currentUnits - amount;
        // Keep the same average price when selling
        newAveragePrice = existingAsset.average_price;
      }
    }
    
    // Calculate PnL
    const currentValue = newUnits * price;
    const costBasis = newUnits * newAveragePrice;
    const pnl = currentValue - costBasis;
    const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    
    // Create or update portfolio entry
    if (existingAsset) {
      // If units are zero or negative after selling, remove from portfolio
      if (newUnits <= 0) {
        const { error } = await supabase
          .from('user_portfolio')
          .delete()
          .eq('id', existingAsset.id);
        
        if (error) {
          throw new Error(`Failed to remove asset from portfolio: ${error.message}`);
        }
        
        return {
          success: true,
          message: `${assetId} removed from portfolio`
        };
      }
      
      // Update existing entry
      const { data, error } = await supabase
        .from('user_portfolio')
        .update({
          units: newUnits,
          average_price: newAveragePrice,
          current_price: price,
          total_value: currentValue,
          pnl: pnl,
          pnl_percentage: pnlPercentage,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingAsset.id)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to update portfolio: ${error.message}`);
      }
      
      return {
        success: true,
        portfolioId: data.id,
        message: `Portfolio updated for ${assetId}`
      };
      
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('user_portfolio')
        .insert({
          user_id: userId,
          asset_symbol: assetId,
          asset_name: assetName,
          market_type: marketType,
          units: newUnits,
          average_price: newAveragePrice,
          current_price: price,
          total_value: currentValue,
          pnl: pnl,
          pnl_percentage: pnlPercentage
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to add asset to portfolio: ${error.message}`);
      }
      
      return {
        success: true,
        portfolioId: data.id,
        message: `${assetId} added to portfolio`
      };
    }
    
  } catch (error) {
    console.error("Portfolio update error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
