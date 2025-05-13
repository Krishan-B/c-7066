
import React, { useState, useEffect } from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";
import { useToast } from "@/components/ui/use-toast";
import { fetchAlphaVantageData } from "@/utils/api/alphaVantage";
import { supabase } from "@/integrations/supabase/client";
import { hasPolygonApiKey } from "@/utils/api/polygon";

const Markets = () => {
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const [activeTab, setActiveTab] = useState("Crypto");
  const { marketData, isLoading, error, updateMarketTypes } = useCombinedMarketData(
    [activeTab], // Start with active tab data
    { refetchInterval: 1000 * 60 } // Refresh every minute
  );
  
  const { toast } = useToast();
  const [alphaVantageAvailable, setAlphaVantageAvailable] = useState(false);
  const [polygonAvailable, setPolygonAvailable] = useState(false);
  const [dataSource, setDataSource] = useState("Simulated");
  
  // Check API availability on component mount
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Check for Polygon API key
        const { data: polygonSecret } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'POLYGON_API_KEY' }
        });
        
        if (polygonSecret?.value) {
          setPolygonAvailable(true);
          setDataSource("Polygon.io");
          
          toast({
            title: "Polygon.io API Connected",
            description: "Using real-time market data from Polygon.io",
          });
          return;
        }
        
        // If no Polygon API key, check for Alpha Vantage
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
              variant: "destructive" // Changed from "warning" to "destructive" to match allowed variants
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
  
  return (
    <MarketContainer 
      marketData={marketData}
      isLoading={isLoading}
      error={error}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      dataSource={dataSource}
    />
  );
};

export default Markets;
