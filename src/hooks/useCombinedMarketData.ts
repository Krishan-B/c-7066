
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Asset, useMarketData } from "@/hooks/useMarketData";
import { supabase } from "@/integrations/supabase/client";

interface UseCombinedMarketDataOptions {
  refetchInterval?: number;
  initialTab?: string;
}

export const useCombinedMarketData = (defaultMarketTypes: string[] = [], options: UseCombinedMarketDataOptions = {}) => {
  const { refetchInterval = 1000 * 60 * 5 } = options; // 5 minutes default
  const [marketTypes, setMarketTypes] = useState<string[]>(defaultMarketTypes);
  
  const {
    marketData: fetchedData,
    isLoading,
    error,
    refetch,
  } = useMarketData(marketTypes, { refetchInterval });
  
  // Generate fallback/sample data for each market type if needed
  const generateSampleDataForMarketType = (marketType: string): Asset[] => {
    switch (marketType) {
      case 'Crypto':
        return [
          { name: "Bitcoin", symbol: "BTCUSD", price: 67543.21, change_percentage: 2.4, market_type: "Crypto", volume: "$42.1B", market_cap: "$1.29T" },
          { name: "Ethereum", symbol: "ETHUSD", price: 3245.67, change_percentage: 1.2, market_type: "Crypto", volume: "$18.7B", market_cap: "$389.5B" },
          { name: "Solana", symbol: "SOLUSD", price: 143.89, change_percentage: 3.8, market_type: "Crypto", volume: "$7.2B", market_cap: "$61.3B" },
          { name: "Cardano", symbol: "ADAUSD", price: 0.58, change_percentage: -1.2, market_type: "Crypto", volume: "$1.8B", market_cap: "$20.5B" },
          { name: "XRP", symbol: "XRPUSD", price: 0.72, change_percentage: 0.5, market_type: "Crypto", volume: "$2.1B", market_cap: "$38.7B" }
        ];
      case 'Stock':
        return [
          { name: "Apple Inc.", symbol: "AAPL", price: 189.56, change_percentage: 0.8, market_type: "Stock", volume: "$4.2B", market_cap: "$2.98T" },
          { name: "Microsoft", symbol: "MSFT", price: 417.23, change_percentage: 1.1, market_type: "Stock", volume: "$3.7B", market_cap: "$3.1T" },
          { name: "Amazon", symbol: "AMZN", price: 182.45, change_percentage: -0.3, market_type: "Stock", volume: "$2.9B", market_cap: "$1.89T" },
          { name: "Tesla", symbol: "TSLA", price: 215.67, change_percentage: -1.5, market_type: "Stock", volume: "$5.6B", market_cap: "$687.5B" },
          { name: "Meta", symbol: "META", price: 478.22, change_percentage: 2.3, market_type: "Stock", volume: "$3.1B", market_cap: "$1.2T" }
        ];
      case 'Forex':
        return [
          { name: "EUR/USD", symbol: "EURUSD", price: 1.0934, change_percentage: -0.12, market_type: "Forex", volume: "$98.3B" },
          { name: "GBP/USD", symbol: "GBPUSD", price: 1.2645, change_percentage: 0.08, market_type: "Forex", volume: "$45.6B" },
          { name: "USD/JPY", symbol: "USDJPY", price: 151.38, change_percentage: 0.21, market_type: "Forex", volume: "$67.2B" },
          { name: "USD/CHF", symbol: "USDCHF", price: 0.8923, change_percentage: -0.15, market_type: "Forex", volume: "$28.3B" },
          { name: "AUD/USD", symbol: "AUDUSD", price: 0.6587, change_percentage: -0.05, market_type: "Forex", volume: "$21.5B" }
        ];
      case 'Index':
        return [
          { name: "S&P 500", symbol: "US500", price: 5204.34, change_percentage: 0.4, market_type: "Index", volume: "$5.1B" },
          { name: "Dow Jones", symbol: "US30", price: 38763.45, change_percentage: 0.2, market_type: "Index", volume: "$3.2B" },
          { name: "Nasdaq", symbol: "USTEC", price: 18192.56, change_percentage: 0.7, market_type: "Index", volume: "$4.3B" },
          { name: "FTSE 100", symbol: "UK100", price: 8032.78, change_percentage: -0.1, market_type: "Index", volume: "$1.8B" },
          { name: "DAX", symbol: "GER40", price: 18457.23, change_percentage: 0.3, market_type: "Index", volume: "$2.1B" }
        ];
      case 'Commodity':
        return [
          { name: "Gold", symbol: "XAUUSD", price: 2325.60, change_percentage: 1.3, market_type: "Commodity", volume: "$15.8B" },
          { name: "Silver", symbol: "XAGUSD", price: 28.93, change_percentage: 0.9, market_type: "Commodity", volume: "$5.7B" },
          { name: "Crude Oil", symbol: "WTICOUSD", price: 78.45, change_percentage: -0.7, market_type: "Commodity", volume: "$8.3B" },
          { name: "Brent Oil", symbol: "UKOIL", price: 82.31, change_percentage: -0.5, market_type: "Commodity", volume: "$7.2B" },
          { name: "Natural Gas", symbol: "NATGAS", price: 2.21, change_percentage: -1.8, market_type: "Commodity", volume: "$3.5B" }
        ];
      default:
        return [];
    }
  };

  // Ensure we have data for each market type, use samples if needed
  const [marketData, setMarketData] = useState<Asset[]>([]);

  useEffect(() => {
    if (fetchedData && fetchedData.length > 0) {
      // We have some data from the API
      let combinedData = [...fetchedData];

      // Check if we need to supplement with sample data for any market types
      marketTypes.forEach(type => {
        // If we don't have at least 3 items for this market type, add sample data
        const typeData = combinedData.filter(asset => asset.market_type === type);
        if (typeData.length < 3) {
          const sampleData = generateSampleDataForMarketType(type);
          // Filter out any samples that might duplicate existing symbols
          const existingSymbols = new Set(combinedData.map(asset => asset.symbol));
          const uniqueSamples = sampleData.filter(asset => !existingSymbols.has(asset.symbol));
          
          combinedData = [...combinedData, ...uniqueSamples];
        }
      });

      setMarketData(combinedData);
    } else {
      // No API data, use all sample data
      const allSampleData = marketTypes.flatMap(type => generateSampleDataForMarketType(type));
      setMarketData(allSampleData);
    }
  }, [fetchedData, marketTypes]);

  // Method to update the market types (for tab switching)
  const updateMarketTypes = (newTypes: string[]) => {
    setMarketTypes(Array.isArray(newTypes) ? newTypes : [newTypes]);
  };

  return {
    marketData,
    isLoading,
    error,
    refetch,
    updateMarketTypes,
  };
};
