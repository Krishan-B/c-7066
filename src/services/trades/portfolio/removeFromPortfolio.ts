
import { supabase } from "@/integrations/supabase/client";
import { PortfolioRemoveParams, PortfolioUpdateResult } from "../types";

/**
 * Remove asset from user's portfolio
 */
export async function removeFromPortfolio(params: PortfolioRemoveParams): Promise<PortfolioUpdateResult> {
  try {
    const { userId, assetId } = params;
    
    // Delete the portfolio entry
    const { error } = await supabase
      .from('user_portfolio')
      .delete()
      .eq('user_id', userId)
      .eq('asset_id', assetId);
    
    if (error) {
      throw new Error(`Failed to remove asset from portfolio: ${error.message}`);
    }
    
    return {
      success: true,
      message: `Successfully removed ${assetId} from portfolio`
    };
    
  } catch (error) {
    console.error("Portfolio remove error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
