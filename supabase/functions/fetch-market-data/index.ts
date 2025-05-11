
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

// Asset market data generators
const assetGenerators = {
  Stock: generateStockData,
  Index: generateIndexData,
  Commodity: generateCommodityData,
  Forex: generateForexData,
  Crypto: generateCryptoData
};

/**
 * Handles the request, fetches market data, and updates the database
 */
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the market type from the request
    const { market } = await req.json();
    
    if (!market) {
      throw new Error("Market type is required");
    }

    // Generate market data for the specified market
    const marketData = generateMarketData(market);
    
    // Update the database with the generated data
    await updateDatabaseWithMarketData(marketData);

    // Return the generated market data
    return new Response(JSON.stringify({ success: true, data: marketData }), {
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
 * Generates market data for a specific market type
 */
function generateMarketData(market: string) {
  if (!assetGenerators[market]) {
    throw new Error(`Invalid market type: ${market}`);
  }
  
  const assetDefinitions = assetGenerators[market]();
  return generatePriceFluctuations(assetDefinitions, market);
}

/**
 * Updates the database with the generated market data
 */
async function updateDatabaseWithMarketData(marketData: any[]) {
  for (const asset of marketData) {
    await supabase
      .from('market_data')
      .upsert({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        change_percentage: asset.change_percentage,
        volume: asset.volume,
        market_cap: asset.market_cap,
        market_type: asset.market_type,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'symbol' });
  }
}

/**
 * Generates realistic price fluctuations for assets
 */
function generatePriceFluctuations(assets: any[], marketType: string) {
  return assets.map(asset => {
    // Generate a random price fluctuation between -3% and +3%
    const randomFluctuation = (Math.random() * 6 - 3) / 100;
    
    // Calculate the new price with the random fluctuation
    const price = parseFloat((asset.base * (1 + randomFluctuation)).toFixed(2));
    
    // Calculate the change percentage (-3% to +3%)
    const changePercentage = parseFloat((randomFluctuation * 100).toFixed(2));
    
    // Generate volume (in billions or millions) based on market capitalization
    const volumeValue = price > 1000 
      ? (Math.random() * 10 + 5).toFixed(1) + 'B' 
      : (Math.random() * 50 + 10).toFixed(1) + 'M';
    
    // Generate market cap for stocks and crypto
    const marketCap = (marketType === 'Stock' || marketType === 'Crypto') 
      ? (price * (Math.random() * 10 + 1) * 1e9).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })
      : undefined;

    // Return the asset with updated values
    return {
      symbol: asset.symbol,
      name: asset.name,
      price,
      change_percentage: changePercentage,
      volume: volumeValue,
      market_cap: marketCap,
      market_type: marketType
    };
  });
}

/**
 * Generates stock market assets
 */
function generateStockData() {
  return [
    { symbol: "AAPL", name: "Apple Inc.", base: 190 },
    { symbol: "AMZN", name: "Amazon.com Inc.", base: 180 },
    { symbol: "GOOGL", name: "Alphabet Inc. (Google)", base: 145 },
    { symbol: "TSLA", name: "Tesla Inc.", base: 175 },
    { symbol: "MSFT", name: "Microsoft Corporation", base: 415 },
    { symbol: "META", name: "Meta Platforms Inc.", base: 475 },
    { symbol: "NVDA", name: "NVIDIA Corporation", base: 880 },
    { symbol: "JPM", name: "JPMorgan Chase & Co.", base: 195 },
    { symbol: "BAC", name: "Bank of America Corporation", base: 38 },
    { symbol: "WFC", name: "Wells Fargo & Company", base: 58 },
    { symbol: "PFE", name: "Pfizer Inc.", base: 28 },
    { symbol: "JNJ", name: "Johnson & Johnson", base: 155 },
    { symbol: "PG", name: "Procter & Gamble Company", base: 167 },
    { symbol: "KO", name: "Coca-Cola Company", base: 61 },
    { symbol: "PEP", name: "PepsiCo, Inc.", base: 172 },
    { symbol: "WMT", name: "Walmart Inc.", base: 60 },
    { symbol: "XOM", name: "Exxon Mobil Corporation", base: 115 },
    { symbol: "CVX", name: "Chevron Corporation", base: 155 },
    { symbol: "INTC", name: "Intel Corporation", base: 35 },
    { symbol: "AMD", name: "Advanced Micro Devices, Inc.", base: 165 },
    { symbol: "NFLX", name: "Netflix, Inc.", base: 620 },
    { symbol: "ADBE", name: "Adobe Inc.", base: 525 },
    { symbol: "CRM", name: "Salesforce, Inc.", base: 280 },
    { symbol: "V", name: "Visa Inc.", base: 270 },
    { symbol: "MA", name: "Mastercard Incorporated", base: 430 },
    { symbol: "HD", name: "Home Depot, Inc.", base: 345 },
    { symbol: "BA", name: "Boeing Company", base: 190 },
    { symbol: "CAT", name: "Caterpillar Inc.", base: 340 },
    { symbol: "MCD", name: "McDonald's Corporation", base: 280 },
    { symbol: "MRK", name: "Merck & Co., Inc.", base: 125 },
  ];
}

/**
 * Generates index market assets
 */
function generateIndexData() {
  return [
    { symbol: "US500", name: "S&P 500", base: 5200 },
    { symbol: "US100", name: "NASDAQ 100", base: 18100 },
    { symbol: "US30", name: "Dow Jones Industrial Average", base: 39800 },
    { symbol: "UK100", name: "FTSE 100", base: 8300 },
    { symbol: "DE40", name: "DAX 40 (Germany)", base: 18400 },
    { symbol: "JP225", name: "Nikkei 225", base: 37900 },
    { symbol: "FR40", name: "CAC 40 (France)", base: 8000 },
    { symbol: "EU50", name: "EURO STOXX 50", base: 4950 },
    { symbol: "HK50", name: "Hang Seng Index", base: 18200 },
    { symbol: "AUS200", name: "ASX 200 (Australia)", base: 7700 },
    { symbol: "CN50", name: "Shanghai Composite", base: 3100 },
    { symbol: "ES35", name: "IBEX 35 (Spain)", base: 10900 },
    { symbol: "IT40", name: "FTSE MIB (Italy)", base: 33500 },
    { symbol: "CA60", name: "S&P/TSX Composite (Canada)", base: 21800 },
    { symbol: "KS200", name: "KOSPI (South Korea)", base: 2600 },
  ];
}

/**
 * Generates commodity market assets
 */
function generateCommodityData() {
  return [
    { symbol: "XAUUSD", name: "Gold", base: 2320 },
    { symbol: "XAGUSD", name: "Silver", base: 27 },
    { symbol: "USOIL", name: "Crude Oil (WTI)", base: 82 },
    { symbol: "UKOIL", name: "Brent Crude Oil", base: 86 },
    { symbol: "NG", name: "Natural Gas", base: 1.8 },
    { symbol: "COPPER", name: "Copper", base: 4.5 },
    { symbol: "COFFEE", name: "Coffee", base: 2.2 },
    { symbol: "SOYBN", name: "Soybeans", base: 12 },
    { symbol: "XPTUSD", name: "Platinum", base: 1025 },
    { symbol: "XPDUSD", name: "Palladium", base: 950 },
    { symbol: "CORN", name: "Corn", base: 4.5 },
    { symbol: "WHEAT", name: "Wheat", base: 6.2 },
    { symbol: "SUGAR", name: "Sugar", base: 0.24 },
    { symbol: "COCOA", name: "Cocoa", base: 8.5 },
    { symbol: "COTTON", name: "Cotton", base: 0.85 },
  ];
}

/**
 * Generates forex market assets
 */
function generateForexData() {
  return [
    { symbol: "EURUSD", name: "Euro / US Dollar", base: 1.093 },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", base: 156.7 },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", base: 1.268 },
    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", base: 0.658 },
    { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", base: 1.366 },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc", base: 0.908 },
    { symbol: "EURGBP", name: "Euro / British Pound", base: 0.861 },
    { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", base: 0.610 },
    { symbol: "EURJPY", name: "Euro / Japanese Yen", base: 171.5 },
    { symbol: "GBPJPY", name: "British Pound / Japanese Yen", base: 199.3 },
    { symbol: "AUDJPY", name: "Australian Dollar / Japanese Yen", base: 103.2 },
    { symbol: "USDCNH", name: "US Dollar / Chinese Yuan", base: 7.22 },
    { symbol: "EURAUD", name: "Euro / Australian Dollar", base: 1.66 },
    { symbol: "USDZAR", name: "US Dollar / South African Rand", base: 18.5 },
    { symbol: "USDSGD", name: "US Dollar / Singapore Dollar", base: 1.34 },
  ];
}

/**
 * Generates crypto market assets
 */
function generateCryptoData() {
  return [
    { symbol: "BTCUSD", name: "Bitcoin", base: 67500 },
    { symbol: "ETHUSD", name: "Ethereum", base: 3200 },
    { symbol: "XRPUSD", name: "Ripple", base: 0.51 },
    { symbol: "LTCUSD", name: "Litecoin", base: 78 },
    { symbol: "BCHUSD", name: "Bitcoin Cash", base: 340 },
    { symbol: "SOLUSD", name: "Solana", base: 143 },
    { symbol: "ADAUSD", name: "Cardano", base: 0.54 },
    { symbol: "DOGEUSD", name: "Dogecoin", base: 0.14 },
    { symbol: "BNBUSD", name: "Binance Coin", base: 580 },
    { symbol: "DOTUSD", name: "Polkadot", base: 7.2 },
    { symbol: "LINKUSD", name: "Chainlink", base: 14.5 },
    { symbol: "AVAXUSD", name: "Avalanche", base: 35.8 },
  ];
}
