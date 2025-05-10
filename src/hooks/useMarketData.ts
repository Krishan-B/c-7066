import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
}

interface UseMarketDataOptions {
  refetchInterval?: number;
  initialData?: Asset[];
  enableRefresh?: boolean;
}

export const useMarketData = (marketType: string | string[], options: UseMarketDataOptions = {}) => {
  const { toast } = useToast();
  const { 
    refetchInterval = 1000 * 60 * 15, // 15 minutes default
    initialData = [],
    enableRefresh = true 
  } = options;
  
  // Function to fetch market data from Supabase
  const fetchMarketData = async (marketTypes: string | string[]): Promise<Asset[]> => {
    try {
      // Convert single market type to array for consistent handling
      const marketTypeArray = Array.isArray(marketTypes) ? marketTypes : [marketTypes];
      
      // First check if we already have recent data in our database
      const { data: existingData, error: fetchError } = await supabase
        .from('market_data')
        .select('*')
        .in('market_type', marketTypeArray)
        .gt('last_updated', new Date(Date.now() - 60000 * 15).toISOString()); // Data not older than 15 minutes
      
      // If we have enough recent data (at least 5 items per market type), use it
      const minExpectedItems = marketTypeArray.length * 5;
      if (!fetchError && existingData && existingData.length >= minExpectedItems) {
        return existingData as Asset[];
      }

      // Otherwise, call our edge functions to get fresh data for each market type
      const dataPromises = marketTypeArray.map(async (type) => {
        const { data, error } = await supabase.functions.invoke('fetch-market-data', {
          body: { market: type },
        });

        if (error) {
          console.error(`Error fetching ${type} data:`, error);
          return [];
        }
        
        return data?.data || [];
      });

      // Wait for all edge function calls to complete
      const results = await Promise.all(dataPromises);
      
      // Flatten the array of arrays into a single array
      return results.flat();
    } catch (error) {
      console.error(`Error fetching market data:`, error);
      toast({
        title: "Error fetching market data",
        description: "Failed to load market data. Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Use ReactQuery to manage data fetching
  const {
    data = initialData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["market-data", marketType],
    queryFn: () => fetchMarketData(marketType),
    refetchOnWindowFocus: false,
    staleTime: refetchInterval,
    enabled: enableRefresh,
  });

  return {
    marketData: data,
    isLoading,
    isFetching,
    error,
    refetch
  };
};
