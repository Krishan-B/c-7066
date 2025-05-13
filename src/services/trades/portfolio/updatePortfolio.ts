
import { supabase } from "@/integrations/supabase/client";
import { PortfolioUpdateParams, PortfolioUpdateResult } from "../types";

/**
 * Update user's portfolio
 */
export async function updatePortfolio(params: PortfolioUpdateParams): Promise<PortfolioUpdateResult> {
  try {
    const { userId, assetId, amount, price, direction } = params;
    
    // Get existing portfolio entry
    const { data: existingEntry } = await supabase
      .from('user_portfolio')
      .select()
      .eq('user_id', userId)
      .eq('asset_id', assetId)
      .single();
    
    let result;
    
    if (existingEntry) {
      // Update existing entry
      const currentAmount = existingEntry.amount;
      const newAmount = direction === 'buy' 
        ? currentAmount + amount 
        : currentAmount - amount;
      
      // Calculate average price
      const avgPrice = direction === 'buy'
        ? ((currentAmount * existingEntry.avg_price) + (amount * price)) / (currentAmount + amount)
        : existingEntry.avg_price;
      
      result = await supabase
        .from('user_portfolio')
        .update({
          amount: newAmount,
          avg_price: avgPrice,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingEntry.id)
        .select();
    } else {
      // Create new entry
      result = await supabase
        .from('user_portfolio')
        .insert({
          user_id: userId,
          asset_id: assetId,
          amount: amount,
          avg_price: price,
          last_updated: new Date().toISOString()
        })
        .select();
    }
    
    if (result.error) {
      throw new Error(`Failed to update portfolio: ${result.error.message}`);
    }
    
    return {
      success: true,
      portfolioId: result.data[0].id,
      message: `Successfully updated portfolio for ${assetId}`
    };
    
  } catch (error) {
    console.error("Portfolio update error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
