
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Asset } from '@/hooks/market/types';
import { useQuery } from '@tanstack/react-query';
import { usePolygonWebSocket } from "@/hooks/market/usePolygonWebSocket";
import { fetchWatchlistData } from './fetchWatchlistData';
import { UseWatchlistDataReturn } from './types';

export const useWatchlistData = (): UseWatchlistDataReturn => {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<Asset[]>([]);

  // Use React Query for data fetching and caching
  const { data: initialWatchlist = [], isLoading, error, refetch } = useQuery({
    queryKey: ["watchlist-data"],
    queryFn: () => fetchWatchlistData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Extract symbols for WebSocket subscription
  const symbols = watchlist.map(asset => asset.symbol);
  
  // Initialize WebSocket connection for real-time updates
  const { 
    isConnected, 
    lastUpdate,
    connect,
    subscribe,
    error: wsError 
  } = usePolygonWebSocket({ 
    symbols,
    autoConnect: true
  });
  
  // Update watchlist with initial data
  useEffect(() => {
    if (initialWatchlist && initialWatchlist.length > 0) {
      setWatchlist(initialWatchlist);
    }
  }, [initialWatchlist]);
  
  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate) {
      setWatchlist(prevWatchlist => {
        return prevWatchlist.map(item => {
          if (item.symbol === lastUpdate.symbol) {
            return {
              ...item,
              price: lastUpdate.price,
              change_percentage: lastUpdate.change_percentage,
              volume: lastUpdate.volume,
              last_updated: new Date().toISOString()
            };
          }
          return item;
        });
      });
    }
  }, [lastUpdate]);
  
  // Update WebSocket subscriptions when symbols change
  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      subscribe(symbols);
    }
  }, [symbols, isConnected, subscribe]);

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

  return {
    watchlist,
    isLoading,
    error,
    realtimeEnabled: isConnected,
    handleRefreshData
  };
};
