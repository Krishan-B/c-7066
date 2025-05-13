
import { Asset } from '@/hooks/market/types';

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface SymbolLookupResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

/**
 * Transform Finnhub quote data to our Asset format
 */
export function transformQuoteToAsset(
  symbol: string, 
  name: string, 
  quote: FinnhubQuote, 
  marketType: string
): Asset {
  // Format volume for display (number in billions/millions/thousands)
  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    } else {
      return volume.toString();
    }
  };

  // For demo purposes, create a mock volume based on price
  const mockVolume = quote.c * 100000;

  return {
    symbol: symbol,
    name: name,
    price: quote.c,
    change_percentage: quote.dp,
    volume: formatVolume(mockVolume),
    market_type: marketType,
    // Additional data that might be useful
    market_cap: formatVolume(quote.c * mockVolume),
    last_updated: new Date(quote.t * 1000).toISOString()
  };
}

/**
 * Get a readable name from a symbol
 * Removes exchange prefix, converts to title case, etc.
 */
export function getReadableName(symbol: string): string {
  // Remove exchange prefix if present (e.g., BINANCE:BTCUSDT -> BTCUSDT)
  let name = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  // Handle crypto pairs
  if (name.endsWith('USDT')) {
    name = name.replace('USDT', '/USDT');
  } else if (name.endsWith('USD')) {
    name = name.replace('USD', '/USD');
  } else if (name.includes('_')) {
    // Handle forex pairs (EUR_USD -> EUR/USD)
    name = name.replace('_', '/');
  } else if (name.endsWith('!')) {
    // Handle futures (CL1! -> Crude Oil)
    name = name.replace('!', ' Futures');
  }
  
  // Map some common ticker symbols to full names
  const nameMap: Record<string, string> = {
    'BTCUSDT': 'Bitcoin',
    'ETHUSDT': 'Ethereum',
    'BNBUSDT': 'Binance Coin',
    'ADAUSDT': 'Cardano',
    'DOGEUSDT': 'Dogecoin',
    'BTC/USDT': 'Bitcoin',
    'ETH/USDT': 'Ethereum',
    'BNB/USDT': 'Binance Coin',
    'ADA/USDT': 'Cardano',
    'DOGE/USDT': 'Dogecoin',
    'EUR/USD': 'Euro/US Dollar',
    'GBP/USD': 'Pound/US Dollar',
    'USD/JPY': 'US Dollar/Yen',
    'USD/CAD': 'US Dollar/CAD',
    'AUD/USD': 'Australian Dollar/USD',
    'SPXUSD': 'S&P 500',
    'NSXUSD': 'Nasdaq',
    'DJI': 'Dow Jones',
    'UK100': 'FTSE 100',
    'DE30': 'DAX',
    'GC1': 'Gold',
    'SI1': 'Silver',
    'CL1': 'Crude Oil',
    'NG1': 'Natural Gas',
    'ZC1': 'Corn'
  };
  
  return nameMap[name] || name;
}
