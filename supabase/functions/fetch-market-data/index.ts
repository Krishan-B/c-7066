// supabase/functions/fetch-market-data/index.ts
// @ts-expect-error Deno remote import is not recognized by TypeScript tooling, but works in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  // Example: Return mock market data
  const data = [
    { symbol: "BTC/USDT", price: 60000.0, timestamp: new Date().toISOString() },
    { symbol: "ETH/USDT", price: 2000.0, timestamp: new Date().toISOString() },
  ];
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
