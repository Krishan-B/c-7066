
import { useState, useCallback, useEffect } from "react";
import { useMarketData, Asset } from "@/hooks/market";
import { usePolygonWebSocket } from "@/hooks/market/usePolygonWebSocket";
import { getSymbolsForMarketType } from "@/hooks/market/marketSymbols";
import { toast } from "@/hooks/use-toast";
import { useMarketDataService } from "@/hooks/market/useMarketDataService";

interface UseCombinedMarketDataOptions {
  refetchInterval?: number;
  enableRealtime?: boolean;
  useExternalApis?: boolean;
}

export const useCombinedMarketData = (
  initialMarketTypes: string[] = [], 
  options: UseCombinedMarketDataOptions = {}
) => {
  const { 
    refetchInterval, 
    enableRealtime = true, 
    useExternalApis = true
  } = options;
  
  const [marketTypes, setMarketTypes] = useState<string[]>(initialMarketTypes);
  
  // Get symbols for all market types
  const symbols = marketTypes.length > 0 
    ? marketTypes.flatMap(type => getSymbolsForMarketType([type])[type] || [])
    : [];
  
  // Initialize WebSocket connection if enabled
  const { 
    isConnected, 
    lastUpdate,
    connect,
    subscribe,
    error: wsError 
  } = usePolygonWebSocket({ 
    symbols: enableRealtime ? symbols : [],
    autoConnect: enableRealtime
  });
  
  // Use the regular market data hook for fallback
  const { 
    marketData: simulatedData, 
    isLoading: isSimulatedLoading, 
    error: simulatedError, 
    refetch: refetchSimulated,
    updateMarketData: updateSimulatedData
  } = useMarketData(marketTypes, { refetchInterval });

  // Use the market data service hook if external APIs are enabled
  const {
    marketData: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
    refreshData: refreshServiceData,
    updateParams: updateServiceParams
  } = useMarketDataService({
    // Fix: Change initialMarketTypes (plural) to initialMarketType (singular)
    // and pass the first market type in the array, or 'Crypto' as default
    initialMarketType: marketTypes.length > 0 ? marketTypes[0] : 'Crypto',
    initialSymbols: symbols,
    refetchInterval: refetchInterval,
    enabled: useExternalApis && marketTypes.length > 0
  });

  // Combine data from both sources, with preference for service data
  const marketData = useExternalApis && serviceData.length > 0 
    ? serviceData 
    : simulatedData;
  
  const isLoading = useExternalApis 
    ? isServiceLoading 
    : isSimulatedLoading;
  
  const error = useExternalApis 
    ? serviceError 
    : simulatedError;

  // Function to update market types
  const updateMarketTypes = useCallback((types: string[]) => {
    setMarketTypes(types);
    
    // Also update service params if we're using external APIs
    if (useExternalApis) {
      // Get symbols for the first market type
      const newSymbols = types.length > 0 
        ? getSymbolsForMarketType([types[0]])[types[0]] || []
        : [];
      
      updateServiceParams(
        types.length > 0 ? types[0] : undefined,
        newSymbols
      );
    }
  }, [useExternalApis, updateServiceParams]);

  // Function to refresh data
  const refreshData = useCallback(() => {
    if (useExternalApis) {
      return refreshServiceData(true);
    } else {
      return refetchSimulated();
    }
  }, [useExternalApis, refreshServiceData, refetchSimulated]);

  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (lastUpdate && enableRealtime) {
      // Update the appropriate data source
      if (useExternalApis) {
        // We need to update the serviceData directly through the cache
        refreshServiceData();
      } else {
        updateSimulatedData((prevData) => {
          return prevData.map(item => {
            if (item.symbol === lastUpdate.symbol) {
              return {
                ...item,
                price: lastUpdate.price,
                change_percentage: lastUpdate.change_percentage,
                volume: lastUpdate.volume,
                last_updated: new Date().toISOString()
              };
            }
            return item;
          });
        });
      }
    }
  }, [lastUpdate, updateSimulatedData, enableRealtime, useExternalApis, refreshServiceData]);
  
  // Update WebSocket subscriptions when symbols change
  useEffect(() => {
    if (enableRealtime && isConnected && symbols.length > 0) {
      subscribe(symbols);
    }
  }, [symbols, isConnected, subscribe, enableRealtime]);
  
  // Show WebSocket error if any
  useEffect(() => {
    if (wsError && enableRealtime) {
      toast({
        title: "WebSocket Connection Error",
        description: wsError.message,
        variant: "destructive"
      });
    }
  }, [wsError, enableRealtime]);
  
  return {
    marketData,
    isLoading,
    error,
    refreshData,
    updateMarketTypes,
    realtimeEnabled: isConnected && enableRealtime,
    realtimeConnect: connect,
    dataSource: useExternalApis ? "External APIs" : "Simulated"
  };
};
