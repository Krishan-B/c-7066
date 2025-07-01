import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "./useMarketData";
import { useQuery } from "@tanstack/react-query";
import { ErrorHandler } from "@/services/errorHandling";

// Default sample data for offline/error scenarios
const SAMPLE_DATA: Asset[] = [
  {
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67543.21,
    change_percentage: 2.4,
    market_type: "Crypto",
    volume: "$42.1B",
    market_cap: "$1.29T",
  },
  {
    name: "Apple Inc.",
    symbol: "AAPL",
    price: 189.56,
    change_percentage: 0.8,
    market_type: "Stock",
    volume: "$4.2B",
    market_cap: "$2.98T",
  },
  {
    name: "S&P 500",
    symbol: "US500",
    price: 5204.34,
    change_percentage: 0.4,
    market_type: "Index",
    volume: "$5.1B",
  },
  {
    name: "EUR/USD",
    symbol: "EURUSD",
    price: 1.0934,
    change_percentage: -0.12,
    market_type: "Forex",
    volume: "$98.3B",
  },
  {
    name: "Gold",
    symbol: "XAUUSD",
    price: 2325.6,
    change_percentage: 1.3,
    market_type: "Commodity",
    volume: "$15.8B",
  },
];

export const useWatchlistData = () => {
  // Use React Query for data fetching and caching
  const {
    data: watchlist = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["watchlist-data"],
    queryFn: fetchWatchlistData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch market data from Supabase
  async function fetchWatchlistData(): Promise<Asset[]> {
    try {
      console.log("Fetching watchlist data");

      // Get featured assets from each market type
      const { data, error } = await supabase
        .from("market_data")
        .select("*")
        .in("market_type", ["Stock", "Index", "Commodity", "Forex", "Crypto"])
        .order("market_type", { ascending: true })
        .order("last_updated", { ascending: false })
        .limit(50); // Limit to 50 assets total

      if (error) {
        throw ErrorHandler.createError({
          code: "data_fetch_error",
          message: "Database error fetching watchlist data",
          details: error,
          retryable: true,
        });
      }

      if (data && data.length > 0) {
        console.log(`Found ${data.length} watchlist assets`);
        return data as Asset[];
      }

      // If no data in Supabase yet, call the functions to populate it
      console.log("No watchlist data found, fetching fresh data");

      try {
        await Promise.all([
          supabase.functions.invoke("fetch-market-data", {
            body: { market: "Stock" },
          }),
          supabase.functions.invoke("fetch-market-data", {
            body: { market: "Crypto" },
          }),
          supabase.functions.invoke("fetch-market-data", {
            body: { market: "Forex" },
          }),
          supabase.functions.invoke("fetch-market-data", {
            body: { market: "Index" },
          }),
          supabase.functions.invoke("fetch-market-data", {
            body: { market: "Commodity" },
          }),
        ]);

        // Try to fetch again after populating
        const { data: refreshedData, error: refreshError } = await supabase
          .from("market_data")
          .select("*")
          .in("market_type", ["Stock", "Index", "Commodity", "Forex", "Crypto"])
          .order("market_type", { ascending: true })
          .limit(50);

        if (!refreshError && refreshedData && refreshedData.length > 0) {
          console.log(
            `Fetched ${refreshedData.length} refreshed watchlist assets`
          );
          return refreshedData as Asset[];
        }

        // If still no data, use default data
        ErrorHandler.handleError(
          ErrorHandler.createError({
            code: "market_data_fetch_error",
            message: "Could not connect to market data service",
            details: { refreshError },
            retryable: true,
          }),
          {
            description:
              "Displaying sample data. Real market data will be shown when available.",
          }
        );

        return SAMPLE_DATA;
      } catch (fetchError) {
        throw ErrorHandler.createError({
          code: "market_data_fetch_error",
          message: "Failed to fetch fresh market data",
          details: fetchError,
          retryable: true,
        });
      }
    } catch (error) {
      ErrorHandler.handleError(error, {
        description: "Unable to load market data. Using sample data for now.",
        retryFn: async () => {
          await refetch();
        },
      });
      return SAMPLE_DATA;
    }
  }

  // Handle refresh data
  const handleRefreshData = async () => {
    ErrorHandler.handleSuccess("Refreshing market data", {
      description: "Fetching the latest market data...",
    });

    try {
      await refetch();
      ErrorHandler.handleSuccess("Market data updated", {
        description: "Latest market data has been loaded.",
      });
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "data_refresh_error",
          message: "Failed to refresh market data",
          details: error,
          retryable: true,
        }),
        {
          description:
            "Unable to get the latest market data. Please try again.",
          retryFn: () => handleRefreshData(),
        }
      );
    }
  };

  return {
    watchlist,
    isLoading,
    error,
    refetch: handleRefreshData,
  };
};
