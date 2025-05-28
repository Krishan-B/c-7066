// Import only the type from createClient to avoid Deno errors
// @ts-expect-error: Deno-specific module import
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define common types for the execute-trade function
export interface TradeRequest {
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

export interface TradeResult {
  success: boolean;
  tradeId?: string;
  message: string;
}

export interface UserAccount {
  id: string;
  cash_balance: number;
  equity: number;
  used_margin: number;
  available_funds: number;
  realized_pnl?: number;
  unrealized_pnl?: number;
  last_updated?: string;
}

export interface Portfolio {
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

// Define a type for the Supabase client to avoid using any
export type SupabaseClientType = SupabaseClient;

// For Typescript only - not used in runtime
export interface SupabaseClient {
  auth: {
    getUser: (token?: string) => Promise<{
      data: { user: unknown };
      error: unknown;
    }>;
  };
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string | number) => {
        single: () => Promise<{
          data: unknown;
          error: unknown;
        }>;
      };
    };
    update: (data: Record<string, unknown>) => {
      eq: (column: string, value: string | number) => Promise<{
        data: unknown;
        error: unknown;
      }>;
    };
    insert: (data: Record<string, unknown>) => Promise<{
      data: unknown;
      error: unknown;
    }>;
  };
}
