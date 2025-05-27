/**
 * Transform Alpha Vantage stock data to our app's Asset format
 */
export interface AlphaVantageStockQuote {
  [key: string]: string;
}

export interface AlphaVantageStockData {
  'Global Quote': AlphaVantageStockQuote;
}

export function transformStockData(data: unknown): unknown {
  if (!data || typeof data !== 'object' || !('Global Quote' in data)) return null;
  const quote = (data as AlphaVantageStockData)['Global Quote'];
  if (!quote || Object.keys(quote).length === 0) return null;
  return {
    symbol: quote['01. symbol'],
    name: quote['01. symbol'],
    price: parseFloat(quote['05. price'] ?? '0'),
    change_percentage: parseFloat((quote['10. change percent'] ?? '0').replace('%', '')),
    volume: formatVolume(quote['06. volume'] ?? '0'),
    market_type: 'Stock',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Alpha Vantage forex data to our app's Asset format
 */
export interface AlphaVantageForexRate {
  [key: string]: string;
}
export interface AlphaVantageForexData {
  'Realtime Currency Exchange Rate': AlphaVantageForexRate;
}

export function transformForexData(data: unknown): unknown {
  if (!data || typeof data !== 'object' || !('Realtime Currency Exchange Rate' in data)) return null;
  const exchangeRate = (data as AlphaVantageForexData)['Realtime Currency Exchange Rate'];
  const fromCurrency = exchangeRate['1. From_Currency Code'];
  const toCurrency = exchangeRate['3. To_Currency Code'];
  return {
    symbol: `${fromCurrency}${toCurrency}`,
    name: `${fromCurrency}/${toCurrency}`,
    price: parseFloat(exchangeRate['5. Exchange Rate'] ?? '0'),
    change_percentage: 0,
    volume: "N/A",
    market_type: 'Forex',
    last_updated: exchangeRate['6. Last Refreshed']
  };
}

/**
 * Transform Alpha Vantage crypto data to our app's Asset format
 */
export interface AlphaVantageCryptoTimeSeries {
  [timestamp: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  };
}
export interface AlphaVantageCryptoMetaData {
  [key: string]: string;
}
export interface AlphaVantageCryptoData {
  'Meta Data'?: AlphaVantageCryptoMetaData;
  'Time Series Crypto (5min)': AlphaVantageCryptoTimeSeries;
  symbol?: string;
}

export function transformCryptoData(data: unknown): unknown {
  if (!data || typeof data !== 'object' || !('Time Series Crypto (5min)' in data)) return null;
  const cryptoData = data as AlphaVantageCryptoData;
  const timeSeriesData = cryptoData['Time Series Crypto (5min)'];
  if (!timeSeriesData || typeof timeSeriesData !== 'object') return null;
  const timestamps = Object.keys(timeSeriesData as object).sort().reverse();
  if (timestamps.length === 0) return null;
  const latestTimestamp = timestamps[0];
  const prevTimestamp = timestamps.length > 1 ? timestamps[1] : undefined;
  const latestData = latestTimestamp ? timeSeriesData[latestTimestamp] : undefined;
  const prevData = prevTimestamp ? timeSeriesData[prevTimestamp] : undefined;
  if (!latestData) return null;
  const currentPrice = parseFloat(latestData['4. close'] ?? '0');
  let changePercentage = 0;
  if (prevData) {
    const prevPrice = parseFloat(prevData['4. close'] ?? '0');
    if (prevPrice !== 0) {
      changePercentage = ((currentPrice - prevPrice) / prevPrice) * 100;
    }
  }
  const metaData = cryptoData['Meta Data'];
  const symbol = metaData ? metaData['2. Digital Currency Code'] : cryptoData.symbol || "CRYPTO";
  const market = metaData ? metaData['4. Market Code'] : "USD";
  return {
    symbol: `${symbol}${market}`,
    name: `${symbol}/${market}`,
    price: currentPrice,
    change_percentage: changePercentage,
    volume: formatVolume(latestData['5. volume'] ?? '0'),
    market_type: 'Crypto',
    last_updated: latestTimestamp
  };
}

/**
 * Format volume to a readable string (e.g. 1.2B, 45.3M, etc.)
 */
export function formatVolume(volumeStr: string): string {
  const volume = parseFloat(volumeStr);
  if (isNaN(volume)) return 'N/A';
  
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(1)}K`;
  } else {
    return `$${volume.toFixed(0)}`;
  }
}
