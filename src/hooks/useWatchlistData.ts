
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Asset } from './useMarketData';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/hooks/useAuth";
import { useLocalWatchlist } from './useLocalWatchlist';
import { 
  fetchWatchlistData, 
  addToWatchlist as addToWatchlistService, 
  removeFromWatchlist as removeFromWatchlistService
} from '@/services/watchlistService';

export const useWatchlistData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { localWatchlist, setLocalWatchlist } = useLocalWatchlist();

  // Use React Query for data fetching and caching
  const { data: watchlistData = [], isLoading, error, refetch } = useQuery({
    queryKey: ["watchlist-data", user?.id],
    queryFn: () => fetchWatchlistData(user?.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user
  });

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
        await addToWatchlistService(user.id, asset);
        
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
        await removeFromWatchlistService(user.id, asset);
        
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
