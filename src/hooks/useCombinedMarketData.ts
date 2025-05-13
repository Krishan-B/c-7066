
import { useState, useCallback, useEffect } from "react";
import { useMarketData, Asset } from "@/hooks/market";
import { usePolygonWebSocket } from "@/hooks/market/usePolygonWebSocket";
import { getSymbolsForMarketType } from "@/hooks/market/marketSymbols";
import { toast } from "@/hooks/use-toast";

interface UseCombinedMarketDataOptions {
  refetchInterval?: number;
  enableRealtime?: boolean;
}

export const useCombinedMarketData = (
  initialMarketTypes: string[] = [], 
  options: UseCombinedMarketDataOptions = {}
) => {
  const { refetchInterval, enableRealtime = true } = options;
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
  
  // Use the market data hook
  const { 
    marketData, 
    isLoading, 
    error, 
    refetch,
    updateMarketData: baseUpdateMarketData
  } = useMarketData(marketTypes, { refetchInterval });

  // Function to update market types
  const updateMarketTypes = useCallback((types: string[]) => {
    setMarketTypes(types);
  }, []);

  // Forward the updateMarketData function
  const updateMarketData = useCallback(baseUpdateMarketData, [baseUpdateMarketData]);
  
  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (lastUpdate && enableRealtime) {
      // Update the market data with real-time update
      updateMarketData((prevData) => {
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
  }, [lastUpdate, updateMarketData, enableRealtime]);
  
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
  }, [wsError, enableRealtime, toast]);
  
  return {
    marketData,
    isLoading,
    error,
    refetch,
    updateMarketTypes,
    updateMarketData,
    realtimeEnabled: isConnected && enableRealtime,
    realtimeConnect: connect
  };
};
