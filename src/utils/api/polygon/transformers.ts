
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
 * Transform Polygon quote data to Asset format
 */
export function transformQuoteToAsset(symbol: string, name: string, quoteData: any): Asset | null {
  if (!quoteData || !quoteData.results) {
    return null;
  }
  
  const quote = quoteData.results;
  
  // Determine market type based on symbol pattern
  let marketType = 'Stock';
  
  if (symbol.includes('USD')) {
    marketType = 'Crypto';
  } else if (symbol.includes('/')) {
    marketType = 'Forex';
  } else if (symbol.startsWith('^')) {
    marketType = 'Index';
  }
  
  // Calculate mid price
  const price = (quote.ap + quote.bp) / 2;
  
  // We don't have previous close in quotes, so we can't calculate change
  const changePercentage = 0;
  
  return {
    symbol,
    name,
    price,
    change_percentage: changePercentage,
    market_type: marketType,
    volume: 'N/A',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Polygon trade data to Asset format
 */
export function transformTradeToAsset(symbol: string, name: string, tradeData: any): Asset | null {
  if (!tradeData || !tradeData.results) {
    return null;
  }
  
  const trade = tradeData.results;
  
  // Determine market type based on symbol pattern
  let marketType = 'Stock';
  
  if (symbol.includes('USD')) {
    marketType = 'Crypto';
  } else if (symbol.includes('/')) {
    marketType = 'Forex';
  } else if (symbol.startsWith('^')) {
    marketType = 'Index';
  }
  
  return {
    symbol,
    name,
    price: trade.p,
    change_percentage: 0, // We don't have previous close in trades
    market_type: marketType,
    volume: trade.s ? trade.s.toString() : 'N/A',
    last_updated: new Date().toISOString()
  };
}
