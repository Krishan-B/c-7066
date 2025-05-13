
import React, { useState, useEffect } from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";
import { useToast } from "@/components/ui/use-toast";
import { fetchAlphaVantageData } from "@/utils/api/alphaVantage";
import { supabase } from "@/integrations/supabase/client";

const Markets = () => {
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const [activeTab, setActiveTab] = useState("Crypto");
  const { marketData, isLoading, error, updateMarketTypes } = useCombinedMarketData(
    [activeTab], // Start with active tab data
    { refetchInterval: 1000 * 60 } // Refresh every minute
  );
  
  const { toast } = useToast();
  const [alphaVantageAvailable, setAlphaVantageAvailable] = useState(false);
  
  // Check if Alpha Vantage API is available on component mount
  useEffect(() => {
    const checkAlphaVantageAvailability = async () => {
      try {
        // First check if the API key is configured in Supabase
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'ALPHA_VANTAGE_API_KEY' }
        });
        
        if (error || !data?.value) {
          console.log("Alpha Vantage API key not configured");
          return;
        }
        
        // Try to fetch a simple stock quote as a test
        const testData = await fetchAlphaVantageData('GLOBAL_QUOTE', { symbol: 'MSFT' });
        
        if (testData && !testData.error && testData['Global Quote']) {
          setAlphaVantageAvailable(true);
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
          setAlphaVantageAvailable(true);
        } else {
          console.log("Alpha Vantage API not available, using simulated data");
        }
      } catch (error) {
        console.error("Error checking Alpha Vantage availability:", error);
      }
    };
    
    checkAlphaVantageAvailability();
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
      dataSource={alphaVantageAvailable ? "Alpha Vantage" : "Simulated"}
    />
  );
};

export default Markets;
