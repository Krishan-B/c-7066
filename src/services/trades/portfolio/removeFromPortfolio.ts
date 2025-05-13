
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      if (shouldRemoveEntry(portfolioData, trade)) {
        await removeEntry(portfolioData.id);
      } else {
        await reduceUnits(portfolioData, trade);
      }
    }
  } catch (error) {
    console.error('Error updating portfolio on position close:', error);
    toast.error('Error updating portfolio. Please check your portfolio data.');
  }
}

/**
 * Check if the portfolio entry should be removed entirely
 */
function shouldRemoveEntry(portfolioData: any, trade: any): boolean {
  return Math.abs(portfolioData.units - trade.units) < 0.0001;
}

/**
 * Remove portfolio entry from the database
 */
async function removeEntry(portfolioId: string): Promise<void> {
  await supabase
    .from('user_portfolio')
    .delete()
    .eq('id', portfolioId);
}

/**
 * Reduce the units in portfolio entry
 */
async function reduceUnits(portfolioData: any, trade: any): Promise<void> {
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
