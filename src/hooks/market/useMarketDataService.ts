import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type Asset } from './types';
import { toast } from '@/hooks/use-toast';

interface UseMarketDataServiceOptions {
  initialMarketType?: string;
  initialSymbols?: string[];
  refetchInterval?: number | false;
  enabled?: boolean;
}

/**
 * Hook to fetch market data from the market-data-service edge function
 */
export function useMarketDataService(options: UseMarketDataServiceOptions = {}) {
  const {
    initialMarketType = 'Crypto',
    initialSymbols = ['BTCUSD', 'ETHUSD'],
    refetchInterval = 60000, // 1 minute default
    enabled = true,
  } = options;

  const [marketType, setMarketType] = useState<string>(initialMarketType);
  const [symbols, setSymbols] = useState<string[]>(initialSymbols);

  const fetchMarketData = async ({
    marketType,
    symbols,
  }: {
    marketType: string;
    symbols: string[];
  }): Promise<Asset[]> => {
    try {
      console.warn(`Fetching ${marketType} data for symbols: ${symbols.join(', ')}`);

      const { data, error } = await supabase.functions.invoke('market-data-service', {
        body: { marketType, symbols },
      });

      if (error) {
        console.error('Error fetching market data:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch market data: ${error.message}`,
          variant: 'destructive',
        });
        throw error;
      }

      if (!data?.data || !Array.isArray(data.data)) {
        console.error('Invalid market data response:', data);
        return [];
      }

      console.warn(
        `Successfully fetched ${data.data.length} market data items from ${data.source}`
      );
      return data.data as Asset[];
    } catch (error) {
      console.error('Error in market data service:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch market data from the service',
        variant: 'destructive',
      });
      return [];
    }
  };

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['market-data-service', marketType, ...symbols],
    queryFn: () => fetchMarketData({ marketType, symbols }),
    refetchInterval: refetchInterval,
    enabled: enabled && symbols.length > 0,
    staleTime: refetchInterval ? refetchInterval / 2 : 0,
  });

  // Force refresh function
  const refreshData = async (forceRefresh = true) => {
    try {
      const { data: freshData, error } = await supabase.functions.invoke('market-data-service', {
        body: { marketType, symbols, forceRefresh },
      });

      if (error) {
        throw error;
      }

      // Show toast to indicate refresh
      toast({
        title: 'Data refreshed',
        description: `Successfully refreshed ${marketType} market data`,
      });

      // Manually update the query cache
      refetch();

      return freshData?.data;
    } catch (error) {
      console.error('Error refreshing market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh market data',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update market type and symbols
  const updateParams = (newMarketType?: string, newSymbols?: string[]) => {
    if (newMarketType) setMarketType(newMarketType);
    if (newSymbols) setSymbols(newSymbols);
  };

  return {
    marketData: data || [],
    isLoading,
    isFetching,
    error,
    refreshData,
    updateParams,
    marketType,
    symbols,
  };
}
