
import { useMemo } from 'react';
import { useMarketData, Asset } from './useMarketData';

interface UseCombinedMarketDataOptions {
  limit?: number;
  sortBy?: keyof Asset;
  order?: 'asc' | 'desc';
  filter?: (asset: Asset) => boolean;
  refetchInterval?: number;
}

export const useCombinedMarketData = (marketTypes: string[], options: UseCombinedMarketDataOptions = {}) => {
  const {
    limit,
    sortBy = 'market_cap',
    order = 'desc',
    filter,
    refetchInterval
  } = options;

  // Fetch all market types in a single query
  const { marketData, isLoading, error, refetch, isFetching } = useMarketData(marketTypes, {
    refetchInterval: refetchInterval
  });

  // Process the market data with sorting, filtering, and limiting
  const processedData = useMemo(() => {
    let result = [...marketData];
    
    // Apply filter if provided
    if (filter) {
      result = result.filter(filter);
    }
    
    // Sort the data
    result = result.sort((a, b) => {
      // Handle string comparison
      if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
        return order === 'asc' 
          ? (a[sortBy] as string).localeCompare(b[sortBy] as string)
          : (b[sortBy] as string).localeCompare(a[sortBy] as string);
      }
      
      // Handle numeric comparison
      const aValue = a[sortBy] as number;
      const bValue = b[sortBy] as number;
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    // Apply limit if provided
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }
    
    return result;
  }, [marketData, sortBy, order, filter, limit]);

  return {
    marketData: processedData,
    isLoading,
    isFetching,
    error,
    refetch
  };
};
