
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

// Generate mock market data instead of fetching from Finnhub
async function getMockMarketData(market: string) {
  try {
    let mockData = [];
    
    // Define mock data based on market type
    switch (market.toLowerCase()) {
      case "crypto":
        mockData = [
          {
            symbol: "BTCUSDT",
            name: "Bitcoin",
            price: 67543.21,
            change_percentage: 2.4,
            volume: "14.2B",
            market_type: "crypto",
            high_price: 68125.45,
            low_price: 66891.32,
            open_price: 66932.15,
            last_price: 67543.21,
            previous_close: 66932.15,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "ETHUSDT",
            name: "Ethereum",
            price: 3211.43,
            change_percentage: -1.2,
            volume: "5.7B",
            market_type: "crypto",
            high_price: 3315.78,
            low_price: 3180.45,
            open_price: 3250.65,
            last_price: 3211.43,
            previous_close: 3250.65,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "SOLUSDT",
            name: "Solana",
            price: 143.56,
            change_percentage: 3.8,
            volume: "1.2B",
            market_type: "crypto",
            high_price: 145.21,
            low_price: 138.45,
            open_price: 138.32,
            last_price: 143.56,
            previous_close: 138.32,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "DOGEUSDT",
            name: "Dogecoin",
            price: 0.1234,
            change_percentage: 5.1,
            volume: "845.3M",
            market_type: "crypto",
            high_price: 0.1278,
            low_price: 0.1176,
            open_price: 0.1176,
            last_price: 0.1234,
            previous_close: 0.1176,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "ADAUSDT",
            name: "Cardano",
            price: 0.4532,
            change_percentage: -0.3,
            volume: "432.1M",
            market_type: "crypto",
            high_price: 0.4578,
            low_price: 0.4489,
            open_price: 0.4545,
            last_price: 0.4532,
            previous_close: 0.4545,
            timestamp: new Date().toISOString(),
          }
        ];
        break;
      case "stock":
        mockData = [
          {
            symbol: "AAPL",
            name: "Apple Inc.",
            price: 184.21,
            change_percentage: 0.4,
            volume: "58.3M",
            market_type: "stock",
            high_price: 185.42,
            low_price: 183.10,
            open_price: 183.45,
            last_price: 184.21,
            previous_close: 183.45,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "MSFT",
            name: "Microsoft Corp.",
            price: 410.34,
            change_percentage: 1.2,
            volume: "23.1M",
            market_type: "stock",
            high_price: 413.21,
            low_price: 405.67,
            open_price: 405.78,
            last_price: 410.34,
            previous_close: 405.78,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "GOOGL",
            name: "Alphabet Inc.",
            price: 165.78,
            change_percentage: -0.7,
            volume: "18.4M",
            market_type: "stock",
            high_price: 167.34,
            low_price: 164.21,
            open_price: 166.89,
            last_price: 165.78,
            previous_close: 166.89,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "AMZN",
            name: "Amazon.com Inc.",
            price: 178.32,
            change_percentage: 1.8,
            volume: "32.7M",
            market_type: "stock",
            high_price: 180.21,
            low_price: 175.45,
            open_price: 175.23,
            last_price: 178.32,
            previous_close: 175.23,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "TSLA",
            name: "Tesla Inc.",
            price: 173.45,
            change_percentage: -2.1,
            volume: "87.3M",
            market_type: "stock",
            high_price: 178.90,
            low_price: 172.45,
            open_price: 177.21,
            last_price: 173.45,
            previous_close: 177.21,
            timestamp: new Date().toISOString(),
          }
        ];
        break;
      case "forex":
        mockData = [
          {
            symbol: "EUR_USD",
            name: "Euro/US Dollar",
            price: 1.0934,
            change_percentage: -0.1,
            volume: "98.2B",
            market_type: "forex",
            high_price: 1.0956,
            low_price: 1.0923,
            open_price: 1.0945,
            last_price: 1.0934,
            previous_close: 1.0945,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "GBP_USD",
            name: "British Pound/US Dollar",
            price: 1.2654,
            change_percentage: 0.3,
            volume: "45.7B",
            market_type: "forex",
            high_price: 1.2678,
            low_price: 1.2621,
            open_price: 1.2632,
            last_price: 1.2654,
            previous_close: 1.2632,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "USD_JPY",
            name: "US Dollar/Japanese Yen",
            price: 153.67,
            change_percentage: 0.2,
            volume: "37.8B",
            market_type: "forex",
            high_price: 153.89,
            low_price: 153.21,
            open_price: 153.34,
            last_price: 153.67,
            previous_close: 153.34,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "USD_CAD",
            name: "US Dollar/Canadian Dollar",
            price: 1.3576,
            change_percentage: -0.3,
            volume: "18.3B",
            market_type: "forex",
            high_price: 1.3598,
            low_price: 1.3545,
            open_price: 1.3595,
            last_price: 1.3576,
            previous_close: 1.3595,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "AUD_USD",
            name: "Australian Dollar/US Dollar",
            price: 0.6534,
            change_percentage: 0.5,
            volume: "15.7B",
            market_type: "forex",
            high_price: 0.6547,
            low_price: 0.6512,
            open_price: 0.6512,
            last_price: 0.6534,
            previous_close: 0.6512,
            timestamp: new Date().toISOString(),
          }
        ];
        break;
      case "index":
        mockData = [
          {
            symbol: "GSPC",
            name: "S&P 500",
            price: 5204.35,
            change_percentage: 0.4,
            volume: "2.1B",
            market_type: "index",
            high_price: 5217.89,
            low_price: 5194.32,
            open_price: 5196.45,
            last_price: 5204.35,
            previous_close: 5196.45,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "DJI",
            name: "Dow Jones Industrial Average",
            price: 38567.12,
            change_percentage: 0.2,
            volume: "320.4M",
            market_type: "index",
            high_price: 38612.45,
            low_price: 38532.17,
            open_price: 38545.32,
            last_price: 38567.12,
            previous_close: 38545.32,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "IXIC",
            name: "NASDAQ Composite",
            price: 16321.78,
            change_percentage: 0.8,
            volume: "1.8B",
            market_type: "index",
            high_price: 16365.45,
            low_price: 16278.32,
            open_price: 16285.23,
            last_price: 16321.78,
            previous_close: 16285.23,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "FTSE",
            name: "FTSE 100",
            price: 7876.34,
            change_percentage: -0.3,
            volume: "453.2M",
            market_type: "index",
            high_price: 7912.45,
            low_price: 7865.23,
            open_price: 7895.45,
            last_price: 7876.34,
            previous_close: 7895.45,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "N225",
            name: "Nikkei 225",
            price: 38432.56,
            change_percentage: 1.2,
            volume: "567.3M",
            market_type: "index",
            high_price: 38521.34,
            low_price: 38345.21,
            open_price: 37978.45,
            last_price: 38432.56,
            previous_close: 37978.45,
            timestamp: new Date().toISOString(),
          }
        ];
        break;
      case "commodity":
        mockData = [
          {
            symbol: "GC",
            name: "Gold Futures",
            price: 2326.45,
            change_percentage: 1.3,
            volume: "215.4K",
            market_type: "commodity",
            high_price: 2334.12,
            low_price: 2315.67,
            open_price: 2298.32,
            last_price: 2326.45,
            previous_close: 2298.32,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "CL",
            name: "Crude Oil WTI Futures",
            price: 74.32,
            change_percentage: -0.8,
            volume: "354.7K",
            market_type: "commodity",
            high_price: 75.21,
            low_price: 74.10,
            open_price: 74.89,
            last_price: 74.32,
            previous_close: 74.89,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "SI",
            name: "Silver Futures",
            price: 27.45,
            change_percentage: 2.1,
            volume: "132.5K",
            market_type: "commodity",
            high_price: 27.67,
            low_price: 26.89,
            open_price: 26.91,
            last_price: 27.45,
            previous_close: 26.91,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "ZC",
            name: "Corn Futures",
            price: 442.75,
            change_percentage: 0.4,
            volume: "87.2K",
            market_type: "commodity",
            high_price: 445.25,
            low_price: 440.50,
            open_price: 441.25,
            last_price: 442.75,
            previous_close: 441.25,
            timestamp: new Date().toISOString(),
          },
          {
            symbol: "ZS",
            name: "Soybean Futures",
            price: 1182.25,
            change_percentage: -0.3,
            volume: "76.3K",
            market_type: "commodity",
            high_price: 1186.75,
            low_price: 1178.50,
            open_price: 1185.75,
            last_price: 1182.25,
            previous_close: 1185.75,
            timestamp: new Date().toISOString(),
          }
        ];
        break;
      default:
        return { error: "Invalid market type" };
    }
    
    // Add some small random variations to the price to simulate market movement
    return { 
      data: mockData.map(item => {
        // Add a small random variation to price (±0.5%)
        const randomFactor = 1 + (Math.random() * 0.01 - 0.005);
        const newPrice = item.price * randomFactor;
        
        // Adjust other related fields
        const priceChange = newPrice - item.price;
        const newChangePercentage = item.change_percentage + (priceChange / item.price) * 100;
        
        return {
          ...item,
          price: parseFloat(newPrice.toFixed(4)),
          change_percentage: parseFloat(newChangePercentage.toFixed(2))
        };
      }) 
    };
  } catch (error) {
    console.error("Error generating mock market data:", error);
    return { error: "Failed to generate mock market data" };
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
    
    const result = await getMockMarketData(market);
    
    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Store the mock data in the Supabase database
    const { supabaseClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = supabaseClient(supabaseUrl, supabaseKey);
    
    // Update or insert mock market data
    for (const item of result.data) {
      const { error } = await supabase
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
