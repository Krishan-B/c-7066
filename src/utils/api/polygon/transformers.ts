
import { Asset } from '@/hooks/market';

/**
 * Transform Polygon ticker data to Asset format
 */
export function transformTickerToAsset(tickerData: any, priceData: any = null): Asset | null {
  if (!tickerData || !tickerData.results) {
    return null;
  }
  
  const ticker = tickerData.results;
  
  // Determine market type
  let marketType = 'Stock';
  
  if (ticker.type === 'CS') {
    marketType = 'Stock';
  } else if (ticker.market === 'crypto') {
    marketType = 'Crypto';
  } else if (ticker.market === 'fx') {
    marketType = 'Forex';
  } else if (ticker.type === 'ETF') {
    marketType = 'ETF';
  } else if (ticker.market === 'index') {
    marketType = 'Index';
  }
  
  // Get price from price data or use placeholder
  const price = priceData?.results?.c || priceData?.results?.last?.price || 0;
  const previousClose = priceData?.results?.pc || 0;
  const changePercentage = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;
  
  // Format volume
  const volume = priceData?.results?.v || 0;
  const formattedVolume = volume > 1000000000
    ? `${(volume / 1000000000).toFixed(1)}B`
    : volume > 1000000
      ? `${(volume / 1000000).toFixed(1)}M`
      : volume > 1000
        ? `${(volume / 1000).toFixed(1)}K`
        : volume.toString();
  
  return {
    symbol: ticker.ticker,
    name: ticker.name || ticker.ticker,
    price: price,
    change_percentage: changePercentage,
    market_type: marketType,
    volume: formattedVolume,
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Stock data
 */
export function transformStockData(data: any): Asset | null {
  if (!data || !data.results) {
    return null;
  }
  
  return {
    symbol: data.results.ticker || data.results.symbol,
    name: data.results.name || data.results.ticker || data.results.symbol,
    price: data.results.last?.price || data.results.lastTrade?.p || 0,
    change_percentage: data.results.todaysChange || 0,
    market_type: 'Stock',
    volume: data.results.volume ? `${(data.results.volume / 1000000).toFixed(1)}M` : 'N/A',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Crypto data
 */
export function transformCryptoData(data: any): Asset | null {
  if (!data || !data.results) {
    return null;
  }
  
  return {
    symbol: data.results.ticker || data.results.symbol,
    name: data.results.name || data.results.ticker || data.results.symbol,
    price: data.results.last?.price || data.results.lastTrade?.p || 0,
    change_percentage: data.results.todaysChange || 0,
    market_type: 'Crypto',
    volume: data.results.volume ? `${(data.results.volume / 1000000).toFixed(1)}M` : 'N/A',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Forex data
 */
export function transformForexData(data: any): Asset | null {
  if (!data || !data.results) {
    return null;
  }
  
  return {
    symbol: data.results.ticker || data.results.symbol,
    name: data.results.name || data.results.ticker || data.results.symbol,
    price: data.results.last?.price || data.results.lastTrade?.p || 0,
    change_percentage: data.results.todaysChange || 0,
    market_type: 'Forex',
    volume: data.results.volume ? `${(data.results.volume / 1000000).toFixed(1)}M` : 'N/A',
    last_updated: new Date().toISOString()
  };
}

/**
 * Process WebSocket message to Asset format
 */
export function processPolygonMessage(message: any): Asset | null {
  try {
    // Skip non-trade messages or messages without price data
    if (!message || !message.data || message.data.length === 0) {
      return null;
    }
    
    const data = message.data[0];
    
    // Skip if no symbol or price
    if (!data.sym || !data.p) {
      return null;
    }
    
    // Extract market type from symbol if possible
    let marketType = 'Stock';
    if (data.sym.includes('-')) {
      marketType = 'Crypto';
    } else if (data.sym.includes('/')) {
      marketType = 'Forex';
    }
    
    return {
      symbol: data.sym,
      name: data.sym, // WebSocket doesn't provide names
      price: data.p,
      change_percentage: 0, // WebSocket doesn't provide change
      market_type: marketType,
      volume: data.v ? data.v.toString() : 'N/A',
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing Polygon message:', error);
    return null;
  }
}
