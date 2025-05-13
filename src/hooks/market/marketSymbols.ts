
export const getSymbolsForMarketType = (marketTypes: string[]): Record<string, string[]> => {
  const symbols: Record<string, string[]> = {
    'Stock': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'DIS', 'INTC', 'AMD'],
    'Forex': ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CAD', 'AUD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY'],
    'Crypto': ['BTC', 'ETH', 'XRP', 'LTC', 'SOL', 'ADA', 'DOT', 'DOGE', 'AVAX', 'LINK'],
    'Index': ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI'], // Alpha Vantage requires premium for some indices
    'Commodity': ['GLD', 'SLV', 'USO', 'UNG', 'DBC'] // For commodities we use ETFs as proxy
  };
  
  return symbols;
};
