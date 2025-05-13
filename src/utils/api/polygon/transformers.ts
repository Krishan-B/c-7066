
import { Asset } from '@/hooks/market/types';
import { 
  PolygonStockQuote, 
  PolygonCryptoQuote, 
  PolygonForexQuote 
} from './endpoints';

/**
 * Transform Polygon stock data to our app's Asset format
 */
export function transformStockData(data: PolygonStockQuote): Asset | null {
  if (!data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const previousClose = result.c;
  const previousDay = result.o;
  const change = previousDay > 0 ? ((previousClose - previousDay) / previousDay) * 100 : 0;
  
  return {
    symbol: data.ticker,
    name: data.ticker, // We don't get the full name from this endpoint
    price: previousClose,
    change_percentage: parseFloat(change.toFixed(2)),
    volume: formatVolume(result.v),
    market_type: 'Stock',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Polygon crypto data to our app's Asset format
 */
export function transformCryptoData(data: PolygonCryptoQuote): Asset | null {
  if (!data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const currentPrice = result.c;
  const openPrice = result.o;
  const change = openPrice > 0 ? ((currentPrice - openPrice) / openPrice) * 100 : 0;
  
  // Remove the X: prefix if present
  const symbol = data.ticker.startsWith('X:') ? data.ticker.substring(2) : data.ticker;
  
  return {
    symbol: symbol,
    name: getCryptoName(symbol),
    price: currentPrice,
    change_percentage: parseFloat(change.toFixed(2)),
    volume: formatVolume(result.v),
    market_type: 'Crypto',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Polygon forex data to our app's Asset format
 */
export function transformForexData(data: PolygonForexQuote): Asset | null {
  if (!data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const currentPrice = result.c;
  const openPrice = result.o;
  const change = openPrice > 0 ? ((currentPrice - openPrice) / openPrice) * 100 : 0;
  
  // Remove the C: prefix and extract currency pairs
  const symbol = data.ticker.startsWith('C:') ? data.ticker.substring(2) : data.ticker;
  const from = symbol.substring(0, 3);
  const to = symbol.substring(3);
  
  return {
    symbol: `${from}/${to}`,
    name: `${from}/${to}`,
    price: currentPrice,
    change_percentage: parseFloat(change.toFixed(2)),
    volume: formatVolume(result.v),
    market_type: 'Forex',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform WebSocket real-time data
 * This handles different asset types based on the symbol pattern
 */
export function transformWebSocketData(data: any): Asset | null {
  if (!data || !data.sym || !data.c) return null;
  
  const symbol = data.sym;
  const currentPrice = data.c;
  const volume = data.v || 0;
  const openPrice = data.o || currentPrice;
  
  // Calculate change percentage
  const change = openPrice > 0 ? ((currentPrice - openPrice) / openPrice) * 100 : 0;
  
  // Determine market type based on symbol patterns
  let marketType = 'Stock';
  let name = symbol;
  
  if (symbol.includes('USD') && symbol.length <= 6) {
    marketType = 'Crypto';
    name = getCryptoName(symbol);
  } else if (symbol.length === 6 && 
            ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
              currency => symbol.includes(currency))) {
    marketType = 'Forex';
    const from = symbol.substring(0, 3);
    const to = symbol.substring(3);
    name = `${from}/${to}`;
  } else if (['SPX', 'NDX', 'DJI', 'US500', 'FTSE', 'DAX'].some(index => symbol.includes(index))) {
    marketType = 'Index';
  } else if (['GC', 'SI', 'CL', 'NG', 'XAUUSD', 'XAGUSD'].some(commodity => symbol.includes(commodity))) {
    marketType = 'Commodity';
  }
  
  return {
    symbol: symbol,
    name: name,
    price: currentPrice,
    change_percentage: parseFloat(change.toFixed(2)),
    volume: formatVolume(volume),
    market_type: marketType,
    last_updated: new Date().toISOString()
  };
}

/**
 * Format volume for display
 */
function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
}

/**
 * Get crypto name from symbol
 */
function getCryptoName(symbol: string): string {
  // Simple mapping for common cryptocurrencies
  const cryptoNames: Record<string, string> = {
    'BTCUSD': 'Bitcoin',
    'ETHUSD': 'Ethereum',
    'LTCUSD': 'Litecoin',
    'XRPUSD': 'Ripple',
    'BCHUSD': 'Bitcoin Cash',
    'ADAUSD': 'Cardano',
    'DOTUSD': 'Polkadot',
    'SOLUSD': 'Solana',
    'LINKUSD': 'Chainlink',
  };
  
  return cryptoNames[symbol] || symbol;
}
