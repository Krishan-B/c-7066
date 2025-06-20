import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

import {
  checkRateLimit,
  createErrorResponse,
  createSuccessResponse,
  extractUserFromRequest,
  handleCORS,
  marketDataSchemas,
  validateInput,
} from '../_shared/security.ts';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Rate limiting - Allow 60 requests per minute per IP
    const clientIP =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = checkRateLimit(`polygon-${clientIP}`, 60, 1);

    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429);
    }

    // Parse and validate request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate input using our security framework
    const validation = validateInput(requestData, marketDataSchemas.getMarketData);

    if (!validation.isValid) {
      return createErrorResponse('Validation failed', 400, { errors: validation.errors });
    }

    const { symbol, market } = validation.sanitizedData;

    // Get API key from environment (server-side only)
    const apiKey = Deno.env.get('POLYGON_API_KEY');
    if (!apiKey) {
      console.error('Polygon API key not configured');
      return createErrorResponse('Service temporarily unavailable', 503);
    }

    // Determine which API endpoint to call based on market type
    let endpoint = '';

    if (market === 'crypto') {
      // Format for crypto is X:BTCUSD
      const formattedSymbol = symbol.includes('X:') ? symbol : `X:${symbol}`;
      endpoint = `/v2/aggs/ticker/${formattedSymbol}/prev`;
    } else if (market === 'forex') {
      // Format for forex is C:EURUSD
      const formattedSymbol = symbol.includes('C:') ? symbol : `C:${symbol}`;
      endpoint = `/v2/aggs/ticker/${formattedSymbol}/prev`;
    } else {
      // Default to stocks
      endpoint = `/v2/aggs/ticker/${symbol}/prev`;
    }

    const url = `https://api.polygon.io${endpoint}?apiKey=${apiKey}`;

    // Log request (without exposing API key)
    console.log(
      `Fetching data from Polygon.io for symbol: ${symbol}, market: ${market || 'stocks'}`
    );

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TradePro-Platform/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Polygon API error (${response.status}): ${errorText}`);
      return createErrorResponse('External service error', 502);
    }

    const data = await response.json();

    // Validate response data structure
    if (!data || typeof data !== 'object') {
      return createErrorResponse('Invalid response from external service', 502);
    }

    return createSuccessResponse({
      symbol: symbol,
      market: market || 'stocks',
      provider: 'polygon',
      data: data,
      rateLimitRemaining: rateLimitResult.remainingRequests,
    });
  } catch (error) {
    // Enhanced error handling - don't expose internal details
    console.error('Error processing Polygon request:', error);

    if (error.name === 'AbortError') {
      return createErrorResponse('Request timeout', 408);
    }

    return createErrorResponse('Internal server error', 500);
  }
});
