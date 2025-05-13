
import { Asset } from "@/hooks/market/types";

/**
 * Transform ticker details to Asset format
 */
export function transformTickerToAsset(ticker: any): Asset | null {
  if (!ticker) return null;
  
  try {
    return {
      symbol: ticker.ticker || ticker.symbol,
      name: ticker.name || ticker.ticker || ticker.symbol,
      price: parseFloat(ticker.lastTrade?.p || ticker.lastQuote?.p || ticker.price || 0),
      change_percentage: ticker.todaysChange || ticker.changePercent || 0,
      market_type: getMarketType(ticker.ticker || ticker.symbol),
      volume: formatVolume(ticker.volume || ticker.v || 0),
      last_updated: new Date().toISOString()
    };
  } catch (e) {
    console.error('Error transforming ticker to asset:', e);
    return null;
  }
}

/**
 * Transform quote to Asset format
 */
export function transformQuoteToAsset(quote: any, symbol: string): Asset | null {
  if (!quote) return null;
  
  try {
    return {
      symbol,
      name: symbol,
      price: parseFloat(quote.c || quote.lastTrade?.p || 0),
      change_percentage: quote.dp || 0,
      market_type: getMarketType(symbol),
      volume: formatVolume(quote.v || 0),
      last_updated: new Date().toISOString()
    };
  } catch (e) {
    console.error('Error transforming quote to asset:', e);
    return null;
  }
}

/**
 * Determine market type based on symbol
 */
function getMarketType(symbol: string): string {
  if (!symbol) return 'Stock';
  
  if (symbol.includes('USD') || symbol.includes('BTC') || symbol.includes('ETH')) {
    return 'Crypto';
  } else if (symbol.includes('/') || symbol.endsWith('USD') || /[A-Z]{3}[A-Z]{3}/.test(symbol)) {
    return 'Forex';
  } else if (symbol.startsWith('^') || symbol.includes('INDEX')) {
    return 'Index';
  } else if (symbol.includes('OIL') || symbol.includes('GOLD') || symbol.includes('SILVER')) {
    return 'Commodity';
  }
  
  return 'Stock';
}

/**
 * Format volume for display
 */
function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B';
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M';
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K';
  }
  
  return volume.toString();
}
