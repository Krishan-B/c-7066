
/**
 * Format volume to a readable string
 */
export function formatVolume(volume: number | string | null): string {
  if (volume === null || volume === undefined) return 'N/A';
  
  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  
  if (isNaN(numVolume)) return 'N/A';
  
  if (numVolume >= 1e12) {
    return `$${(numVolume / 1e12).toFixed(1)}T`;
  } else if (numVolume >= 1e9) {
    return `$${(numVolume / 1e9).toFixed(1)}B`;
  } else if (numVolume >= 1e6) {
    return `$${(numVolume / 1e6).toFixed(1)}M`;
  } else if (numVolume >= 1e3) {
    return `$${(numVolume / 1e3).toFixed(1)}K`;
  } else {
    return `$${numVolume.toFixed(0)}`;
  }
}

/**
 * Format market cap to a readable string
 */
export function formatMarketCap(marketCap: number | string | null): string {
  if (marketCap === null || marketCap === undefined) return 'N/A';
  
  if (typeof marketCap === 'string' && marketCap !== 'N/A') {
    return marketCap;
  }
  
  const numMarketCap = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
  
  if (isNaN(numMarketCap)) return 'N/A';
  
  if (numMarketCap >= 1e12) {
    return `$${(numMarketCap / 1e12).toFixed(1)}T`;
  } else if (numMarketCap >= 1e9) {
    return `$${(numMarketCap / 1e9).toFixed(1)}B`;
  } else if (numMarketCap >= 1e6) {
    return `$${(numMarketCap / 1e6).toFixed(1)}M`;
  } else if (numMarketCap >= 1e3) {
    return `$${(numMarketCap / 1e3).toFixed(1)}K`;
  } else {
    return `$${numMarketCap.toFixed(0)}`;
  }
}

/**
 * Helper function to get commodity name from symbol
 */
export function getCommodityName(symbol: string): string {
  const commodityNames: Record<string, string> = {
    "GC": "Gold",
    "SI": "Silver",
    "CL": "Crude Oil",
    "NG": "Natural Gas",
    "HG": "Copper",
    "XAUUSD": "Gold",
    "XAGUSD": "Silver",
    "USOIL": "Crude Oil",
    "UKOIL": "Brent Crude Oil",
    "NATGAS": "Natural Gas",
    "COPPER": "Copper",
  };
  
  return commodityNames[symbol] || symbol;
}
