
import { setPolygonApiKey, hasPolygonApiKey } from "@/utils/api/polygon/client";
import { setAlphaVantageApiKey, hasAlphaVantageApiKey } from "@/utils/api/alphaVantage/client";
import { setFinnhubApiKey, hasFinnhubApiKey } from "@/utils/api/finnhub/client";

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
