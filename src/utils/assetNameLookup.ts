// Utility to look up asset names by symbol for WebSocket/Polygon data
const assetNameMap: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'GOOGL': 'Alphabet Inc.',
  'MSFT': 'Microsoft Corporation',
  'BTC-USD': 'Bitcoin',
  'ETH-USD': 'Ethereum',
  'XAUUSD': 'Gold',
  'XAGUSD': 'Silver',
  'US500': 'S&P 500',
  // Add more mappings as needed
};

export function getAssetNameBySymbol(symbol: string): string {
  // Try direct match
  if (assetNameMap[symbol]) return assetNameMap[symbol];
  // Try fallback for crypto (BTC, ETH, etc.)
  if (symbol.endsWith('-USD') && assetNameMap[symbol]) return assetNameMap[symbol];
  // Fallback: return symbol itself
  return symbol;
}
