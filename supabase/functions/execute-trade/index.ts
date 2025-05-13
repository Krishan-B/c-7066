
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define types
interface TradeRequest {
  assetSymbol: string;
  assetName: string;
  marketType: string;
  units: number;
  pricePerUnit: number;
  tradeType: 'buy' | 'sell';
  orderType: 'market' | 'entry';
  stopLoss?: number | null;
  takeProfit?: number | null;
  expirationDate?: string | null;
}

interface TradeResult {
  success: boolean;
  tradeId?: string;
  message: string;
}

interface UserAccount {
  id: string;
  cash_balance: number;
  equity: number;
  used_margin: number;
  available_funds: number;
  realized_pnl?: number;
  unrealized_pnl?: number;
  last_updated?: string;
}

interface Portfolio {
  id?: string;
  user_id?: string;
  asset_symbol: string;
  asset_name: string;
  market_type: string;
  units: number;
  average_price: number;
  current_price: number;
  total_value: number;
  pnl: number;
  pnl_percentage: number;
  last_updated?: string;
}

// Define leverage map
const LEVERAGE_MAP: Record<string, number> = {
  'Stocks': 20,
  'Indices': 50,
  'Commodities': 50,
  'Forex': 100,
  'Crypto': 50
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Calculate margin required for a position
 */
function calculateMarginRequired(marketType: string, totalAmount: number): number {
  const leverage = LEVERAGE_MAP[marketType] || 1;
  return totalAmount / leverage;
}

/**
 * Validate the trade request parameters
 */
function validateTradeRequest(request: TradeRequest): boolean {
  return !!(
    request.assetSymbol &&
    request.assetName &&
    request.marketType &&
    request.units > 0 &&
    request.pricePerUnit > 0 &&
    ['buy', 'sell'].includes(request.tradeType) &&
    ['market', 'entry'].includes(request.orderType)
  );
}

/**
 * Get Supabase client
 */
function getSupabaseClient() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Get user from auth token
 */
async function getUserFromToken(supabase: any, authHeader: string | null): Promise<{ user: any; error: any }> {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1]);
  
  if (error || !user) {
    return { user: null, error: 'Invalid token or user not found' };
  }
  
  return { user, error: null };
}

/**
 * Get user account data
 */
async function getUserAccount(supabase: any, userId: string): Promise<{ account: UserAccount | null; error: any }> {
  const { data: accountData, error: accountError } = await supabase
    .from('user_account')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (accountError) {
    return { account: null, error: `Failed to get account data: ${accountError.message}` };
  }
  
  return { account: accountData, error: null };
}

/**
 * Execute a market order
 */
async function executeMarketOrder(supabase: any, userId: string, params: TradeRequest): Promise<TradeResult> {
  try {
    // Calculate total amount
    const totalAmount = params.units * params.pricePerUnit;
    
    // Calculate required margin
    const marginRequired = calculateMarginRequired(params.marketType, totalAmount);
    
    // Get user's account
    const { account, error: accountError } = await getUserAccount(supabase, userId);
    
    if (accountError) {
      throw new Error(accountError);
    }
    
    // Check if user has enough funds
    if (account!.available_funds < marginRequired) {
      return {
        success: false,
        message: `Insufficient funds. Required: ${marginRequired.toFixed(2)}, Available: ${account!.available_funds.toFixed(2)}`
      };
    }
    
    // Create the trade record
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .insert({
        user_id: userId,
        asset_symbol: params.assetSymbol,
        asset_name: params.assetName,
        market_type: params.marketType,
        units: params.units,
        price_per_unit: params.pricePerUnit,
        total_amount: totalAmount,
        trade_type: params.tradeType,
        order_type: params.orderType,
        status: 'open',
        stop_loss: params.stopLoss || null,
        take_profit: params.takeProfit || null,
        executed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to create trade: ${tradeError.message}`);
    }
    
    // Update user account metrics
    const { error: updateError } = await supabase
      .from('user_account')
      .update({
        used_margin: account!.used_margin + marginRequired,
        available_funds: account!.available_funds - marginRequired,
        last_updated: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      throw new Error(`Failed to update account: ${updateError.message}`);
    }
    
    // Update or create portfolio entry
    await updatePortfolio(supabase, userId, params);
    
    return {
      success: true,
      tradeId: tradeData.id,
      message: 'Trade executed successfully'
    };
  } catch (error) {
    console.error('Error processing market order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Execute an entry order (pending)
 */
async function executeEntryOrder(supabase: any, userId: string, params: TradeRequest): Promise<TradeResult> {
  try {
    // For entry orders, we validate but don't check funds until execution
    const totalAmount = params.units * params.pricePerUnit;
    
    // Create the trade record as a pending order
    const { data: tradeData, error: tradeError } = await supabase
      .from('user_trades')
      .insert({
        user_id: userId,
        asset_symbol: params.assetSymbol,
        asset_name: params.assetName,
        market_type: params.marketType,
        units: params.units,
        price_per_unit: params.pricePerUnit,
        total_amount: totalAmount,
        trade_type: params.tradeType,
        order_type: 'entry',
        status: 'pending',
        stop_loss: params.stopLoss || null,
        take_profit: params.takeProfit || null,
        expiration_date: params.expirationDate || null
      })
      .select()
      .single();
    
    if (tradeError) {
      throw new Error(`Failed to create entry order: ${tradeError.message}`);
    }
    
    return {
      success: true,
      tradeId: tradeData.id,
      message: 'Entry order placed successfully'
    };
  } catch (error) {
    console.error('Error placing entry order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update portfolio with new trade position
 */
async function updatePortfolio(supabase: any, userId: string, params: TradeRequest): Promise<void> {
  try {
    // Check if we already have this asset in the portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_symbol', params.assetSymbol)
      .maybeSingle();
    
    if (portfolioError && portfolioError.code !== 'PGRST116') {
      throw portfolioError;
    }
    
    if (!portfolioData) {
      // Create new portfolio entry
      await supabase
        .from('user_portfolio')
        .insert({
          user_id: userId,
          asset_symbol: params.assetSymbol,
          asset_name: params.assetName,
          market_type: params.marketType,
          units: params.units,
          average_price: params.pricePerUnit,
          current_price: params.pricePerUnit,
          total_value: params.units * params.pricePerUnit,
          pnl: 0,
          pnl_percentage: 0,
        });
    } else {
      // Update existing portfolio entry
      const totalUnits = portfolioData.units + params.units;
      const totalCost = (portfolioData.average_price * portfolioData.units) + 
                      (params.pricePerUnit * params.units);
      const newAvgPrice = totalCost / totalUnits;
      
      await supabase
        .from('user_portfolio')
        .update({
          units: totalUnits,
          average_price: newAvgPrice,
          current_price: params.pricePerUnit,
          total_value: totalUnits * params.pricePerUnit,
          last_updated: new Date().toISOString()
        })
        .eq('id', portfolioData.id);
    }
  } catch (error) {
    console.error('Error updating portfolio:', error);
    // We don't want to fail the whole operation if portfolio update fails
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    const { user, error: userError } = await getUserFromToken(supabase, authHeader);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: userError || 'User authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const tradeRequest: TradeRequest = await req.json();
    
    // Validate request
    if (!validateTradeRequest(tradeRequest)) {
      return new Response(
        JSON.stringify({ error: 'Invalid trade parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process based on order type
    let result: TradeResult;
    
    if (tradeRequest.orderType === 'market') {
      result = await executeMarketOrder(supabase, user.id, tradeRequest);
    } else {
      result = await executeEntryOrder(supabase, user.id, tradeRequest);
    }

    return new Response(
      JSON.stringify(result),
      { status: result.success ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing trade:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
