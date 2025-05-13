
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { secretName } = await req.json();
    
    if (!secretName) {
      return new Response(
        JSON.stringify({ error: "Secret name is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if the secret exists in environment variables
    const secretValue = Deno.env.get(secretName);
    
    if (secretValue) {
      console.log(`Requested secret: ${secretName}, Found`);
      
      // Return redacted value for logging purposes
      return new Response(
        JSON.stringify({ 
          success: true,
          value: secretValue,
          // Do not include the actual secret value in the response
          message: "Secret retrieved successfully"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      console.log(`Requested secret: ${secretName}, Not Found`);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Secret not found"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
