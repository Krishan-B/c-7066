import { useQueryClient } from '@tanstack/react-query';
import { Asset } from './types';

interface CacheConfig {
  staleTimes: {
    [key: string]: number;
  };
  maxAge: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  staleTimes: {
    Crypto: 15000,    // 15 seconds
    Forex: 30000,     // 30 seconds
    Stock: 60000,     // 1 minute
    Index: 60000,     // 1 minute
    Commodities: 60000 // 1 minute
  },
  maxAge: 300000      // 5 minutes
};

export function useMarketCache(marketType: string) {
  const queryClient = useQueryClient();
  
  const staleTime = DEFAULT_CONFIG.staleTimes[marketType] || DEFAULT_CONFIG.staleTimes.Stock;
  
  const invalidateCache = async () => {
    await queryClient.invalidateQueries({ queryKey: ['market-data', marketType] });
  };

  const updateCache = (newData: Asset[]) => {
    queryClient.setQueryData(['market-data', marketType], newData);
  };

  const prefetchData = async (fetcher: () => Promise<Asset[]>) => {
    await queryClient.prefetchQuery({
      queryKey: ['market-data', marketType],
      queryFn: fetcher,
      staleTime
    });
  };

  return {
    staleTime,
    maxAge: DEFAULT_CONFIG.maxAge,
    invalidateCache,
    updateCache,
    prefetchData
  };
}
