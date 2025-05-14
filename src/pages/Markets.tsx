
import React, { useState, useEffect } from "react";
import { useCombinedMarketData } from "@/hooks/useCombinedMarketData";
import MarketContainer from "@/components/markets/MarketContainer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Markets = () => {
  // Use the combined market data hook with a 1-minute refetch interval for more real-time market data
  const [activeTab, setActiveTab] = useState("Crypto");
  const [useExternalApis, setUseExternalApis] = useState(true);
  const { toast } = useToast();
  
  const { 
    marketData, 
    isLoading, 
    error, 
    updateMarketTypes, 
    realtimeEnabled, 
    dataSource,
    refreshData
  } = useCombinedMarketData(
    [activeTab], // Start with active tab data
    { 
      refetchInterval: 1000 * 60, // Refresh every minute
      enableRealtime: true, // Enable real-time updates
      useExternalApis: useExternalApis // Use external APIs if available
    }
  );
  
  // Check API availability on component mount
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Try to call our market-data-service edge function
        const { data, error } = await supabase.functions.invoke('market-data-service', {
          body: { 
            marketType: 'Crypto', 
            symbols: ['BTCUSD'] 
          }
        });
        
        if (error) {
          console.error("Error calling market data service:", error);
          setUseExternalApis(false);
          
          toast({
            title: "Using Simulated Data",
            description: "Could not connect to market data service. Using simulated data instead.",
            variant: "destructive"
          });
          return;
        }
        
        if (data && data.data) {
          setUseExternalApis(true);
          
          toast({
            title: "Using External APIs",
            description: `Connected to market data service. Using ${data.source} data.`,
          });
        }
      } catch (error) {
        console.error("Error checking API availability:", error);
        setUseExternalApis(false);
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
      toast({
        title: "Real-time Updates Active",
        description: "You are receiving live market data updates",
      });
    }
  }, [realtimeEnabled, toast]);
  
  return (
    <MarketContainer 
      marketData={marketData}
      isLoading={isLoading}
      error={error}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      dataSource={dataSource}
      realtimeEnabled={realtimeEnabled}
      onRefresh={() => refreshData()}
    />
  );
};

export default Markets;
