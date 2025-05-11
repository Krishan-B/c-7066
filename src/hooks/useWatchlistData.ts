
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from './useMarketData';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/hooks/useAuth";

export const useWatchlistData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [localWatchlist, setLocalWatchlist] = useState<Asset[]>([]);

  // Use React Query for data fetching and caching
  const { data: watchlistData = [], isLoading, error, refetch } = useQuery({
    queryKey: ["watchlist-data", user?.id],
    queryFn: fetchWatchlistData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user
  });

  // Initialize local watchlist from localStorage for non-authenticated users
  useEffect(() => {
    if (!user) {
      try {
        const savedWatchlist = localStorage.getItem('watchlist');
        if (savedWatchlist) {
          setLocalWatchlist(JSON.parse(savedWatchlist));
        }
      } catch (error) {
        console.error("Error loading local watchlist:", error);
      }
    }
  }, [user]);

  // Fetch watchlist data from Supabase
  async function fetchWatchlistData(): Promise<Asset[]> {
    try {
      console.log("Fetching watchlist data");
      
      if (!user) {
        // Use local storage for non-authenticated users
        const savedWatchlist = localStorage.getItem('watchlist');
        if (savedWatchlist) {
          return JSON.parse(savedWatchlist) as Asset[];
        }
        
        // Return empty array if no local watchlist
        return [];
      }
      
      // Fetch the user's watchlist through the edge function
      const { data, error } = await supabase.functions.invoke('watchlist-operations', {
        body: { operation: "get" }
      });
      
      if (error || data?.error) {
        throw error || data?.error;
      }

      if (data?.data && Array.isArray(data.data)) {
        console.log(`Found ${data.data.length} watchlist items`);
        
        // Get current market data for the watchlist items
        const watchlistItems = data.data;
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
      toast({
        title: "Error",
        description: "Failed to load watchlist data. Please try again later.",
        variant: "destructive"
      });
      return [];
    }
  };

  // Add asset to watchlist
  const addToWatchlist = async (asset: Asset) => {
    try {
      if (!user) {
        // For non-authenticated users, use local storage
        const isAlreadyInWatchlist = localWatchlist.some(item => 
          item.symbol === asset.symbol && item.market_type === asset.market_type
        );
        
        if (isAlreadyInWatchlist) {
          toast({
            title: "Already in watchlist",
            description: `${asset.name} is already in your watchlist.`,
          });
          return;
        }
        
        // Add to local watchlist
        const updatedWatchlist = [...localWatchlist, asset];
        setLocalWatchlist(updatedWatchlist);
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        
        toast({
          title: "Added to watchlist",
          description: `${asset.name} has been added to your watchlist.`,
        });
      } else {
        // For authenticated users, use the edge function
        const session = await supabase.auth.getSession();
        const token = session?.data?.session?.access_token || '';
        
        const { data, error } = await supabase.functions.invoke('watchlist-operations', {
          body: { 
            operation: "add",
            asset: {
              symbol: asset.symbol,
              name: asset.name,
              market_type: asset.market_type
            }
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (error || data?.error) {
          throw error || data?.error;
        }
        
        toast({
          title: "Added to watchlist",
          description: `${asset.name} has been added to your watchlist.`,
        });
        
        // Refresh the watchlist data
        refetch();
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Remove asset from watchlist
  const removeFromWatchlist = async (asset: Asset) => {
    try {
      if (!user) {
        // For non-authenticated users, use local storage
        const updatedWatchlist = localWatchlist.filter(item => 
          !(item.symbol === asset.symbol && item.market_type === asset.market_type)
        );
        
        setLocalWatchlist(updatedWatchlist);
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        
        toast({
          title: "Removed from watchlist",
          description: `${asset.name} has been removed from your watchlist.`,
        });
      } else {
        // For authenticated users, use the edge function
        const session = await supabase.auth.getSession();
        const token = session?.data?.session?.access_token || '';
        
        const { data, error } = await supabase.functions.invoke('watchlist-operations', {
          body: { 
            operation: "remove",
            asset: {
              symbol: asset.symbol,
              market_type: asset.market_type
            }
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (error || data?.error) {
          throw error || data?.error;
        }
        
        toast({
          title: "Removed from watchlist",
          description: `${asset.name} has been removed from your watchlist.`,
        });
        
        // Refresh the watchlist data
        refetch();
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove from watchlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle refresh data
  const handleRefreshData = async () => {
    toast({
      title: "Refreshing market data",
      description: "Fetching the latest market data...",
    });
    
    try {
      await refetch();
      
      toast({
        title: "Data refreshed",
        description: "Market data has been updated successfully.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh market data. Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Choose the appropriate watchlist based on authentication status
  const watchlist = user ? watchlistData : localWatchlist;

  return {
    watchlist,
    isLoading,
    error,
    handleRefreshData,
    addToWatchlist,
    removeFromWatchlist
  };
};
