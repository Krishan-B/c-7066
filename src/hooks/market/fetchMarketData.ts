
import { toast } from "@/hooks/use-toast";
import { getSymbolsForMarketType } from "./marketSymbols";
import { Asset } from "./types";
import { DataSource, determineDataSource } from "./api/apiKeyManager";
import { fetchPolygonData } from "./api/polygonHandler";
import { fetchFinnhubData } from "./api/finnhubHandler";
import { fetchAlphaVantageData } from "./api/alphaVantageHandler";
import { fetchEdgeFunctionData } from "./api/edgeFunctionHandler";
import { getRecentMarketData, updateMarketDataInDatabase } from "./api/databaseHandler";

export const fetchMarketData = async (marketTypes: string | string[], toastFn = toast): Promise<Asset[]> => {
  try {
    // Convert single market type to array for consistent handling
    const marketTypeArray = Array.isArray(marketTypes) ? marketTypes : [marketTypes];
    
    // First check if we already have recent data in our database
    const recentData = await getRecentMarketData(marketTypeArray);
    if (recentData) {
      return recentData;
    }

    console.log(`Fetching fresh data for ${marketTypeArray.join(', ')}`);
    
    // Determine which data source to use, based on available API keys
    const { dataSource } = await determineDataSource();
    
    console.log(`Using data source: ${dataSource}`);
    
    // Example symbols to fetch (in production, this would be more comprehensive)
    const symbols = getSymbolsForMarketType(marketTypeArray);
    let marketData: Asset[] = [];
    
    // Try to use Polygon API first (if API key is available)
    if (dataSource === DataSource.POLYGON) {
      try {
        marketData = await fetchPolygonData(marketTypeArray, symbols);
        
        // If we got data from Polygon, use it
        if (marketData.length > 0) {
          console.log(`Fetched ${marketData.length} assets from Polygon.io`);
          
          // Update our database with the new data
          await updateMarketDataInDatabase(marketData);
          
          return marketData;
        }
      } catch (polygonError) {
        console.error('Polygon.io error, falling back to Finnhub:', polygonError);
      }
    }
    
    // Try to use Finnhub API as secondary option
    if (dataSource === DataSource.FINNHUB || 
       (dataSource === DataSource.POLYGON && marketData.length === 0)) {
      try {
        marketData = await fetchFinnhubData(marketTypeArray, symbols);
        
        // If we got data from Finnhub, use it
        if (marketData.length > 0) {
          console.log(`Fetched ${marketData.length} assets from Finnhub.io`);
          
          // Update our database with the new data
          await updateMarketDataInDatabase(marketData);
          
          return marketData;
        }
      } catch (finnhubError) {
        console.error('Finnhub error, falling back to Alpha Vantage:', finnhubError);
      }
    }
    
    // Try to use Alpha Vantage API as fallback
    if (dataSource === DataSource.ALPHA_VANTAGE || 
       ((dataSource === DataSource.POLYGON || dataSource === DataSource.FINNHUB) && marketData.length === 0)) {
      try {
        marketData = await fetchAlphaVantageData(marketTypeArray, symbols);
        
        // If we got data from Alpha Vantage, use it
        if (marketData.length > 0) {
          console.log(`Fetched ${marketData.length} assets from Alpha Vantage`);
          
          // Update our database with the new data
          await updateMarketDataInDatabase(marketData);
          
          return marketData;
        }
      } catch (alphaError) {
        console.error('Alpha Vantage error, falling back to edge functions:', alphaError);
      }
    }
    
    // Fall back to our edge functions if all API sources fail or don't have enough data
    const edgeFunctionData = await fetchEdgeFunctionData(marketTypeArray);
    console.log(`Fetched ${edgeFunctionData.length} total assets from edge functions for ${marketTypeArray.join(', ')}`);
    
    return edgeFunctionData;
  } catch (error) {
    console.error(`Error fetching market data:`, error);
    toastFn({
      title: "Error fetching market data",
      variant: "destructive"
    });
    throw error;
  }
};
