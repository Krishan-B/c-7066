// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Hello from Functions!");

serve(async (req) => {
  const { name } = await req.json();
  const data = {
    message: `Hello ${name || "World"}!`,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
