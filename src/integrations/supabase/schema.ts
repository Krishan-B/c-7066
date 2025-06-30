import { Json } from "./types";

// User Profile
export interface DBProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  experience_level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  preferences?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  kyc_status?: "PENDING" | "APPROVED" | "REJECTED";
  country?: string;
  phone_number?: string;
}

// User Account
export interface DBAccount {
  id: string;
  user_id: string;
  account_type: "DEMO" | "COMPETITION";
  balance: number;
  equity?: number;
  margin_used?: number;
  created_at?: string;
  reset_count?: number;
  is_active?: boolean;
  is_verified?: boolean;
}

// KYC Document
export interface DBKYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  category: string;
  file_url: string;
  file_name?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comments?: string;
  uploaded_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

// Asset
export interface DBAsset {
  id: string;
  symbol: string;
  name: string;
  asset_class: "FOREX" | "STOCKS" | "INDICES" | "COMMODITIES" | "CRYPTO";
  base_currency?: string;
  quote_currency?: string;
  is_active?: boolean;
  leverage_max?: number;
  spread_base?: number;
  contract_size?: number;
}

// Order
export interface DBOrder {
  id: string;
  account_id: string;
  asset_id: string;
  order_type: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
  side: "BUY" | "SELL";
  quantity: number;
  price?: number;
  stop_price?: number;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED";
  filled_quantity?: number;
  avg_fill_price?: number;
  created_at?: string;
  filled_at?: string;
  expires_at?: string;
}

// Position
export interface DBPosition {
  id: string;
  account_id: string;
  asset_id: string;
  side: "LONG" | "SHORT";
  quantity: number;
  entry_price: number;
  current_price?: number;
  leverage?: number;
  margin_required?: number;
  unrealized_pnl?: number;
  rollover_charges?: number;
  take_profit?: number;
  stop_loss?: number;
  opened_at?: string;
  updated_at?: string;
}

// Extend the Database type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DBProfile;
        Insert: Partial<DBProfile>;
        Update: Partial<DBProfile>;
      };
      accounts: {
        Row: DBAccount;
        Insert: Partial<DBAccount>;
        Update: Partial<DBAccount>;
      };
      kyc_documents: {
        Row: DBKYCDocument;
        Insert: Partial<DBKYCDocument>;
        Update: Partial<DBKYCDocument>;
      };
      assets: {
        Row: DBAsset;
        Insert: Partial<DBAsset>;
        Update: Partial<DBAsset>;
      };
      orders: {
        Row: DBOrder;
        Insert: Partial<DBOrder>;
        Update: Partial<DBOrder>;
      };
      positions: {
        Row: DBPosition;
        Insert: Partial<DBPosition>;
        Update: Partial<DBPosition>;
      };
    };
  };
}
