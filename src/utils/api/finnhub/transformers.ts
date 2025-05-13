
import { FinnhubQuote } from './client';
import { Asset } from '@/hooks/market/types';

/**
 * Transform stock data from Finnhub to a standardized format
 */
export function transformStockData(data: FinnhubQuote, symbol: string): Asset {
  return {
    symbol: symbol,
    name: getStockName(symbol),
    price: data.c,
    change_percentage: data.dp,
    volume: formatLargeNumber(1000000 + Math.random() * 10000000), // Simulated volume
    market_cap: formatLargeNumber(data.c * (1000000 + Math.random() * 100000000)), // Simulated market cap
    market_type: 'Stocks',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform crypto data from Finnhub to a standardized format
 */
export function transformCryptoData(data: FinnhubQuote, symbol: string): Asset {
  return {
    symbol: symbol,
    name: getCryptoName(symbol),
    price: data.c,
    change_percentage: data.dp,
    volume: formatLargeNumber(10000000 + Math.random() * 100000000), // Simulated volume
    market_cap: formatLargeNumber(data.c * (10000000 + Math.random() * 1000000000)), // Simulated market cap
    market_type: 'Crypto',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform forex data from Finnhub to a standardized format
 */
export function transformForexData(data: FinnhubQuote, fromCurrency: string, toCurrency: string): Asset {
  const symbol = `${fromCurrency}/${toCurrency}`;
  return {
    symbol: symbol,
    name: `${fromCurrency}/${toCurrency}`,
    price: data.c,
    change_percentage: data.dp,
    volume: formatLargeNumber(50000000 + Math.random() * 500000000), // Simulated volume
    market_type: 'Forex',
    last_updated: new Date().toISOString()
  };
}

// Helper functions
function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corp.',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corp.',
    'JPM': 'JPMorgan Chase & Co.',
    'BAC': 'Bank of America Corp.',
    'WMT': 'Walmart Inc.'
  };
  return stockNames[symbol] || symbol;
}

function getCryptoName(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'BINANCE:BTCUSDT': 'Bitcoin',
    'BINANCE:ETHUSDT': 'Ethereum',
    'BINANCE:BNBUSDT': 'Binance Coin',
    'BINANCE:ADAUSDT': 'Cardano',
    'BINANCE:DOGEUSDT': 'Dogecoin',
    'BINANCE:XRPUSDT': 'Ripple',
    'BINANCE:DOTUSDT': 'Polkadot',
    'BINANCE:LTCUSDT': 'Litecoin',
    'BINANCE:LINKUSDT': 'Chainlink',
    'BINANCE:BCHUSDT': 'Bitcoin Cash'
  };
  return symbolMap[symbol] || symbol.replace('BINANCE:', '');
}

function formatLargeNumber(num: number): string {
  // Format large numbers for volume and market cap
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}
