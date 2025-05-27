import { useQuery } from "@tanstack/react-query";
import { fetchMarketData } from "./fetchMarketData";
import { type Asset } from "./types";
import { useState, useCallback } from "react";

interface UseMarketDataOptions {
  refetchInterval?: number;
  initialData?: Asset[];
  enableRefresh?: boolean;
}

export const useMarketData = (marketType: string | string[], options: UseMarketDataOptions = {}) => {
  const { 
    refetchInterval = 1000 * 60 * 5, // 5 minutes default
    initialData = [],
    enableRefresh = true 
  } = options;

  // State for market data that can be manually updated (e.g., for WebSocket updates)
  const [manualData, setManualData] = useState<Asset[]>([]);
  const [hasManualUpdates, setHasManualUpdates] = useState(false);

  // Use ReactQuery to manage data fetching
  const {
    data: queryData = initialData,
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

  // Callback to manually update market data (for WebSocket updates)
  const updateMarketData = useCallback((updater: (prevData: Asset[]) => Asset[]) => {
    setManualData(prev => {
      // If we already have manual data, update it
      if (hasManualUpdates) {
        return updater(prev);
      }
      
      // Otherwise, start with the query data and apply updates
      setHasManualUpdates(true);
      return updater(queryData);
    });
  }, [queryData, hasManualUpdates]);

  // Use manual data if available, otherwise use query data
  const data = hasManualUpdates ? manualData : queryData;

  return {
    marketData: data,
    isLoading,
    isFetching,
    error,
    refetch,
    updateMarketData
  };
};

export * from './types';
