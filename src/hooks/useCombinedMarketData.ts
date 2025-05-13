
import { useState, useCallback } from "react";
import { useMarketData, Asset } from "@/hooks/market";

interface UseCombinedMarketDataOptions {
  refetchInterval?: number;
}

export const useCombinedMarketData = (initialMarketTypes: string[] = [], options: UseCombinedMarketDataOptions = {}) => {
  const [marketTypes, setMarketTypes] = useState<string[]>(initialMarketTypes);
  
  // Use the market data hook
  const { 
    marketData, 
    isLoading, 
    error, 
    refetch,
    updateMarketData: baseUpdateMarketData
  } = useMarketData(marketTypes, options);
  
  // Function to update which market types we're fetching
  const updateMarketTypes = useCallback((types: string[]) => {
    setMarketTypes(types);
  }, []);

  // Allow manual updates (e.g., from WebSocket)
  const updateMarketData = useCallback(baseUpdateMarketData, [baseUpdateMarketData]);
  
  return {
    marketData,
    isLoading,
    error,
    refetch,
    updateMarketTypes,
    updateMarketData
  };
};
