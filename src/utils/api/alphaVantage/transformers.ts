
/**
 * Transform Alpha Vantage stock data to our app's Asset format
 */
export function transformStockData(data: any): any {
  if (!data || !data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) return null;
  
  const quote = data['Global Quote'];
  
  return {
    symbol: quote['01. symbol'],
    name: quote['01. symbol'], // Alpha Vantage doesn't provide name in quote
    price: parseFloat(quote['05. price']),
    change_percentage: parseFloat(quote['10. change percent'].replace('%', '')),
    volume: formatVolume(quote['06. volume']),
    market_type: 'Stock',
    last_updated: new Date().toISOString()
  };
}

/**
 * Transform Alpha Vantage forex data to our app's Asset format
 */
export function transformForexData(data: any): any {
  if (!data || !data['Realtime Currency Exchange Rate']) return null;
  
  const exchangeRate = data['Realtime Currency Exchange Rate'];
  
  const fromCurrency = exchangeRate['1. From_Currency Code'];
  const toCurrency = exchangeRate['3. To_Currency Code'];
  
  return {
    symbol: `${fromCurrency}${toCurrency}`,
    name: `${fromCurrency}/${toCurrency}`,
    price: parseFloat(exchangeRate['5. Exchange Rate']),
    change_percentage: 0, // Alpha Vantage doesn't provide change in this endpoint
    volume: "N/A",
    market_type: 'Forex',
    last_updated: exchangeRate['6. Last Refreshed']
  };
}

/**
 * Transform Alpha Vantage crypto data to our app's Asset format
 */
export function transformCryptoData(data: any): any {
  if (!data || !data['Time Series Crypto (5min)']) return null;
  
  // Get the most recent data point
  const timeSeriesData = data['Time Series Crypto (5min)'];
  const timestamps = Object.keys(timeSeriesData).sort().reverse();
  
  if (timestamps.length === 0) return null;
  
  const latestData = timeSeriesData[timestamps[0]];
  const prevData = timestamps.length > 1 ? timeSeriesData[timestamps[1]] : null;
  
  const currentPrice = parseFloat(latestData['4. close']);
  let changePercentage = 0;
  
  if (prevData) {
    const prevPrice = parseFloat(prevData['4. close']);
    changePercentage = ((currentPrice - prevPrice) / prevPrice) * 100;
  }
  
  const metaData = data['Meta Data'];
  const symbol = metaData ? metaData['2. Digital Currency Code'] : data.symbol || "CRYPTO";
  const market = metaData ? metaData['4. Market Code'] : "USD";
  
  return {
    symbol: `${symbol}${market}`,
    name: `${symbol}/${market}`,
    price: currentPrice,
    change_percentage: changePercentage,
    volume: formatVolume(latestData['5. volume']),
    market_type: 'Crypto',
    last_updated: timestamps[0]
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
