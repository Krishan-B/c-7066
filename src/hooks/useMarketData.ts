import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchAlphaVantageData, 
  getStockQuote,
  getForexRate,
  getCryptoQuote,
  transformStockData, 
  transformForexData,
  transformCryptoData 
} from "@/utils/api/alphaVantage";

export interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
  last_updated?: string;
}

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
  
  // Function to fetch market data from multiple sources
  const fetchMarketData = async (marketTypes: string | string[]): Promise<Asset[]> => {
    try {
      // Convert single market type to array for consistent handling
      const marketTypeArray = Array.isArray(marketTypes) ? marketTypes : [marketTypes];
      
      // First check if we already have recent data in our database
      const { data: existingData, error: fetchError } = await supabase
        .from('market_data')
        .select('*')
        .in('market_type', marketTypeArray)
        .gt('last_updated', new Date(Date.now() - 60000 * 15).toISOString()); // Data not older than 15 minutes
      
      // If we have enough recent data (at least 3 items per market type), use it
      const minExpectedItems = marketTypeArray.length * 3;
      if (!fetchError && existingData && existingData.length >= minExpectedItems) {
        console.log(`Using cached data for ${marketTypeArray.join(', ')}`, existingData);
        return existingData as Asset[];
      }

      console.log(`Fetching fresh data for ${marketTypeArray.join(', ')}`);
      
      // Try to use Alpha Vantage API first
      try {
        // Example symbols to fetch (in production, this would be more comprehensive)
        const symbols = getSymbolsForMarketType(marketTypeArray);
        let alphaVantageData: Asset[] = [];
        
        // First check if the Alpha Vantage API key is configured
        const { data: secretData } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'ALPHA_VANTAGE_API_KEY' }
        });
        
        if (!secretData?.value) {
          console.log("Alpha Vantage API key not configured, falling back to edge functions");
          throw new Error("API key not configured");
        }
        
        // Fetch data for each symbol based on market type
        for (const marketType of marketTypeArray) {
          if (marketType === 'Stock') {
            for (const symbol of symbols[marketType]) {
              const data = await getStockQuote(symbol);
              if (data && !data.error && data['Global Quote']) {
                const transformedData = transformStockData(data);
                if (transformedData) {
                  alphaVantageData.push(transformedData);
                }
              }
            }
          } 
          else if (marketType === 'Forex') {
            for (const pair of symbols[marketType]) {
              const [fromCurrency, toCurrency] = pair.split('/');
              const data = await getForexRate(fromCurrency, toCurrency);
              if (data && !data.error) {
                const transformedData = transformForexData(data);
                if (transformedData) {
                  alphaVantageData.push(transformedData);
                }
              }
            }
          }
          else if (marketType === 'Crypto') {
            for (const symbol of symbols[marketType]) {
              const data = await getCryptoQuote(symbol);
              if (data && !data.error) {
                const transformedData = transformCryptoData(data);
                if (transformedData) {
                  alphaVantageData.push(transformedData);
                }
              }
            }
          }
        }
        
        // If we got at least some data from Alpha Vantage, use it
        if (alphaVantageData.length > 0) {
          console.log(`Fetched ${alphaVantageData.length} assets from Alpha Vantage`);
          
          // Update our database with the new data
          for (const asset of alphaVantageData) {
            await supabase
              .from('market_data')
              .upsert({
                symbol: asset.symbol,
                name: asset.name,
                price: asset.price,
                change_percentage: asset.change_percentage,
                volume: asset.volume,
                market_cap: asset.market_cap,
                market_type: asset.market_type,
                last_updated: new Date().toISOString(),
              }, { onConflict: 'symbol' });
          }
          
          return alphaVantageData;
        }
      } catch (alphaError) {
        console.error('Alpha Vantage error, falling back to edge functions:', alphaError);
      }
      
      // Fall back to our edge functions if Alpha Vantage fails or doesn't have enough data
      const dataPromises = marketTypeArray.map(async (type) => {
        const { data, error } = await supabase.functions.invoke('fetch-market-data', {
          body: { market: type },
        });

        if (error) {
          console.error(`Error fetching ${type} data:`, error);
          return [];
        }
        
        return data?.data || [];
      });

      // Wait for all edge function calls to complete
      const results = await Promise.all(dataPromises);
      
      // Flatten the array of arrays into a single array
      const combinedData = results.flat();
      console.log(`Fetched ${combinedData.length} total assets for ${marketTypeArray.join(', ')}`);
      
      return combinedData;
    } catch (error) {
      console.error(`Error fetching market data:`, error);
      toast({
        title: "Error fetching market data",
        description: "Failed to load market data. Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Helper function to get symbols for different market types
  const getSymbolsForMarketType = (marketTypes: string[]): Record<string, string[]> => {
    const symbols: Record<string, string[]> = {
      'Stock': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'DIS', 'INTC', 'AMD'],
      'Forex': ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CAD', 'AUD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY'],
      'Crypto': ['BTC', 'ETH', 'XRP', 'LTC', 'SOL', 'ADA', 'DOT', 'DOGE', 'AVAX', 'LINK'],
      'Index': ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI'], // Alpha Vantage requires premium for some indices
      'Commodity': ['GLD', 'SLV', 'USO', 'UNG', 'DBC'] // For commodities we use ETFs as proxy
    };
    
    return symbols;
  };

  // Use ReactQuery to manage data fetching
  const {
    data = initialData,
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

  return {
    marketData: data,
    isLoading,
    isFetching,
    error,
    refetch
  };
};
