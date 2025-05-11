
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from './useMarketData';
import { useQuery } from '@tanstack/react-query';

export const useWatchlistData = () => {
  const { toast } = useToast();
  const [localWatchlist, setLocalWatchlist] = useState<Asset[]>([]);

  // Use React Query for data fetching and caching
  const { data: supabaseWatchlist = [], isLoading, error, refetch } = useQuery({
    queryKey: ["watchlist-data"],
    queryFn: fetchWatchlistData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize local watchlist from localStorage
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('watchlist');
      if (savedWatchlist) {
        setLocalWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error("Error loading local watchlist:", error);
    }
  }, []);

  // Fetch market data from Supabase
  async function fetchWatchlistData(): Promise<Asset[]> {
    try {
      console.log("Fetching watchlist data");
      
      // Try to use local watchlist first
      const savedWatchlist = localStorage.getItem('watchlist');
      if (savedWatchlist) {
        const parsedWatchlist = JSON.parse(savedWatchlist);
        if (parsedWatchlist && parsedWatchlist.length > 0) {
          return parsedWatchlist as Asset[];
        }
      }
      
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

      // If still no data, use default data
      toast({
        title: "Using sample market data",
        description: "Could not connect to market data service. Displaying sample data instead.",
        variant: "destructive"
      });
      
      // Fallback to default data
      return [
        { name: "Bitcoin", symbol: "BTCUSD", price: 67543.21, change_percentage: 2.4, market_type: "Crypto", volume: "$42.1B", market_cap: "$1.29T" },
        { name: "Apple Inc.", symbol: "AAPL", price: 189.56, change_percentage: 0.8, market_type: "Stock", volume: "$4.2B", market_cap: "$2.98T" },
        { name: "S&P 500", symbol: "US500", price: 5204.34, change_percentage: 0.4, market_type: "Index", volume: "$5.1B" },
        { name: "EUR/USD", symbol: "EURUSD", price: 1.0934, change_percentage: -0.12, market_type: "Forex", volume: "$98.3B" },
        { name: "Gold", symbol: "XAUUSD", price: 2325.60, change_percentage: 1.3, market_type: "Commodity", volume: "$15.8B" },
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

  // Add asset to watchlist
  const addToWatchlist = (asset: Asset) => {
    try {
      // Check if asset is already in watchlist
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
      
      // Add to watchlist
      const updatedWatchlist = [...localWatchlist, asset];
      setLocalWatchlist(updatedWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      
      toast({
        title: "Added to watchlist",
        description: `${asset.name} has been added to your watchlist.`,
      });
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
  const removeFromWatchlist = (asset: Asset) => {
    try {
      const updatedWatchlist = localWatchlist.filter(item => 
        !(item.symbol === asset.symbol && item.market_type === asset.market_type)
      );
      
      setLocalWatchlist(updatedWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      
      toast({
        title: "Removed from watchlist",
        description: `${asset.name} has been removed from your watchlist.`,
      });
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

  // Combine local watchlist with fetched data
  const combinedWatchlist = localWatchlist.length > 0 ? localWatchlist : supabaseWatchlist;

  return {
    watchlist: combinedWatchlist,
    isLoading,
    error,
    handleRefreshData,
    addToWatchlist,
    removeFromWatchlist
  };
};
