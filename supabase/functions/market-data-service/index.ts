
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

// Data source mapping
const DATA_SOURCES = {
  STOCKS: 'yahoo',
  FOREX: 'alphavantage',
  CRYPTO: 'coingecko',
  INDICES: 'yahoo',
  COMMODITIES: 'alphavantage',
};

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketType, symbols, forceRefresh } = await req.json();
    console.log(`Fetching ${marketType} data for symbols: ${symbols}`);
    
    if (!marketType) {
      throw new Error("Market type is required");
    }

    // Check if we have recent data (within last 15 minutes) unless force refresh is specified
    if (!forceRefresh) {
      const { data: existingData, error: fetchError } = await supabase
        .from('market_data')
        .select('*')
        .eq('market_type', marketType)
        .in('symbol', symbols)
        .gt('last_updated', new Date(Date.now() - 60000 * 15).toISOString()); // Data not older than 15 minutes
      
      if (!fetchError && existingData && existingData.length === symbols.length) {
        console.log(`Using cached data for ${marketType}`);
        return new Response(JSON.stringify({ 
          success: true, 
          data: existingData,
          source: 'cache'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    
    // Determine which source to use based on market type
    let marketData: any[] = [];
    
    switch(marketType.toLowerCase()) {
      case 'stock':
      case 'stocks':
        marketData = await fetchYahooFinanceData(symbols);
        break;
      case 'forex':
        marketData = await fetchAlphaVantageForexData(symbols);
        break;
      case 'crypto':
      case 'cryptocurrency':
        marketData = await fetchCoinGeckoData(symbols);
        break;
      case 'index':
      case 'indices':
        marketData = await fetchYahooFinanceData(symbols);
        break;
      case 'commodity':
      case 'commodities':
        marketData = await fetchAlphaVantageForexData(symbols); // Alpha Vantage also supports commodities
        break;
      default:
        throw new Error(`Unsupported market type: ${marketType}`);
    }
    
    // Update the database with the fetched data
    await updateDatabaseWithMarketData(marketData, marketType);

    // Return the fetched market data
    return new Response(JSON.stringify({ 
      success: true, 
      data: marketData,
      source: 'api'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/**
 * Updates the database with the fetched market data
 */
async function updateDatabaseWithMarketData(marketData: any[], marketType: string) {
  for (const asset of marketData) {
    const { data, error } = await supabase
      .from('market_data')
      .upsert({
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
      }, { onConflict: 'symbol' });

    if (error) {
      console.error(`Error updating market data for ${asset.symbol}:`, error);
    }
  }
}

/**
 * Fetches market data from Yahoo Finance API
 */
async function fetchYahooFinanceData(symbols: string[]): Promise<any[]> {
  try {
    console.log(`Fetching Yahoo Finance data for: ${symbols.join(', ')}`);
    
    // Yahoo Finance uses batch requests with comma-separated symbols
    const yahooSymbols = symbols.join(',');
    
    const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols}`);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.quoteResponse?.result || [];
    
    console.log(`Received ${result.length} results from Yahoo Finance`);
    
    // Transform Yahoo Finance data to our format
    return result.map((item: any) => ({
      symbol: item.symbol,
      name: item.shortName || item.longName,
      price: item.regularMarketPrice,
      change_percentage: item.regularMarketChangePercent,
      volume: formatVolume(item.regularMarketVolume),
      market_cap: formatMarketCap(item.marketCap),
      high_price: item.regularMarketDayHigh,
      low_price: item.regularMarketDayLow,
      open_price: item.regularMarketOpen,
      previous_close: item.regularMarketPreviousClose,
    }));
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error);
    return [];
  }
}

/**
 * Fetches market data from Alpha Vantage API
 */
async function fetchAlphaVantageForexData(symbols: string[]): Promise<any[]> {
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
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
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
            volume: quote['06. volume'],
            market_cap: 'N/A', // Alpha Vantage doesn't provide market cap for commodities
            high_price: null,
            low_price: null,
            open_price: parseFloat(quote['02. open']),
            previous_close: parseFloat(quote['08. previous close']),
          };
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
          volume: 'N/A',
          market_cap: 'N/A',
          high_price: null,
          low_price: null,
          open_price: null,
          previous_close: null,
        };
      }
      
      return null;
    });
    
    // Wait for all requests to complete and filter out nulls
    const results = (await Promise.all(promises)).filter(Boolean);
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
async function fetchCoinGeckoData(symbols: string[]): Promise<any[]> {
  try {
    console.log(`Fetching CoinGecko data for: ${symbols.join(', ')}`);
    
    // CoinGecko uses IDs, not symbols, so we need to map symbols to IDs
    // For simplicity, we'll assume symbols like "BTC" and ids like "bitcoin"
    const symbolToId: Record<string, string> = {
      "BTCUSD": "bitcoin",
      "BTC": "bitcoin",
      "ETHUSD": "ethereum",
      "ETH": "ethereum",
      "XRPUSD": "ripple",
      "XRP": "ripple",
      "LTCUSD": "litecoin",
      "LTC": "litecoin",
      "BCHUSD": "bitcoin-cash",
      "BCH": "bitcoin-cash",
      "ADAUSD": "cardano",
      "ADA": "cardano",
      "DOTUSD": "polkadot",
      "DOT": "polkadot",
      "LINKUSD": "chainlink",
      "LINK": "chainlink",
      "XMRUSD": "monero",
      "XMR": "monero",
      // Add more mappings as needed
    };
    
    // Map symbols to IDs and filter out unmapped ones
    const coinIds = symbols
      .map(symbol => {
        // Remove USD suffix if present
        const cleanSymbol = symbol.replace("USD", "");
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
    return data.map((coin: any) => ({
      symbol: `${coin.symbol.toUpperCase()}USD`, // Standardize to match our format
      name: coin.name,
      price: coin.current_price,
      change_percentage: coin.price_change_percentage_24h,
      volume: formatVolume(coin.total_volume),
      market_cap: formatMarketCap(coin.market_cap),
      high_price: coin.high_24h,
      low_price: coin.low_24h,
      open_price: null, // Not provided directly by CoinGecko in this endpoint
      previous_close: null, // Not provided directly by CoinGecko in this endpoint
    }));
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return [];
  }
}

/**
 * Helper function to get commodity name from symbol
 */
function getCommodityName(symbol: string): string {
  const commodityNames: Record<string, string> = {
    "GC": "Gold",
    "SI": "Silver",
    "CL": "Crude Oil",
    "NG": "Natural Gas",
    "HG": "Copper",
    "XAUUSD": "Gold",
    "XAGUSD": "Silver",
    "USOIL": "Crude Oil",
    "UKOIL": "Brent Crude Oil",
    "NATGAS": "Natural Gas",
    "COPPER": "Copper",
    // Add more mappings as needed
  };
  
  return commodityNames[symbol] || symbol;
}

/**
 * Format volume to a readable string
 */
function formatVolume(volume: number | string | null): string {
  if (volume === null || volume === undefined) return 'N/A';
  
  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  
  if (isNaN(numVolume)) return 'N/A';
  
  if (numVolume >= 1e12) {
    return `$${(numVolume / 1e12).toFixed(1)}T`;
  } else if (numVolume >= 1e9) {
    return `$${(numVolume / 1e9).toFixed(1)}B`;
  } else if (numVolume >= 1e6) {
    return `$${(numVolume / 1e6).toFixed(1)}M`;
  } else if (numVolume >= 1e3) {
    return `$${(numVolume / 1e3).toFixed(1)}K`;
  } else {
    return `$${numVolume.toFixed(0)}`;
  }
}

/**
 * Format market cap to a readable string
 */
function formatMarketCap(marketCap: number | string | null): string {
  if (marketCap === null || marketCap === undefined) return 'N/A';
  
  if (typeof marketCap === 'string' && marketCap !== 'N/A') {
    return marketCap;
  }
  
  const numMarketCap = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
  
  if (isNaN(numMarketCap)) return 'N/A';
  
  if (numMarketCap >= 1e12) {
    return `$${(numMarketCap / 1e12).toFixed(1)}T`;
  } else if (numMarketCap >= 1e9) {
    return `$${(numMarketCap / 1e9).toFixed(1)}B`;
  } else if (numMarketCap >= 1e6) {
    return `$${(numMarketCap / 1e6).toFixed(1)}M`;
  } else if (numMarketCap >= 1e3) {
    return `$${(numMarketCap / 1e3).toFixed(1)}K`;
  } else {
    return `$${numMarketCap.toFixed(0)}`;
  }
}
