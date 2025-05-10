
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from './useMarketData';
import { useQuery } from '@tanstack/react-query';

export const useWatchlistData = () => {
  const { toast } = useToast();

  // Use React Query for data fetching and caching
  const { data: watchlist = [], isLoading, error, refetch } = useQuery({
    queryKey: ["watchlist-data"],
    queryFn: fetchWatchlistData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch market data from Supabase
  async function fetchWatchlistData(): Promise<Asset[]> {
    try {
      // Get featured assets from each market type
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .in('market_type', ['Stock', 'Index', 'Commodity', 'Forex', 'Crypto'])
        .limit(50); // Limit to 50 assets total
      
      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data as Asset[];
      }

      // If no data in Supabase yet, call the function to populate it
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
        .limit(50);

      if (!refreshError && refreshedData && refreshedData.length > 0) {
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
    handleRefreshData
  };
};
