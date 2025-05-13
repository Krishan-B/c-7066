
import { Asset } from './types';

// Simulated crypto assets
const cryptoAssets: Asset[] = [
  { name: 'Bitcoin', symbol: 'BTCUSD', price: 67432.21, change_percentage: 2.4, market_type: 'Crypto', volume: '14.2B' },
  { name: 'Ethereum', symbol: 'ETHUSD', price: 3245.87, change_percentage: 1.8, market_type: 'Crypto', volume: '6.5B' },
  { name: 'Cardano', symbol: 'ADAUSD', price: 0.52, change_percentage: -0.7, market_type: 'Crypto', volume: '420M' },
  { name: 'Solana', symbol: 'SOLUSD', price: 142.76, change_percentage: 3.2, market_type: 'Crypto', volume: '2.1B' },
  { name: 'Polkadot', symbol: 'DOTUSD', price: 7.25, change_percentage: -1.2, market_type: 'Crypto', volume: '189M' }
];

// Simulated stock assets
const stockAssets: Asset[] = [
  { name: 'Apple', symbol: 'AAPL', price: 187.43, change_percentage: 0.5, market_type: 'Stock', volume: '48.3M' },
  { name: 'Microsoft', symbol: 'MSFT', price: 425.22, change_percentage: 1.1, market_type: 'Stock', volume: '20.1M' },
  { name: 'Tesla', symbol: 'TSLA', price: 178.89, change_percentage: -2.3, market_type: 'Stock', volume: '94.2M' },
  { name: 'Amazon', symbol: 'AMZN', price: 183.26, change_percentage: 0.8, market_type: 'Stock', volume: '31.5M' },
  { name: 'Google', symbol: 'GOOGL', price: 165.92, change_percentage: 0.3, market_type: 'Stock', volume: '17.8M' }
];

// Simulated forex assets
const forexAssets: Asset[] = [
  { name: 'EUR/USD', symbol: 'EURUSD', price: 1.0842, change_percentage: 0.2, market_type: 'Forex', volume: '121B' },
  { name: 'GBP/USD', symbol: 'GBPUSD', price: 1.2678, change_percentage: -0.1, market_type: 'Forex', volume: '87B' },
  { name: 'USD/JPY', symbol: 'USDJPY', price: 155.78, change_percentage: 0.4, market_type: 'Forex', volume: '94B' },
  { name: 'AUD/USD', symbol: 'AUDUSD', price: 0.6624, change_percentage: -0.3, market_type: 'Forex', volume: '54B' },
  { name: 'USD/CAD', symbol: 'USDCAD', price: 1.3612, change_percentage: 0.1, market_type: 'Forex', volume: '68B' }
];

// Simulated index assets
const indexAssets: Asset[] = [
  { name: 'S&P 500', symbol: 'SPX500', price: 5234.18, change_percentage: 0.7, market_type: 'Index', volume: 'N/A' },
  { name: 'Nasdaq', symbol: 'NASDAQ', price: 16758.21, change_percentage: 1.2, market_type: 'Index', volume: 'N/A' },
  { name: 'Dow Jones', symbol: 'DJI', price: 38983.45, change_percentage: 0.2, market_type: 'Index', volume: 'N/A' },
  { name: 'FTSE 100', symbol: 'UK100', price: 8192.87, change_percentage: -0.4, market_type: 'Index', volume: 'N/A' },
  { name: 'Nikkei 225', symbol: 'JP225', price: 38437.76, change_percentage: 0.8, market_type: 'Index', volume: 'N/A' }
];

// Simulated commodity assets
const commodityAssets: Asset[] = [
  { name: 'Gold', symbol: 'XAUUSD', price: 2345.18, change_percentage: 0.5, market_type: 'Commodities', volume: '120B' },
  { name: 'Silver', symbol: 'XAGUSD', price: 27.86, change_percentage: 1.1, market_type: 'Commodities', volume: '42B' },
  { name: 'Crude Oil', symbol: 'USOIL', price: 78.32, change_percentage: -0.8, market_type: 'Commodities', volume: '156B' },
  { name: 'Natural Gas', symbol: 'NATGAS', price: 2.18, change_percentage: -1.5, market_type: 'Commodities', volume: '87B' },
  { name: 'Copper', symbol: 'COPPER', price: 4.56, change_percentage: 0.3, market_type: 'Commodities', volume: '34B' }
];

// Map of market types to their respective assets
const marketData: Record<string, Asset[]> = {
  'Crypto': cryptoAssets,
  'Stock': stockAssets,
  'Forex': forexAssets,
  'Index': indexAssets,
  'Commodities': commodityAssets
};

/**
 * Fetch market data by market type
 * In a real implementation, this would make API calls to fetch live market data
 */
export async function fetchMarketData(marketType: string | string[]): Promise<Asset[]> {
  // Add a delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If marketType is an array, return data for all specified market types
  if (Array.isArray(marketType)) {
    let result: Asset[] = [];
    
    for (const type of marketType) {
      const assets = marketData[type] || [];
      result = [...result, ...assets];
    }
    
    return result;
  }
  
  // Return data for a single market type
  return marketData[marketType] || [];
}
