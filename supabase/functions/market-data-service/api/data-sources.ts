// Import types first

// Import Supabase types with proper path to ensure types are found
import { type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { type Asset } from '../types.ts';
import { formatMarketCap, formatVolume, getCommodityName } from '../utils/formatters.ts';

const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

/**
 * Updates the database with the fetched market data
 */
export async function updateDatabaseWithMarketData(
  supabase: SupabaseClient,
  marketData: Asset[],
  marketType: string
): Promise<void> {
  for (const asset of marketData) {
    const { error } = await supabase.from('market_data').upsert(
      {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        change_percentage: asset.change_percentage,
        volume: asset.volume,
        market_cap: asset.market_cap,
        market_type: marketType,
        last_updated: new Date().toISOString(),
        high_price: asset.high_price,
        low_price: asset.low_price,
        open_price: asset.open_price,
        previous_close: asset.previous_close,
      },
      { onConflict: 'symbol' }
    );

    if (error) {
      console.error(`Error updating market data for ${asset.symbol}:`, error);
    }
  }
}

/**
 * Enhanced Yahoo Finance integration using our dedicated edge function
 * Updated for Phase 0 Yahoo Finance Integration
 */
export async function fetchYahooFinanceData(symbols: string[]): Promise<Asset[]> {
  try {
    console.log(`Fetching Yahoo Finance data via edge function for: ${symbols.join(', ')}`);

    // Use our dedicated Yahoo Finance edge function
    const baseUrl = Deno.env.get('SUPABASE_URL') || '';
    const response = await fetch(`${baseUrl}/functions/v1/yahoo-finance-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        symbols: symbols,
        dataType: 'quote',
        useCache: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance edge function error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Yahoo Finance service error: ${data.error || 'Unknown error'}`);
    }

    const result = data.data || [];
    console.log(`Received ${result.length} results from Yahoo Finance edge function`);

    // Transform to our Asset format
    return result.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      price: item.price || 0,
      change_percentage: item.changePercent || 0,
      volume: formatVolume(item.volume),
      market_cap: formatMarketCap(item.marketCap),
      high_price: item.dayHigh || 0,
      low_price: item.dayLow || 0,
      open_price: item.open || 0,
      previous_close: item.previousClose || 0,
    }));
  } catch (error) {
    console.error('Error fetching Yahoo Finance data via edge function:', error);

    // Fallback to direct Yahoo Finance API as backup
    console.log('Attempting fallback to direct Yahoo Finance API...');
    return await fetchYahooFinanceDataDirect(symbols);
  }
}

/**
 * Direct Yahoo Finance API access as fallback
 */
async function fetchYahooFinanceDataDirect(symbols: string[]): Promise<Asset[]> {
  try {
    console.log(`Fallback: Fetching Yahoo Finance data directly for: ${symbols.join(', ')}`);

    // Symbol mapping for direct access
    const symbolMapping: Record<string, string> = {
      EURUSD: 'EURUSD=X',
      GBPUSD: 'GBPUSD=X',
      USDJPY: 'USDJPY=X',
      BTCUSD: 'BTC-USD',
      ETHUSD: 'ETH-USD',
      SPX500: '^GSPC',
      NAS100: '^NDX',
    };

    const yahooSymbols = symbols.map((symbol) => symbolMapping[symbol] || symbol).join(',');

    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketDayHigh,regularMarketDayLow,regularMarketOpen,regularMarketPreviousClose,marketCap,shortName,longName`,
      {
        headers: {
          'User-Agent': 'TradePro-Platform/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance direct API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.quoteResponse?.result || [];

    console.log(`Fallback: Received ${result.length} results from Yahoo Finance direct API`);

    // Transform Yahoo Finance data to our format
    return result.map((item: Record<string, unknown>, index: number) => ({
      symbol: symbols[index] || (item.symbol as string), // Use original symbol
      name: (item.shortName || item.longName || item.symbol) as string,
      price: (item.regularMarketPrice as number) || 0,
      change_percentage: (item.regularMarketChangePercent as number) || 0,
      volume: formatVolume(item.regularMarketVolume as number | string | null),
      market_cap: formatMarketCap(item.marketCap as number | string | null),
      high_price: (item.regularMarketDayHigh as number) || 0,
      low_price: (item.regularMarketDayLow as number) || 0,
      open_price: (item.regularMarketOpen as number) || 0,
      previous_close: (item.regularMarketPreviousClose as number) || 0,
    }));
  } catch (error) {
    console.error('Fallback Yahoo Finance direct API also failed:', error);
    return [];
  }
}

/**
 * Fetches market data from Alpha Vantage API
 */
export async function fetchAlphaVantageForexData(symbols: string[]): Promise<Asset[]> {
  try {
    const apiKey = ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      console.error('Alpha Vantage API key not configured');
      return [];
    }

    console.log(`Fetching Alpha Vantage data for: ${symbols.join(', ')}`);

    // Alpha Vantage doesn't support batch requests, so we need to fetch each symbol individually
    const promises = symbols.map(async (symbol) => {
      // Parse forex pairs
      let fromCurrency, toCurrency;

      // Handle different forex pair formats
      if (symbol.includes('/')) {
        [fromCurrency, toCurrency] = symbol.split('/');
      } else if (symbol.length === 6) {
        // Format like EURUSD
        fromCurrency = symbol.substring(0, 3);
        toCurrency = symbol.substring(3, 6);
      } else {
        // For commodities, use a different endpoint
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
        );
        if (!response.ok) {
          throw new Error(`Alpha Vantage API error: ${response.status}`);
        }

        const data = await response.json();
        if (data['Global Quote']) {
          const quote = data['Global Quote'];
          return {
            symbol: symbol,
            name: getCommodityName(symbol),
            price: parseFloat(quote['05. price']),
            change_percentage: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: quote['06. volume'] as string,
            market_cap: 'N/A', // Alpha Vantage doesn't provide market cap for commodities
            market_type: 'Commodity',
            high_price: undefined, // Use undefined instead of null to match Asset type
            low_price: undefined, // Use undefined instead of null to match Asset type
            open_price: parseFloat(quote['02. open']),
            previous_close: parseFloat(quote['08. previous close']),
          } as Asset;
        }
        return null;
      }

      // For forex pairs
      const response = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();
      const exchangeRate = data['Realtime Currency Exchange Rate'];

      if (exchangeRate) {
        return {
          symbol,
          name: `${fromCurrency}/${toCurrency}`,
          price: parseFloat(exchangeRate['5. Exchange Rate']),
          change_percentage: 0, // Alpha Vantage doesn't provide change in this endpoint
          volume: 'N/A' as string,
          market_cap: 'N/A' as string,
          market_type: 'Forex',
          high_price: undefined, // Use undefined instead of null to match Asset type
          low_price: undefined, // Use undefined instead of null to match Asset type
          open_price: undefined, // Use undefined instead of null to match Asset type
          previous_close: undefined, // Use undefined instead of null to match Asset type
        } as Asset;
      }

      return null;
    });

    // Wait for all requests to complete and filter out nulls
    const results = (await Promise.all(promises)).filter(
      (result): result is Asset => result !== null
    );
    console.log(`Received ${results.length} results from Alpha Vantage`);

    return results;
  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error);
    return [];
  }
}

/**
 * Fetches market data from CoinGecko API
 */
export async function fetchCoinGeckoData(symbols: string[]): Promise<Asset[]> {
  try {
    console.log(`Fetching CoinGecko data for: ${symbols.join(', ')}`);

    // CoinGecko uses IDs, not symbols, so we need to map symbols to IDs
    // For simplicity, we'll assume symbols like "BTC" and ids like "bitcoin"
    const symbolToId: Record<string, string> = {
      BTCUSD: 'bitcoin',
      BTC: 'bitcoin',
      ETHUSD: 'ethereum',
      ETH: 'ethereum',
      XRPUSD: 'ripple',
      XRP: 'ripple',
      LTCUSD: 'litecoin',
      LTC: 'litecoin',
      BCHUSD: 'bitcoin-cash',
      BCH: 'bitcoin-cash',
      ADAUSD: 'cardano',
      ADA: 'cardano',
      DOTUSD: 'polkadot',
      DOT: 'polkadot',
      LINKUSD: 'chainlink',
      LINK: 'chainlink',
      XMRUSD: 'monero',
      XMR: 'monero',
      SOLUSD: 'solana',
      SOL: 'solana',
      // Add more mappings as needed
    };

    // Map symbols to IDs and filter out unmapped ones
    const coinIds = symbols
      .map((symbol) => {
        // Remove USD suffix if present
        const cleanSymbol = symbol.replace('USD', '');
        return symbolToId[symbol] || symbolToId[cleanSymbol];
      })
      .filter(Boolean);

    // Fetch data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Received ${data.length} results from CoinGecko`);

    // Transform CoinGecko data to our format
    return data.map((coin: Record<string, unknown>) => ({
      symbol: `${String(coin.symbol).toUpperCase()}USD`, // Standardize to match our format
      name: coin.name as string,
      price: coin.current_price as number,
      change_percentage: coin.price_change_percentage_24h as number,
      volume: formatVolume(coin.total_volume as number),
      market_cap: formatMarketCap(coin.market_cap as number),
      market_type: 'Crypto',
      high_price: coin.high_24h as number,
      low_price: coin.low_24h as number,
      open_price: undefined, // Not provided directly by CoinGecko in this endpoint
      previous_close: undefined, // Not provided directly by CoinGecko in this endpoint
    }));
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return [];
  }
}
