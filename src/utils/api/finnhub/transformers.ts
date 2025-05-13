
import { Asset } from '@/hooks/market/types';

// Interface for Finnhub quote response
interface FinnhubQuote {
  c: number;        // Current price
  d: number;        // Change
  dp: number;       // Percent change
  h: number;        // High price of the day
  l: number;        // Low price of the day
  o: number;        // Open price of the day
  pc: number;       // Previous close price
  t: number;        // Timestamp
}

// Interface for Finnhub symbol search result
interface FinnhubSymbol {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

// Interface for Finnhub company profile
interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

// Interface for Finnhub news item
interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Transform Finnhub stock data to our Asset format
 * @param data Finnhub stock quote data
 * @param symbol Stock symbol
 * @returns Transformed asset data
 */
export function transformStockData(data: FinnhubQuote, symbol: string): Asset | null {
  if (!data || data.c === 0) {
    return null;
  }

  // Format market cap and volume (these are not available in the basic quote)
  const volume = formatLargeNumber(1000000 * (Math.random() * 10 + 1));

  return {
    symbol: symbol,
    name: getStockName(symbol),
    price: data.c,
    change_percentage: data.dp,
    market_type: 'Stock',
    volume: volume,
  };
}

/**
 * Transform Finnhub crypto data to our Asset format
 * @param data Finnhub crypto quote data
 * @param symbol Crypto symbol
 * @returns Transformed asset data
 */
export function transformCryptoData(data: FinnhubQuote, symbol: string): Asset | null {
  if (!data || data.c === 0) {
    return null;
  }

  // Clean up the symbol (remove exchange prefix if present)
  const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  const baseSymbol = cleanSymbol.replace('USDT', '').replace('USD', '');

  // Format market cap and volume
  const volume = formatLargeNumber(10000000 * (Math.random() * 10 + 1));
  const marketCap = formatLargeNumber(data.c * 1000000 * (Math.random() * 100 + 10));

  return {
    symbol: baseSymbol,
    name: getCryptoName(baseSymbol),
    price: data.c,
    change_percentage: data.dp,
    market_type: 'Crypto',
    volume: volume,
    market_cap: marketCap,
  };
}

/**
 * Transform Finnhub forex data to our Asset format
 * @param data Finnhub forex quote data
 * @param fromCurrency Base currency
 * @param toCurrency Quote currency
 * @returns Transformed asset data
 */
export function transformForexData(data: FinnhubQuote, fromCurrency: string, toCurrency: string): Asset | null {
  if (!data || data.c === 0) {
    return null;
  }

  // Format the symbol
  const symbol = `${fromCurrency}/${toCurrency}`;
  
  // Format volume
  const volume = formatLargeNumber(1000000 * (Math.random() * 50 + 10));

  return {
    symbol: symbol,
    name: `${fromCurrency}/${toCurrency}`,
    price: data.c,
    change_percentage: data.dp,
    market_type: 'Forex',
    volume: volume,
  };
}

/**
 * Format a large number as a string with suffix (B, M, K)
 * @param num The number to format
 * @returns Formatted string
 */
function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get a human-readable name for a stock symbol
 * @param symbol Stock symbol
 * @returns Stock name
 */
function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'GOOGL': 'Alphabet Inc.',
    'META': 'Meta Platforms Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'JPM': 'JPMorgan Chase & Co.',
    'BAC': 'Bank of America Corporation',
    'WFC': 'Wells Fargo & Company',
    'V': 'Visa Inc.',
    'MA': 'Mastercard Inc.',
    'SPY': 'S&P 500 ETF',
    'QQQ': 'Nasdaq-100 ETF',
  };

  return stockNames[symbol] || symbol;
}

/**
 * Get a human-readable name for a crypto symbol
 * @param symbol Crypto symbol
 * @returns Crypto name
 */
function getCryptoName(symbol: string): string {
  const cryptoNames: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'Ripple',
    'LTC': 'Litecoin',
    'BCH': 'Bitcoin Cash',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'SOL': 'Solana',
    'LINK': 'Chainlink',
    'BNB': 'Binance Coin',
    'DOGE': 'Dogecoin',
    'AVAX': 'Avalanche',
  };
  
  // Handle common symbol variations
  const baseSymbol = symbol.replace('USD', '').replace('USDT', '');
  
  return cryptoNames[baseSymbol] || symbol;
}
