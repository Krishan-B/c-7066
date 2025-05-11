import { supabase } from "@/integrations/supabase/client";
import { Asset } from '@/hooks/useMarketData';

// Get watchlist data from Supabase
export async function fetchWatchlistData(userId: string | undefined): Promise<Asset[]> {
  try {
    console.log("Fetching watchlist data");
    
    if (!userId) {
      // Use local storage for non-authenticated users
      const savedWatchlist = localStorage.getItem('watchlist');
      if (savedWatchlist) {
        return JSON.parse(savedWatchlist) as Asset[];
      }
      
      // Return empty array if no local watchlist
      return [];
    }
    
    // Fetch user's session before making the request
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    // Ensure access_token is treated as a string with a proper fallback
    // Use type assertion to convert the unknown type to string safely
    const accessToken = session?.access_token ? String(session.access_token) : "";
    
    // Fetch the user's watchlist through the edge function
    const { data: responseData, error } = await supabase.functions.invoke('watchlist-operations', {
      body: { operation: "get" },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (error || responseData?.error) {
      throw error || responseData?.error;
    }

    if (responseData?.data && Array.isArray(responseData.data)) {
      console.log(`Found ${responseData.data.length} watchlist items`);
      
      // Get current market data for the watchlist items
      const watchlistItems = responseData.data;
      const marketTypes = [...new Set(watchlistItems.map(item => item.market_type))];
      const symbols = watchlistItems.map(item => item.asset_symbol);
      
      let marketData: Asset[] = [];
      
      // Fetch market data for each market type
      for (const marketType of marketTypes) {
        const { data: marketResult, error: marketError } = await supabase
          .from('market_data')
          .select('*')
          .eq('market_type', marketType)
          .in('symbol', symbols);
          
        if (!marketError && marketResult) {
          marketData = [...marketData, ...marketResult];
        }
      }
      
      // Map watchlist items to their current market data
      return watchlistItems.map(item => {
        const marketItem = marketData.find(m => 
          m.symbol === item.asset_symbol && 
          m.market_type === item.market_type
        );
        
        if (marketItem) {
          return marketItem;
        }
        
        // Fallback if market data is not available
        return {
          name: item.asset_name,
          symbol: item.asset_symbol,
          price: 0,
          change_percentage: 0,
          volume: "N/A",
          market_type: item.market_type
        };
      });
    }

    // Fallback to default data if no watchlist items found
    return [];
  } catch (error) {
    console.error("Error fetching watchlist data:", error);
    throw error;
  }
}

// Add asset to watchlist
export async function addToWatchlist(userId: string | undefined, asset: Asset): Promise<void> {
  if (!userId) {
    // For non-authenticated users, use local storage
    const savedWatchlist = localStorage.getItem('watchlist') || '[]';
    const currentWatchlist = JSON.parse(savedWatchlist) as Asset[];
    
    const isAlreadyInWatchlist = currentWatchlist.some(item => 
      item.symbol === asset.symbol && item.market_type === asset.market_type
    );
    
    if (isAlreadyInWatchlist) {
      throw new Error(`${asset.name} is already in your watchlist.`);
    }
    
    // Add to local watchlist
    const updatedWatchlist = [...currentWatchlist, asset];
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    
    return;
  } else {
    // For authenticated users, use the edge function
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    // Ensure access_token is treated as a string with a proper fallback
    // Use type assertion to convert the unknown type to string safely
    const accessToken = session?.access_token ? String(session.access_token) : "";
    
    const { data: responseData, error } = await supabase.functions.invoke('watchlist-operations', {
      body: { 
        operation: "add",
        asset: {
          symbol: asset.symbol,
          name: asset.name,
          market_type: asset.market_type
        }
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (error || responseData?.error) {
      throw error || responseData?.error;
    }
    
    return;
  }
}

// Remove asset from watchlist
export async function removeFromWatchlist(userId: string | undefined, asset: Asset): Promise<void> {
  if (!userId) {
    // For non-authenticated users, use local storage
    const savedWatchlist = localStorage.getItem('watchlist') || '[]';
    const currentWatchlist = JSON.parse(savedWatchlist) as Asset[];
    
    const updatedWatchlist = currentWatchlist.filter(item => 
      !(item.symbol === asset.symbol && item.market_type === asset.market_type)
    );
    
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    
    return;
  } else {
    // For authenticated users, use the edge function
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    // Ensure access_token is treated as a string with a proper fallback
    // Use type assertion to convert the unknown type to string safely
    const accessToken = session?.access_token ? String(session.access_token) : "";
    
    const { data: responseData, error } = await supabase.functions.invoke('watchlist-operations', {
      body: { 
        operation: "remove",
        asset: {
          symbol: asset.symbol,
          market_type: asset.market_type
        }
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (error || responseData?.error) {
      throw error || responseData?.error;
    }
    
    return;
  }
}
