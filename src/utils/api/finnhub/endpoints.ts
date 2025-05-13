
import { getMarketData } from './client';

export async function getStockQuote(symbol: string) {
  const data = await getMarketData([symbol], 'Stocks');
  return data[0]?.quote;
}

export async function getCryptoQuote(symbol: string) {
  const data = await getMarketData([symbol], 'Crypto');
  return data[0]?.quote;
}

export async function getForexQuote(fromCurrency: string, toCurrency: string) {
  const data = await getMarketData([`${fromCurrency}_${toCurrency}`], 'Forex');
  return data[0]?.quote;
}

export const fetchStocksData = async (symbols: string[] = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']) => {
  return await getMarketData(symbols, 'Stocks');
};

export const fetchCryptoData = async (symbols: string[] = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:BNBUSDT', 'BINANCE:ADAUSDT', 'BINANCE:DOGEUSDT']) => {
  return await getMarketData(symbols, 'Crypto');
};

export const fetchForexData = async (symbols: string[] = ['OANDA:EUR_USD', 'OANDA:GBP_USD', 'OANDA:USD_JPY', 'OANDA:USD_CAD', 'OANDA:AUD_USD']) => {
  return await getMarketData(symbols, 'Forex');
};

export const fetchIndicesData = async (symbols: string[] = ['FOREXCOM:SPXUSD', 'FOREXCOM:NSXUSD', 'FOREXCOM:DJI', 'FOREXCOM:UK100', 'FOREXCOM:DE30']) => {
  return await getMarketData(symbols, 'Indices');
};

export const fetchCommoditiesData = async (symbols: string[] = ['COMEX:GC1!', 'NYMEX:CL1!', 'NYMEX:NG1!', 'COMEX:SI1!', 'CBOT:ZC1!']) => {
  return await getMarketData(symbols, 'Commodities');
};
