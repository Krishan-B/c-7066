
import React, { useState, useEffect } from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";
import { useToast } from "@/components/ui/use-toast";
import { fetchAlphaVantageData } from "@/utils/api/alphaVantage";
import { supabase } from "@/integrations/supabase/client";
import { hasPolygonApiKey } from "@/utils/api/polygon";
import { hasFinnhubApiKey } from "@/utils/api/finnhub";
import { usePolygonWebSocket } from "@/hooks/market/usePolygonWebSocket";
import { getSymbolsForMarketType } from "@/hooks/market/marketSymbols";

const Markets = () => {
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const [activeTab, setActiveTab] = useState("Crypto");
  const { marketData, isLoading, error, updateMarketTypes, updateMarketData } = useCombinedMarketData(
    [activeTab], // Start with active tab data
    { refetchInterval: 1000 * 60 } // Refresh every minute
  );
  
  const { toast } = useToast();
  const [alphaVantageAvailable, setAlphaVantageAvailable] = useState(false);
  const [polygonAvailable, setPolygonAvailable] = useState(false);
  const [finnhubAvailable, setFinnhubAvailable] = useState(false);
  const [dataSource, setDataSource] = useState("Simulated");
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  
  // Get symbols for the active tab
  const symbols = activeTab ? getSymbolsForMarketType([activeTab])[activeTab] || [] : [];
  
  // Initialize WebSocket connection
  const { 
    isConnected, 
    lastUpdate,
    error: wsError 
  } = usePolygonWebSocket({ 
    symbols: realtimeEnabled ? symbols : [],
    autoConnect: realtimeEnabled
  });
  
  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate) {
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
  }, [lastUpdate, updateMarketData]);
  
  // Check API availability on component mount
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Check for Polygon API key (highest priority)
        const { data: polygonSecret } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'POLYGON_API_KEY' }
        });
        
        if (polygonSecret?.value) {
          setPolygonAvailable(true);
          setDataSource("Polygon.io");
          setRealtimeEnabled(true);
          
          toast({
            title: "Polygon.io API Connected",
            description: "Using real-time market data from Polygon.io",
          });
          return;
        }
        
        // If no Polygon API key, check for Finnhub API key (second priority)
        const { data: finnhubSecret } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'FINNHUB_API_KEY' }
        });
        
        if (finnhubSecret?.value) {
          setFinnhubAvailable(true);
          setDataSource("Finnhub.io");
          
          toast({
            title: "Finnhub.io API Connected",
            description: "Using real-time market data from Finnhub.io",
          });
          return;
        }
        
        // If no Finnhub API key, check for Alpha Vantage API key (third priority)
        const { data: alphaVantageSecret } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'ALPHA_VANTAGE_API_KEY' }
        });
        
        if (alphaVantageSecret?.value) {
          setAlphaVantageAvailable(true);
          
          // Try to fetch a simple stock quote as a test
          const testData = await fetchAlphaVantageData('GLOBAL_QUOTE', { symbol: 'MSFT' });
          
          if (testData && !testData.error && testData['Global Quote']) {
            setDataSource("Alpha Vantage");
            
            toast({
              title: "Alpha Vantage API Connected",
              description: "Using real-time market data from Alpha Vantage",
            });
          } else if (testData?.error === "Rate limit") {
            toast({
              title: "API Rate Limited",
              description: "Alpha Vantage API rate limited. Some data may be simulated.",
              variant: "destructive" 
            });
            // We still set it as available since we have the API key
            setDataSource("Alpha Vantage (Limited)");
          } else {
            setDataSource("Simulated");
            console.log("Alpha Vantage API not available, using simulated data");
          }
        } else {
          console.log("No market data APIs configured, using simulated data");
        }
      } catch (error) {
        console.error("Error checking API availability:", error);
      }
    };
    
    checkApiAvailability();
  }, [toast]);
  
  // Update market types when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    updateMarketTypes([tab]);
  };
  
  // Show WebSocket connection status
  useEffect(() => {
    if (realtimeEnabled) {
      if (isConnected) {
        toast({
          title: "Real-time Updates Active",
          description: "You are receiving live market data updates",
        });
      } else if (wsError) {
        toast({
          title: "WebSocket Connection Error",
          description: wsError.message,
          variant: "destructive"
        });
      }
    }
  }, [isConnected, wsError, realtimeEnabled, toast]);
  
  return (
    <MarketContainer 
      marketData={marketData}
      isLoading={isLoading}
      error={error}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      dataSource={dataSource}
      realtimeEnabled={isConnected && realtimeEnabled}
    />
  );
};

export default Markets;
