
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/hooks/useMarketData';

// Define types for our watchlist functions
interface WatchlistItem {
  id: string;
  user_id: string;
  asset_symbol: string;
  asset_name: string;
  market_type: string;
  added_at: string;
}

/**
 * Fetches the user's watchlist from Supabase
 * @returns Array of watchlist items
 */
export const fetchWatchlistData = async (): Promise<Asset[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("No active session found");
      return [];
    }

    // Get user's watchlist items
    const { data: watchlistItems, error: watchlistError } = await supabase
      .from('user_watchlist')
      .select('*')
      .eq('user_id', session.session.user.id);

    if (watchlistError) {
      console.error('Error fetching watchlist:', watchlistError);
      return [];
    }

    if (!watchlistItems || watchlistItems.length === 0) {
      console.log('No watchlist items found');
      return [];
    }

    // Get the market data for each watchlist item
    const symbols = watchlistItems.map(item => item.asset_symbol);
    const { data: marketData, error: marketError } = await supabase
      .from('market_data')
      .select('*')
      .in('symbol', symbols);

    if (marketError) {
      console.error('Error fetching market data:', marketError);
      return [];
    }

    return marketData as Asset[];
  } catch (error) {
    console.error('Error in fetchWatchlistData:', error);
    return [];
  }
};

/**
 * Adds an asset to the user's watchlist
 * @param asset Asset to add to watchlist
 * @returns Success status
 */
export const addToWatchlist = async (asset: Asset): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("No active session found");
      return false;
    }
    
    // Safely convert access_token to string using String() function
    const accessToken = String(session.session.access_token);
    
    const { error } = await supabase
      .from('user_watchlist')
      .insert([{
        user_id: session.session.user.id,
        asset_symbol: asset.symbol,
        asset_name: asset.name,
        market_type: asset.market_type
      }]);

    if (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addToWatchlist:', error);
    return false;
  }
};

/**
 * Removes an asset from the user's watchlist
 * @param symbol Symbol of asset to remove
 * @returns Success status
 */
export const removeFromWatchlist = async (symbol: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("No active session found");
      return false;
    }

    // Safely convert access_token to string using String() function
    const accessToken = String(session.session.access_token);
    
    const { error } = await supabase
      .from('user_watchlist')
      .delete()
      .eq('user_id', session.session.user.id)
      .eq('asset_symbol', symbol);

    if (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeFromWatchlist:', error);
    return false;
  }
};
