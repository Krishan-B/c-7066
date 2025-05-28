
import { type TradeRequest, type SupabaseClientType } from './types.ts';

/**
 * Update portfolio with new trade position
 */
export async function updatePortfolio(supabase: SupabaseClientType, userId: string, params: TradeRequest): Promise<void> {
  try {
    // Check if we already have this asset in the portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_symbol', params.assetSymbol)
      .maybeSingle();
    
    if (portfolioError && portfolioError.code !== 'PGRST116') {
      throw portfolioError;
    }
    
    if (!portfolioData) {
      // Create new portfolio entry
      await supabase
        .from('user_portfolio')
        .insert({
          user_id: userId,
          asset_symbol: params.assetSymbol,
          asset_name: params.assetName,
          market_type: params.marketType,
          units: params.units,
          average_price: params.pricePerUnit,
          current_price: params.pricePerUnit,
          total_value: params.units * params.pricePerUnit,
          pnl: 0,
          pnl_percentage: 0,
        });
    } else {
      // Update existing portfolio entry
      const totalUnits = portfolioData.units + params.units;
      const totalCost = (portfolioData.average_price * portfolioData.units) + 
                      (params.pricePerUnit * params.units);
      const newAvgPrice = totalCost / totalUnits;
      
      await supabase
        .from('user_portfolio')
        .update({
          units: totalUnits,
          average_price: newAvgPrice,
          current_price: params.pricePerUnit,
          total_value: totalUnits * params.pricePerUnit,
          last_updated: new Date().toISOString()
        })
        .eq('id', portfolioData.id);
    }
  } catch (error) {
    console.error('Error updating portfolio:', error);
    // We don't want to fail the whole operation if portfolio update fails
  }
}
