import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import {
  checkRateLimit,
  createErrorResponse,
  createSuccessResponse,
  handleCORS,
  marketDataSchemas,
  validateInput,
} from '../_shared/security.ts';
import {
  fetchAlphaVantageForexData,
  fetchCoinGeckoData,
  fetchYahooFinanceData,
  updateDatabaseWithMarketData,
} from './api/data-sources.ts';
import type { Asset } from './types.ts';
import { checkCachedData } from './utils/cache-helper.ts';
import { corsHeaders } from './utils/cors.ts';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Main handler
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
    // Rate limiting - Allow 100 requests per minute per IP for market data service
    const clientIP =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = checkRateLimit(`market-data-${clientIP}`, 100, 1);

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
    const validation = validateInput(requestData, marketDataSchemas.getMultipleMarketData);

    if (!validation.isValid) {
      return createErrorResponse('Validation failed', 400, { errors: validation.errors });
    }

    const { marketType, symbols, forceRefresh } = validation.sanitizedData;
    console.log(`Fetching ${marketType} data for symbols: ${symbols}`);

    // Check if we have recent data (within last 15 minutes) unless force refresh is specified
    if (!forceRefresh) {
      const cachedData = await checkCachedData(supabase, marketType, symbols);
      if (cachedData) {
        return createSuccessResponse({
          data: cachedData,
          source: 'cache',
          rateLimitRemaining: rateLimitResult.remainingRequests,
        });
      }
    }

    // Determine which source to use based on market type
    let marketData: Asset[] = [];

    switch (marketType.toLowerCase()) {
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
        return createErrorResponse(`Unsupported market type: ${marketType}`, 400);
    }

    // Update the database with the fetched data
    await updateDatabaseWithMarketData(supabase, marketData, marketType);

    // Return the fetched market data with enhanced response
    return createSuccessResponse({
      data: marketData,
      source: 'api',
      marketType: marketType,
      count: marketData.length,
      rateLimitRemaining: rateLimitResult.remainingRequests,
    });
  } catch (error: unknown) {
    console.error('Error fetching market data:', error);

    // Enhanced error handling - don't expose internal details
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return createErrorResponse('External service unavailable', 503);
      }
      if (error.message.includes('timeout')) {
        return createErrorResponse('Request timeout', 408);
      }
    }

    return createErrorResponse('Internal server error', 500);
  }
});
