interface MarketSymbols {
  [marketType: string]: string[];
}

// Define default symbols for each market type
const defaultSymbols: MarketSymbols = {
  Crypto: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD', 'DOTUSD'],
  Stock: ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL'],
  Forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
  Index: ['SPX500', 'NASDAQ', 'DJI', 'UK100', 'JP225'],
  Commodities: ['XAUUSD', 'XAGUSD', 'USOIL', 'NATGAS', 'COPPER'],
};

/**
 * Get symbols for specified market types
 */
export function getSymbolsForMarketType(marketTypes: string[]): MarketSymbols {
  const result: MarketSymbols = {};

  marketTypes.forEach((type) => {
    if (defaultSymbols[type]) {
      result[type] = defaultSymbols[type];
    }
  });

  return result;
}

/**
 * Get all available symbols across all market types
 */
export function getAllMarketSymbols(): string[] {
  return Object.values(defaultSymbols).flat();
}
