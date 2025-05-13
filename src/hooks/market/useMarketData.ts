
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { fetchMarketData } from "./fetchMarketData";
import { Asset } from "./types";

interface UseMarketDataOptions {
  refetchInterval?: number;
  initialData?: Asset[];
  enableRefresh?: boolean;
}

export const useMarketData = (marketType: string | string[], options: UseMarketDataOptions = {}) => {
  const { toast } = useToast();
  const { 
    refetchInterval = 1000 * 60 * 5, // 5 minutes default
    initialData = [],
    enableRefresh = true 
  } = options;

  // Use ReactQuery to manage data fetching
  const {
    data = initialData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["market-data", marketType],
    queryFn: () => fetchMarketData(marketType, toast),
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

export * from './types';
