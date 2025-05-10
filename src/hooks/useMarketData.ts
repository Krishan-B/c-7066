import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
}

export const useMarketData = (marketType: string) => {
  // Function to fetch market data from Supabase
  const fetchMarketData = async (marketType: string): Promise<Asset[]> => {
    try {
      // First check if we already have recent data in our database
      const { data: existingData, error: fetchError } = await supabase
        .from('market_data')
        .select('*')
        .eq('market_type', marketType)
        .gt('last_updated', new Date(Date.now() - 60000 * 15).toISOString()); // Data not older than 15 minutes
      
      // If we have enough recent data, use it
      if (!fetchError && existingData && existingData.length > 5) {
        return existingData as Asset[];
      }

      // Otherwise, call our edge function to get fresh data
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { market: marketType },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.data || [];
    } catch (error) {
      console.error(`Error fetching ${marketType} data:`, error);
      throw error;
    }
  };

  // Use ReactQuery to manage data fetching
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["market-data", marketType],
    queryFn: () => fetchMarketData(marketType),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    marketData: data,
    isLoading,
    error,
    refetch
  };
};
