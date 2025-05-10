
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate mock news data based on market type and trending symbols
const generateMarketNews = (marketType = null) => {
  const allNews = [
    // Crypto news
    {
      id: "crypto-1",
      title: "Bitcoin Surges Past $70,000 for the First Time",
      summary: "The leading cryptocurrency reaches new all-time high amid institutional adoption.",
      source: "CryptoNewsWire",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Bitcoin+News",
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      market_type: "Crypto",
      related_symbols: ["BTCUSD", "ETHUSD"],
      sentiment: "positive"
    },
    {
      id: "crypto-2",
      title: "Ethereum Completes Major Network Upgrade",
      summary: "The upgrade aims to reduce gas fees and improve transaction throughput.",
      source: "BlockchainToday",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Ethereum+News",
      published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      market_type: "Crypto",
      related_symbols: ["ETHUSD"],
      sentiment: "positive"
    },
    {
      id: "crypto-3",
      title: "Solana Facing Network Congestion Issues",
      summary: "Users report transaction delays as network usage spikes to record levels.",
      source: "CoinDesk",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Solana+News",
      published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      market_type: "Crypto",
      related_symbols: ["SOLUSD"],
      sentiment: "negative"
    },

    // Stock news
    {
      id: "stock-1",
      title: "Apple Announces New Product Line at Annual Event",
      summary: "The tech giant unveiled new devices expected to boost holiday sales.",
      source: "MarketWatch",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Apple+News",
      published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      market_type: "Stock",
      related_symbols: ["AAPL"],
      sentiment: "positive"
    },
    {
      id: "stock-2",
      title: "Tesla Beats Quarterly Earnings Expectations",
      summary: "Electric vehicle maker reports strong growth in deliveries and revenue.",
      source: "Bloomberg",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Tesla+News",
      published_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      market_type: "Stock",
      related_symbols: ["TSLA"],
      sentiment: "positive"
    },
    {
      id: "stock-3",
      title: "Meta Platforms Faces New Regulatory Challenges",
      summary: "Social media giant under scrutiny from European regulators over data practices.",
      source: "Reuters",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Meta+News",
      published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      market_type: "Stock",
      related_symbols: ["META"],
      sentiment: "negative"
    },

    // Index news
    {
      id: "index-1",
      title: "S&P 500 Hits Record High as Inflation Fears Ease",
      summary: "The benchmark index climbed on positive economic data and Fed comments.",
      source: "Financial Times",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=S%26P+News",
      published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      market_type: "Index",
      related_symbols: ["US500"],
      sentiment: "positive"
    },
    {
      id: "index-2",
      title: "Nasdaq Drops on Tech Sector Profit-Taking",
      summary: "Investors lock in gains after extended rally in technology stocks.",
      source: "CNBC",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Nasdaq+News",
      published_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      market_type: "Index",
      related_symbols: ["US100"],
      sentiment: "negative"
    },

    // Forex news
    {
      id: "forex-1",
      title: "Dollar Strengthens Against Major Currencies",
      summary: "USD gains ground following hawkish Federal Reserve statements.",
      source: "ForexLive",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Forex+News",
      published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      market_type: "Forex",
      related_symbols: ["EURUSD", "GBPUSD"],
      sentiment: "mixed"
    },
    {
      id: "forex-2",
      title: "Japanese Yen Slides to Multi-Year Low",
      summary: "Currency weakens as Bank of Japan maintains ultra-loose monetary policy.",
      source: "Reuters",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Yen+News",
      published_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      market_type: "Forex",
      related_symbols: ["USDJPY"],
      sentiment: "negative"
    },

    // Commodity news
    {
      id: "commodity-1",
      title: "Gold Prices Surge Amid Geopolitical Tensions",
      summary: "Safe-haven demand drives precious metal higher as conflicts escalate.",
      source: "Commodities Corner",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Gold+News",
      published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      market_type: "Commodity",
      related_symbols: ["XAUUSD"],
      sentiment: "positive"
    },
    {
      id: "commodity-2",
      title: "Oil Drops on Higher-Than-Expected Inventory Build",
      summary: "Crude prices fall after weekly report shows unexpected supply increase.",
      source: "OilPrice",
      url: "#",
      image_url: "https://via.placeholder.com/300x200?text=Oil+News",
      published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      market_type: "Commodity",
      related_symbols: ["USOIL", "UKOIL"],
      sentiment: "negative"
    }
  ];

  // If market type is specified, filter news for that market type
  return marketType ? allNews.filter(news => news.market_type === marketType) : allNews;
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the market type from the request, if any
    const { market_type } = await req.json().catch(() => ({}));
    
    // Generate market news
    const news = generateMarketNews(market_type);
    
    // Return the news data
    return new Response(JSON.stringify({ success: true, data: news }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching market news:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
