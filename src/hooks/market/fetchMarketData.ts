
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchAlphaVantageData, 
  getStockQuote as getAlphaVantageStockQuote,
  getForexRate as getAlphaVantageForexRate,
  getCryptoQuote as getAlphaVantageCryptoQuote,
  transformStockData as transformAlphaVantageStockData, 
  transformForexData as transformAlphaVantageForexData,
  transformCryptoData as transformAlphaVantageCryptoData 
} from "@/utils/api/alphaVantage";

import {
  setPolygonApiKey,
  getPolygonApiKey,
  hasPolygonApiKey,
  getStockQuote as getPolygonStockQuote,
  getCryptoQuote as getPolygonCryptoQuote,
  getForexQuote as getPolygonForexQuote,
  transformStockData as transformPolygonStockData,
  transformCryptoData as transformPolygonCryptoData,
  transformForexData as transformPolygonForexData
} from "@/utils/api/polygon";

import {
  setFinnhubApiKey,
  hasFinnhubApiKey,
  getStockQuote as getFinnhubStockQuote,
  getCryptoQuote as getFinnhubCryptoQuote,
  getForexQuote as getFinnhubForexQuote,
  transformStockData as transformFinnhubStockData,
  transformCryptoData as transformFinnhubCryptoData,
  transformForexData as transformFinnhubForexData
} from "@/utils/api/finnhub";

import { getSymbolsForMarketType } from "./marketSymbols";
import { Asset } from "./types";
import { toast } from "@/hooks/use-toast";

/**
 * Data source preference order
 */
enum DataSource {
  POLYGON = 'polygon',
  FINNHUB = 'finnhub',
  ALPHA_VANTAGE = 'alpha_vantage',
  EDGE_FUNCTION = 'edge_function',
}

export const fetchMarketData = async (marketTypes: string | string[], toastFn = toast): Promise<Asset[]> => {
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
    
    // Determine which data source to use, based on available API keys
    let dataSource = DataSource.EDGE_FUNCTION; // Default source
    let polygonApiKey: string | undefined;
    let finnhubApiKey: string | undefined;
    let alphaVantageApiKey: string | undefined;
    
    // Check for Polygon API key (highest priority)
    const { data: polygonSecret } = await supabase.functions.invoke('get-secret', {
      body: { secretName: 'POLYGON_API_KEY' }
    });
    
    if (polygonSecret?.value) {
      dataSource = DataSource.POLYGON;
      polygonApiKey = polygonSecret.value;
      setPolygonApiKey(polygonApiKey);
    } else {
      // Check for Finnhub API key (second priority)
      const { data: finnhubSecret } = await supabase.functions.invoke('get-secret', {
        body: { secretName: 'FINNHUB_API_KEY' }
      });
      
      if (finnhubSecret?.value) {
        dataSource = DataSource.FINNHUB;
        finnhubApiKey = finnhubSecret.value;
        setFinnhubApiKey(finnhubApiKey);
      } else {
        // Check for Alpha Vantage API key as fallback (lowest priority)
        const { data: alphaVantageSecret } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'ALPHA_VANTAGE_API_KEY' }
        });
        
        if (alphaVantageSecret?.value) {
          dataSource = DataSource.ALPHA_VANTAGE;
          alphaVantageApiKey = alphaVantageSecret.value;
        }
      }
    }
    
    console.log(`Using data source: ${dataSource}`);
    
    // Example symbols to fetch (in production, this would be more comprehensive)
    const symbols = getSymbolsForMarketType(marketTypeArray);
    let marketData: Asset[] = [];
    
    // Try to use Polygon API first (if API key is available)
    if (dataSource === DataSource.POLYGON && hasPolygonApiKey()) {
      try {
        console.log('Fetching data from Polygon.io');
        
        // Fetch data for each symbol based on market type
        for (const marketType of marketTypeArray) {
          if (marketType === 'Stock') {
            for (const symbol of symbols[marketType]) {
              const data = await getPolygonStockQuote(symbol);
              const transformedData = transformPolygonStockData(data);
              if (transformedData) {
                marketData.push(transformedData);
              }
            }
          } 
          else if (marketType === 'Forex') {
            for (const pair of symbols[marketType]) {
              const [fromCurrency, toCurrency] = pair.split('/');
              const data = await getPolygonForexQuote(fromCurrency, toCurrency);
              const transformedData = transformPolygonForexData(data);
              if (transformedData) {
                marketData.push(transformedData);
              }
            }
          }
          else if (marketType === 'Crypto') {
            for (const symbol of symbols[marketType]) {
              const data = await getPolygonCryptoQuote(symbol);
              const transformedData = transformPolygonCryptoData(data);
              if (transformedData) {
                marketData.push(transformedData);
              }
            }
          }
        }
        
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
    
    // Try to use Finnhub API as secondary option (if API key is available and Polygon failed or wasn't available)
    if ((dataSource === DataSource.FINNHUB && hasFinnhubApiKey()) || 
       (dataSource === DataSource.POLYGON && marketData.length === 0)) {
      try {
        console.log('Fetching data from Finnhub.io');
        
        // Fetch data for each symbol based on market type
        for (const marketType of marketTypeArray) {
          if (marketType === 'Stock') {
            for (const symbol of symbols[marketType]) {
              const data = await getFinnhubStockQuote(symbol);
              const transformedData = transformFinnhubStockData(data, symbol);
              if (transformedData) {
                marketData.push(transformedData);
              }
            }
          } 
          else if (marketType === 'Forex') {
            for (const pair of symbols[marketType]) {
              const [fromCurrency, toCurrency] = pair.split('/');
              const data = await getFinnhubForexQuote(fromCurrency, toCurrency);
              const transformedData = transformFinnhubForexData(data, fromCurrency, toCurrency);
              if (transformedData) {
                marketData.push(transformedData);
              }
            }
          }
          else if (marketType === 'Crypto') {
            for (const symbol of symbols[marketType]) {
              const data = await getFinnhubCryptoQuote(symbol);
              const transformedData = transformFinnhubCryptoData(data, symbol);
              if (transformedData) {
                marketData.push(transformedData);
              }
            }
          }
        }
        
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
    
    // Try to use Alpha Vantage API as fallback (if API key is available and both Polygon and Finnhub failed or weren't available)
    if (dataSource === DataSource.ALPHA_VANTAGE || 
       ((dataSource === DataSource.POLYGON || dataSource === DataSource.FINNHUB) && marketData.length === 0)) {
      try {
        console.log('Falling back to Alpha Vantage');
        
        // Fetch data for each symbol based on market type
        for (const marketType of marketTypeArray) {
          if (marketType === 'Stock') {
            for (const symbol of symbols[marketType]) {
              const data = await getAlphaVantageStockQuote(symbol);
              if (data && !data.error && data['Global Quote']) {
                const transformedData = transformAlphaVantageStockData(data);
                if (transformedData) {
                  marketData.push(transformedData);
                }
              }
            }
          } 
          else if (marketType === 'Forex') {
            for (const pair of symbols[marketType]) {
              const [fromCurrency, toCurrency] = pair.split('/');
              const data = await getAlphaVantageForexRate(fromCurrency, toCurrency);
              if (data && !data.error) {
                const transformedData = transformAlphaVantageForexData(data);
                if (transformedData) {
                  marketData.push(transformedData);
                }
              }
            }
          }
          else if (marketType === 'Crypto') {
            for (const symbol of symbols[marketType]) {
              const data = await getAlphaVantageCryptoQuote(symbol);
              if (data && !data.error) {
                const transformedData = transformAlphaVantageCryptoData(data);
                if (transformedData) {
                  marketData.push(transformedData);
                }
              }
            }
          }
        }
        
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
    console.log('Falling back to edge functions');
    
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
    console.log(`Fetched ${combinedData.length} total assets from edge functions for ${marketTypeArray.join(', ')}`);
    
    return combinedData;
  } catch (error) {
    console.error(`Error fetching market data:`, error);
    toastFn({
      title: "Error fetching market data",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Helper function to update market data in the database
 */
async function updateMarketDataInDatabase(assets: Asset[]): Promise<void> {
  try {
    for (const asset of assets) {
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
    console.log(`Updated ${assets.length} assets in the database`);
  } catch (error) {
    console.error('Error updating market data in database:', error);
  }
}
