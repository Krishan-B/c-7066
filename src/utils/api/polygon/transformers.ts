import { type Asset, type MarketType } from "@/hooks/market/types";

/**
 * Transform ticker details to Asset format
 */
export function transformTickerToAsset(ticker: unknown): Asset | null {
  if (!ticker || typeof ticker !== 'object') return null;
  // Use destructuring and type guards
  const t = ticker as Record<string, unknown>;
  const symbol = typeof t.ticker === 'string' ? t.ticker : typeof t.symbol === 'string' ? t.symbol : '';
  const name = typeof t.name === 'string' ? t.name : symbol;
  const lastTrade = t.lastTrade && typeof t.lastTrade === 'object' ? (t.lastTrade as Record<string, unknown>) : undefined;
  const lastQuote = t.lastQuote && typeof t.lastQuote === 'object' ? (t.lastQuote as Record<string, unknown>) : undefined;
  const price = parseFloat(
    (lastTrade?.p as string | number | undefined)?.toString() ??
    (lastQuote?.p as string | number | undefined)?.toString() ??
    (t.price as string | number | undefined)?.toString() ?? '0'
  );
  const change_percentage = typeof t.todaysChange === 'number' ? t.todaysChange : typeof t.changePercent === 'number' ? t.changePercent : 0;
  const volume = typeof t.volume === 'number' ? t.volume : typeof t.v === 'number' ? t.v : 0;
  const market_type = getMarketType(symbol);
  return {
    symbol,
    name,
    price,
    change_percentage,
    market_type,
    volume: formatVolume(volume),
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform quote to Asset format
 */
export function transformQuoteToAsset(quote: unknown, symbol: string): Asset | null {
  if (!quote || typeof quote !== 'object') return null;
  const q = quote as Record<string, unknown>;
  const lastTrade = q.lastTrade && typeof q.lastTrade === 'object' ? (q.lastTrade as Record<string, unknown>) : undefined;
  const price = parseFloat(
    (typeof q.c === 'number' ? q.c.toString() : typeof q.c === 'string' ? q.c : lastTrade?.p?.toString()) ?? '0'
  );
  const change_percentage = typeof q.dp === 'number' ? q.dp : 0;
  const volume = typeof q.v === 'number' ? q.v : 0;
  const market_type = getMarketType(symbol);
  return {
    symbol,
    name: symbol,
    price,
    change_percentage,
    market_type,
    volume: formatVolume(volume),
    last_updated: new Date().toISOString()
  };
}

/**
 * Determine market type based on symbol
 */
function getMarketType(symbol: string): MarketType {
  if (!symbol) return 'Stock';
  if (symbol.includes('USD') || symbol.includes('BTC') || symbol.includes('ETH')) {
    return 'Crypto';
  } else if (symbol.includes('/') || symbol.endsWith('USD') || /[A-Z]{3}[A-Z]{3}/.test(symbol)) {
    return 'Forex';
  } else if (symbol.startsWith('^') || symbol.includes('INDEX')) {
    return 'Index';
  } else if (symbol.includes('OIL') || symbol.includes('GOLD') || symbol.includes('SILVER')) {
    return 'Commodities';
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
