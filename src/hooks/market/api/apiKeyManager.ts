
import { supabase } from "@/integrations/supabase/client";
import { setPolygonApiKey, hasPolygonApiKey } from "@/utils/api/polygon";
import { setFinnhubApiKey, hasFinnhubApiKey } from "@/utils/api/finnhub";

/**
 * Data source preference order
 */
export enum DataSource {
  POLYGON = 'polygon',
  FINNHUB = 'finnhub',
  ALPHA_VANTAGE = 'alpha_vantage',
  EDGE_FUNCTION = 'edge_function',
}

/**
 * Fetches API keys from Supabase and determines which data source to use
 */
export async function determineDataSource(): Promise<{
  dataSource: DataSource;
  polygonApiKey?: string;
  finnhubApiKey?: string;
  alphaVantageApiKey?: string;
}> {
  // Default source
  let dataSource = DataSource.EDGE_FUNCTION;
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
  
  return {
    dataSource,
    polygonApiKey,
    finnhubApiKey,
    alphaVantageApiKey
  };
}
