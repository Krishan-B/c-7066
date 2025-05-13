
import { setPolygonApiKey, hasPolygonApiKey } from "@/utils/api/polygon/client";
import { setAlphaVantageApiKey, hasAlphaVantageApiKey } from "@/utils/api/alphaVantage/client";
import { setFinnhubApiKey, hasFinnhubApiKey } from "@/utils/api/finnhub/client";

// Define the data source enum
export enum DataSource {
  POLYGON = 'polygon',
  FINNHUB = 'finnhub',
  ALPHA_VANTAGE = 'alpha_vantage',
  EDGE_FUNCTION = 'edge_function'
}

// This utility handles API keys for different data providers
export const setApiKey = (provider: string, apiKey: string) => {
  switch (provider.toLowerCase()) {
    case 'polygon':
      setPolygonApiKey(apiKey);
      return true;
    case 'alphavantage':
      setAlphaVantageApiKey(apiKey);
      return true;
    case 'finnhub':
      setFinnhubApiKey(apiKey);
      return true;
    default:
      console.error(`Unknown API provider: ${provider}`);
      return false;
  }
};

export const hasApiKey = (provider: string): boolean => {
  switch (provider.toLowerCase()) {
    case 'polygon':
      return hasPolygonApiKey();
    case 'alphavantage':
      return hasAlphaVantageApiKey();
    case 'finnhub':
      return hasFinnhubApiKey();
    default:
      return false;
  }
};

export const getApiKeyStatus = () => {
  return {
    polygon: hasPolygonApiKey(),
    alphaVantage: hasAlphaVantageApiKey(),
    finnhub: hasFinnhubApiKey()
  };
};

// Add the determineDataSource function
export const determineDataSource = async (): Promise<{dataSource: DataSource}> => {
  if (hasPolygonApiKey()) {
    return { dataSource: DataSource.POLYGON };
  } else if (hasFinnhubApiKey()) {
    return { dataSource: DataSource.FINNHUB };
  } else if (hasAlphaVantageApiKey()) {
    return { dataSource: DataSource.ALPHA_VANTAGE };
  } else {
    return { dataSource: DataSource.EDGE_FUNCTION };
  }
};
