
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from './market/types';
import { useQuery } from '@tanstack/react-query';
import { usePolygonWebSocket } from "@/hooks/market/usePolygonWebSocket";

export const useWatchlistData = () => {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<Asset[]>([]);

  // Use React Query for data fetching and caching
  const { data: initialWatchlist = [], isLoading, error, refetch } = useQuery({
    queryKey: ["watchlist-data"],
    queryFn: fetchWatchlistData,
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

  // Fetch market data from Supabase
  async function fetchWatchlistData(): Promise<Asset[]> {
    try {
      console.log("Fetching watchlist data");
      
      // Get featured assets from each market type
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .in('market_type', ['Stock', 'Index', 'Commodity', 'Forex', 'Crypto'])
        .order('market_type', { ascending: true })
        .order('last_updated', { ascending: false })
        .limit(50); // Limit to 50 assets total
      
      if (error) {
        console.error("Error fetching watchlist data:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log(`Found ${data.length} watchlist assets`);
        return data as Asset[];
      }

      // If no data in Supabase yet, call the functions to populate it
      console.log("No watchlist data found, fetching fresh data");
      
      await Promise.all([
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Stock' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Crypto' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Forex' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Index' } }),
        supabase.functions.invoke('fetch-market-data', { body: { market: 'Commodity' } })
      ]);
      
      // Try to fetch again after populating
      const { data: refreshedData, error: refreshError } = await supabase
        .from('market_data')
        .select('*')
        .in('market_type', ['Stock', 'Index', 'Commodity', 'Forex', 'Crypto'])
        .order('market_type', { ascending: true })
        .limit(50);

      if (!refreshError && refreshedData && refreshedData.length > 0) {
        console.log(`Fetched ${refreshedData.length} refreshed watchlist assets`);
        return refreshedData as Asset[];
      }

      // Fallback to default data
      toast({
        title: "Using sample market data",
        description: "Could not connect to market data service. Displaying sample data instead.",
        variant: "destructive"
      });
      
      return [
        { 
          name: "Bitcoin", 
          symbol: "BTCUSD", 
          price: 67543.21, 
          change_percentage: 2.4, 
          market_type: "Crypto", 
          volume: "$42.1B" 
        },
        { 
          name: "Apple Inc.", 
          symbol: "AAPL", 
          price: 189.56, 
          change_percentage: 0.8, 
          market_type: "Stock", 
          volume: "$4.2B" 
        },
        { 
          name: "S&P 500", 
          symbol: "US500", 
          price: 5204.34, 
          change_percentage: 0.4, 
          market_type: "Index", 
          volume: "$5.1B" 
        },
        { 
          name: "EUR/USD", 
          symbol: "EURUSD", 
          price: 1.0934, 
          change_percentage: -0.12, 
          market_type: "Forex", 
          volume: "$98.3B" 
        },
        { 
          name: "Gold", 
          symbol: "XAUUSD", 
          price: 2325.60, 
          change_percentage: 1.3, 
          market_type: "Commodity", 
          volume: "$15.8B" 
        },
      ];
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast({
        title: "Error",
        description: "Failed to load market data. Please try again later.",
        variant: "destructive"
      });
      return [];
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

  return {
    watchlist,
    isLoading,
    error,
    realtimeEnabled: isConnected,
    handleRefreshData
  };
};
