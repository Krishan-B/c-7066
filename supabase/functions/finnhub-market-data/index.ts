
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Handle OPTIONS preflight requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Get market data from Finnhub
async function getMarketData(market: string) {
  const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
  
  if (!FINNHUB_API_KEY) {
    return { error: "Finnhub API key not configured" };
  }

  try {
    let symbols = [];
    let url = "";
    
    // Define symbols based on market type
    switch (market.toLowerCase()) {
      case "crypto":
        symbols = ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT", "BINANCE:DOGEUSDT", "BINANCE:ADAUSDT"];
        break;
      case "stock":
        symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];
        break;
      case "forex":
        symbols = ["OANDA:EUR_USD", "OANDA:GBP_USD", "OANDA:USD_JPY", "OANDA:USD_CAD", "OANDA:AUD_USD"];
        break;
      case "index":
        symbols = ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^N225"];
        break;
      case "commodity":
        symbols = ["CBOT:ZC", "COMEX:GC", "NYMEX:CL", "COMEX:SI", "CBOT:ZS"];
        break;
      default:
        return { error: "Invalid market type" };
    }
    
    // Fetch market data for each symbol
    const marketData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          // Use different endpoint based on market type
          if (market.toLowerCase() === "crypto") {
            url = `https://finnhub.io/api/v1/crypto/candle?symbol=${symbol}&resolution=D&count=1&token=${FINNHUB_API_KEY}`;
          } else if (market.toLowerCase() === "forex") {
            url = `https://finnhub.io/api/v1/forex/candle?symbol=${symbol}&resolution=D&count=1&token=${FINNHUB_API_KEY}`;
          } else {
            url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
          }
          
          const response = await fetch(url);
          const data = await response.json();
          
          // Format the data based on response structure
          let formattedData: any = {};
          
          if (market.toLowerCase() === "crypto" || market.toLowerCase() === "forex") {
            // Candle data format
            if (data.s === "ok" && data.c && data.c.length > 0) {
              const lastIndex = data.c.length - 1;
              const symbolName = symbol.split(":")[1] || symbol;
              
              formattedData = {
                symbol: symbolName,
                name: getAssetName(symbolName),
                price: data.c[lastIndex],
                change_percentage: ((data.c[lastIndex] - data.o[lastIndex]) / data.o[lastIndex]) * 100,
                volume: formatVolume(data.v ? data.v[lastIndex] : 0),
                market_type: market,
                high_price: data.h[lastIndex],
                low_price: data.l[lastIndex],
                open_price: data.o[lastIndex],
                last_price: data.c[lastIndex],
                previous_close: data.o[lastIndex],
                timestamp: new Date(data.t[lastIndex] * 1000).toISOString(),
              };
            }
          } else {
            // Quote data format
            const symbolName = symbol.startsWith("^") ? symbol.substring(1) : symbol;
            
            formattedData = {
              symbol: symbol,
              name: getAssetName(symbolName),
              price: data.c,
              change_percentage: data.dp,
              volume: formatVolume(data.v),
              market_type: market,
              high_price: data.h,
              low_price: data.l,
              open_price: data.o,
              last_price: data.c,
              previous_close: data.pc,
              timestamp: new Date().toISOString(),
            };
          }
          
          return formattedData;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null results and return
    return { data: marketData.filter(Boolean) };
  } catch (error) {
    console.error("Error fetching market data:", error);
    return { error: "Failed to fetch market data" };
  }
}

// Helper to get asset names
function getAssetName(symbol: string) {
  const names: { [key: string]: string } = {
    // Crypto
    "BTCUSDT": "Bitcoin",
    "ETHUSDT": "Ethereum",
    "SOLUSDT": "Solana",
    "DOGEUSDT": "Dogecoin",
    "ADAUSDT": "Cardano",
    
    // Stocks
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corp.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "TSLA": "Tesla Inc.",
    
    // Forex
    "EUR_USD": "Euro/US Dollar",
    "GBP_USD": "British Pound/US Dollar",
    "USD_JPY": "US Dollar/Japanese Yen",
    "USD_CAD": "US Dollar/Canadian Dollar",
    "AUD_USD": "Australian Dollar/US Dollar",
    
    // Indices
    "GSPC": "S&P 500",
    "DJI": "Dow Jones Industrial Average",
    "IXIC": "NASDAQ Composite",
    "FTSE": "FTSE 100",
    "N225": "Nikkei 225",
    
    // Commodities
    "ZC": "Corn Futures",
    "GC": "Gold Futures",
    "CL": "Crude Oil WTI Futures",
    "SI": "Silver Futures",
    "ZS": "Soybean Futures",
  };
  
  return names[symbol] || symbol;
}

// Format volume to human-readable format
function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  } else {
    return volume.toString();
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return handleOptions();
  }
  
  try {
    const { market } = await req.json();
    
    if (!market) {
      return new Response(
        JSON.stringify({ error: "Market type is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    const result = await getMarketData(market);
    
    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Store the data in the Supabase database
    const { supabaseClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = supabaseClient(supabaseUrl, supabaseKey);
    
    // Update or insert market data
    for (const item of result.data) {
      const { data, error } = await supabase
        .from("market_data")
        .upsert(item, { onConflict: "symbol,market_type" });
      
      if (error) {
        console.error("Error storing market data:", error);
      }
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
