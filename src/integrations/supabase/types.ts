export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      historical_market_data: {
        Row: {
          close_price: number
          high_price: number
          id: string
          low_price: number
          market_type: string
          open_price: number
          symbol: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          close_price: number
          high_price: number
          id?: string
          low_price: number
          market_type: string
          open_price: number
          symbol: string
          timestamp: string
          volume?: number | null
        }
        Update: {
          close_price?: number
          high_price?: number
          id?: string
          low_price?: number
          market_type?: string
          open_price?: number
          symbol?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change_percentage: number
          high_price: number | null
          id: string
          last_price: number | null
          last_updated: string | null
          low_price: number | null
          market_cap: string | null
          market_type: string
          name: string
          open_price: number | null
          previous_close: number | null
          price: number
          symbol: string
          timestamp: string | null
          volume: string
        }
        Insert: {
          change_percentage: number
          high_price?: number | null
          id?: string
          last_price?: number | null
          last_updated?: string | null
          low_price?: number | null
          market_cap?: string | null
          market_type: string
          name: string
          open_price?: number | null
          previous_close?: number | null
          price: number
          symbol: string
          timestamp?: string | null
          volume: string
        }
        Update: {
          change_percentage?: number
          high_price?: number | null
          id?: string
          last_price?: number | null
          last_updated?: string | null
          low_price?: number | null
          market_cap?: string | null
          market_type?: string
          name?: string
          open_price?: number | null
          previous_close?: number | null
          price?: number
          symbol?: string
          timestamp?: string | null
          volume?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          asset_name: string
          asset_symbol: string
          condition: string
          created_at: string | null
          id: string
          is_triggered: boolean | null
          market_type: string
          target_price: number
          triggered_at: string | null
          user_id: string | null
        }
        Insert: {
          asset_name: string
          asset_symbol: string
          condition: string
          created_at?: string | null
          id?: string
          is_triggered?: boolean | null
          market_type: string
          target_price: number
          triggered_at?: string | null
          user_id?: string | null
        }
        Update: {
          asset_name?: string
          asset_symbol?: string
          condition?: string
          created_at?: string | null
          id?: string
          is_triggered?: boolean | null
          market_type?: string
          target_price?: number
          triggered_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_account: {
        Row: {
          available_funds: number
          cash_balance: number
          equity: number
          id: string
          last_updated: string | null
          realized_pnl: number
          unrealized_pnl: number
          used_margin: number
        }
        Insert: {
          available_funds?: number
          cash_balance?: number
          equity?: number
          id: string
          last_updated?: string | null
          realized_pnl?: number
          unrealized_pnl?: number
          used_margin?: number
        }
        Update: {
          available_funds?: number
          cash_balance?: number
          equity?: number
          id?: string
          last_updated?: string | null
          realized_pnl?: number
          unrealized_pnl?: number
          used_margin?: number
        }
        Relationships: []
      }
      user_portfolio: {
        Row: {
          asset_name: string
          asset_symbol: string
          average_price: number
          current_price: number
          id: string
          last_updated: string | null
          market_type: string
          pnl: number
          pnl_percentage: number
          total_value: number
          units: number
          user_id: string | null
        }
        Insert: {
          asset_name: string
          asset_symbol: string
          average_price: number
          current_price: number
          id?: string
          last_updated?: string | null
          market_type: string
          pnl: number
          pnl_percentage: number
          total_value: number
          units: number
          user_id?: string | null
        }
        Update: {
          asset_name?: string
          asset_symbol?: string
          average_price?: number
          current_price?: number
          id?: string
          last_updated?: string | null
          market_type?: string
          pnl?: number
          pnl_percentage?: number
          total_value?: number
          units?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_trades: {
        Row: {
          asset_name: string
          asset_symbol: string
          closed_at: string | null
          created_at: string | null
          executed_at: string | null
          expiration_date: string | null
          id: string
          market_type: string
          order_type: string
          pnl: number | null
          price_per_unit: number
          status: string
          stop_loss: number | null
          take_profit: number | null
          total_amount: number
          trade_type: string
          units: number
          user_id: string | null
        }
        Insert: {
          asset_name: string
          asset_symbol: string
          closed_at?: string | null
          created_at?: string | null
          executed_at?: string | null
          expiration_date?: string | null
          id?: string
          market_type: string
          order_type: string
          pnl?: number | null
          price_per_unit: number
          status: string
          stop_loss?: number | null
          take_profit?: number | null
          total_amount: number
          trade_type: string
          units: number
          user_id?: string | null
        }
        Update: {
          asset_name?: string
          asset_symbol?: string
          closed_at?: string | null
          created_at?: string | null
          executed_at?: string | null
          expiration_date?: string | null
          id?: string
          market_type?: string
          order_type?: string
          pnl?: number | null
          price_per_unit?: number
          status?: string
          stop_loss?: number | null
          take_profit?: number | null
          total_amount?: number
          trade_type?: string
          units?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_watchlist: {
        Row: {
          added_at: string | null
          asset_name: string
          asset_symbol: string
          id: string
          market_type: string
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          asset_name: string
          asset_symbol: string
          id?: string
          market_type: string
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          asset_name?: string
          asset_symbol?: string
          id?: string
          market_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
