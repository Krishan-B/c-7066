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
      account_metrics: {
        Row: {
          available_funds: number
          balance: number
          bonus: number
          equity: number
          id: string
          last_updated: string
          margin_level: number
          open_positions_count: number
          pending_orders_count: number
          realized_pnl: number
          total_exposure: number
          unrealized_pnl: number
          used_margin: number
          user_id: string
        }
        Insert: {
          available_funds?: number
          balance?: number
          bonus?: number
          equity?: number
          id?: string
          last_updated?: string
          margin_level?: number
          open_positions_count?: number
          pending_orders_count?: number
          realized_pnl?: number
          total_exposure?: number
          unrealized_pnl?: number
          used_margin?: number
          user_id: string
        }
        Update: {
          available_funds?: number
          balance?: number
          bonus?: number
          equity?: number
          id?: string
          last_updated?: string
          margin_level?: number
          open_positions_count?: number
          pending_orders_count?: number
          realized_pnl?: number
          total_exposure?: number
          unrealized_pnl?: number
          used_margin?: number
          user_id?: string
        }
        Relationships: []
      }
      asset_leverage_config: {
        Row: {
          asset_class: string
          created_at: string
          id: string
          maintenance_margin: number
          margin_call_level: number
          max_leverage: number
          min_margin_requirement: number
          symbol: string | null
          updated_at: string
        }
        Insert: {
          asset_class: string
          created_at?: string
          id?: string
          maintenance_margin: number
          margin_call_level?: number
          max_leverage: number
          min_margin_requirement: number
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          asset_class?: string
          created_at?: string
          id?: string
          maintenance_margin?: number
          margin_call_level?: number
          max_leverage?: number
          min_margin_requirement?: number
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
      kyc_documents: {
        Row: {
          category: string
          comments: string | null
          created_at: string | null
          document_type: string
          file_name: string | null
          file_url: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          comments?: string | null
          created_at?: string | null
          document_type: string
          file_name?: string | null
          file_url: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          comments?: string | null
          created_at?: string | null
          document_type?: string
          file_name?: string | null
          file_url?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      margin_calculations: {
        Row: {
          calculated_at: string
          free_margin: number
          id: string
          initial_margin: number
          leverage_used: number
          maintenance_margin: number
          margin_level: number
          position_id: string | null
          used_margin: number
          user_id: string
        }
        Insert: {
          calculated_at?: string
          free_margin: number
          id?: string
          initial_margin: number
          leverage_used: number
          maintenance_margin: number
          margin_level: number
          position_id?: string | null
          used_margin: number
          user_id: string
        }
        Update: {
          calculated_at?: string
          free_margin?: number
          id?: string
          initial_margin?: number
          leverage_used?: number
          maintenance_margin?: number
          margin_level?: number
          position_id?: string | null
          used_margin?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "margin_calculations_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
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
      order_history: {
        Row: {
          action: string
          details: Json | null
          id: string
          order_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          order_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          order_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          asset_class: string
          cancelled_at: string | null
          created_at: string
          direction: string
          executed_at: string | null
          execution_price: number | null
          expiration_date: string | null
          id: string
          margin_required: number
          order_type: string
          position_value: number
          rejected_reason: string | null
          requested_price: number
          status: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          units: number
          user_id: string
        }
        Insert: {
          asset_class: string
          cancelled_at?: string | null
          created_at?: string
          direction: string
          executed_at?: string | null
          execution_price?: number | null
          expiration_date?: string | null
          id?: string
          margin_required: number
          order_type: string
          position_value: number
          rejected_reason?: string | null
          requested_price: number
          status?: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          units: number
          user_id: string
        }
        Update: {
          asset_class?: string
          cancelled_at?: string | null
          created_at?: string
          direction?: string
          executed_at?: string | null
          execution_price?: number | null
          expiration_date?: string | null
          id?: string
          margin_required?: number
          order_type?: string
          position_value?: number
          rejected_reason?: string | null
          requested_price?: number
          status?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          units?: number
          user_id?: string
        }
        Relationships: []
      }
      position_history: {
        Row: {
          action: string
          id: string
          margin_impact: number | null
          notes: string | null
          pnl: number | null
          position_id: string
          price: number
          timestamp: string
          units: number | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          margin_impact?: number | null
          notes?: string | null
          pnl?: number | null
          position_id: string
          price: number
          timestamp?: string
          units?: number | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          margin_impact?: number | null
          notes?: string | null
          pnl?: number | null
          position_id?: string
          price?: number
          timestamp?: string
          units?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_history_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      position_updates: {
        Row: {
          created_at: string
          id: string
          market_session: string | null
          pnl_change: number
          position_id: string | null
          price_update: number
          timestamp: string
          unrealized_pnl: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_session?: string | null
          pnl_change: number
          position_id?: string | null
          price_update: number
          timestamp?: string
          unrealized_pnl: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          market_session?: string | null
          pnl_change?: number
          position_id?: string | null
          price_update?: number
          timestamp?: string
          unrealized_pnl?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_updates_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          asset_class: string
          close_price: number | null
          closed_at: string | null
          current_price: number
          daily_pnl: number | null
          direction: string
          entry_price: number
          id: string
          initial_margin: number | null
          last_updated: string
          leverage_ratio: number | null
          maintenance_margin: number | null
          margin_level: number | null
          margin_used: number
          opened_at: string
          order_id: string | null
          pip_difference: number | null
          pip_value: number | null
          position_value: number
          realized_pnl: number | null
          session_pnl: number | null
          status: string
          stop_loss: number | null
          swap_charges: number | null
          symbol: string
          take_profit: number | null
          total_fees: number | null
          units: number
          unrealized_pnl: number | null
          user_id: string
        }
        Insert: {
          asset_class: string
          close_price?: number | null
          closed_at?: string | null
          current_price: number
          daily_pnl?: number | null
          direction: string
          entry_price: number
          id?: string
          initial_margin?: number | null
          last_updated?: string
          leverage_ratio?: number | null
          maintenance_margin?: number | null
          margin_level?: number | null
          margin_used: number
          opened_at?: string
          order_id?: string | null
          pip_difference?: number | null
          pip_value?: number | null
          position_value: number
          realized_pnl?: number | null
          session_pnl?: number | null
          status?: string
          stop_loss?: number | null
          swap_charges?: number | null
          symbol: string
          take_profit?: number | null
          total_fees?: number | null
          units: number
          unrealized_pnl?: number | null
          user_id: string
        }
        Update: {
          asset_class?: string
          close_price?: number | null
          closed_at?: string | null
          current_price?: number
          daily_pnl?: number | null
          direction?: string
          entry_price?: number
          id?: string
          initial_margin?: number | null
          last_updated?: string
          leverage_ratio?: number | null
          maintenance_margin?: number | null
          margin_level?: number | null
          margin_used?: number
          opened_at?: string
          order_id?: string | null
          pip_difference?: number | null
          pip_value?: number | null
          position_value?: number
          realized_pnl?: number | null
          session_pnl?: number | null
          status?: string
          stop_loss?: number | null
          swap_charges?: number | null
          symbol?: string
          take_profit?: number | null
          total_fees?: number | null
          units?: number
          unrealized_pnl?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      risk_metrics: {
        Row: {
          available_margin: number | null
          correlation_risk: number | null
          diversification_score: number | null
          id: string
          last_calculated: string
          margin_level: number | null
          max_position_size: number | null
          portfolio_var: number | null
          risk_score: number | null
          total_exposure: number | null
          used_margin: number | null
          user_id: string
        }
        Insert: {
          available_margin?: number | null
          correlation_risk?: number | null
          diversification_score?: number | null
          id?: string
          last_calculated?: string
          margin_level?: number | null
          max_position_size?: number | null
          portfolio_var?: number | null
          risk_score?: number | null
          total_exposure?: number | null
          used_margin?: number | null
          user_id: string
        }
        Update: {
          available_margin?: number | null
          correlation_risk?: number | null
          diversification_score?: number | null
          id?: string
          last_calculated?: string
          margin_level?: number | null
          max_position_size?: number | null
          portfolio_var?: number | null
          risk_score?: number | null
          total_exposure?: number | null
          used_margin?: number | null
          user_id?: string
        }
        Relationships: []
      }
      trade_analytics: {
        Row: {
          avg_loss: number | null
          avg_win: number | null
          created_at: string
          id: string
          losing_trades: number | null
          max_drawdown: number | null
          net_pnl: number | null
          period_end: string
          period_start: string
          profit_factor: number | null
          sharpe_ratio: number | null
          total_fees: number | null
          total_pnl: number | null
          total_trades: number | null
          updated_at: string
          user_id: string
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          avg_loss?: number | null
          avg_win?: number | null
          created_at?: string
          id?: string
          losing_trades?: number | null
          max_drawdown?: number | null
          net_pnl?: number | null
          period_end: string
          period_start: string
          profit_factor?: number | null
          sharpe_ratio?: number | null
          total_fees?: number | null
          total_pnl?: number | null
          total_trades?: number | null
          updated_at?: string
          user_id: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          avg_loss?: number | null
          avg_win?: number | null
          created_at?: string
          id?: string
          losing_trades?: number | null
          max_drawdown?: number | null
          net_pnl?: number | null
          period_end?: string
          period_start?: string
          profit_factor?: number | null
          sharpe_ratio?: number | null
          total_fees?: number | null
          total_pnl?: number | null
          total_trades?: number | null
          updated_at?: string
          user_id?: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: []
      }
      trading_orders: {
        Row: {
          asset_class: string
          cancelled_at: string | null
          created_at: string
          direction: string
          executed_at: string | null
          execution_price: number | null
          expiration_date: string | null
          fees: number | null
          id: string
          leverage_ratio: number
          margin_required: number
          order_type: string
          position_value: number
          rejected_reason: string | null
          requested_price: number
          slippage: number | null
          status: string
          stop_loss_price: number | null
          symbol: string
          take_profit_price: number | null
          units: number
          user_id: string
        }
        Insert: {
          asset_class: string
          cancelled_at?: string | null
          created_at?: string
          direction: string
          executed_at?: string | null
          execution_price?: number | null
          expiration_date?: string | null
          fees?: number | null
          id?: string
          leverage_ratio?: number
          margin_required: number
          order_type: string
          position_value: number
          rejected_reason?: string | null
          requested_price: number
          slippage?: number | null
          status?: string
          stop_loss_price?: number | null
          symbol: string
          take_profit_price?: number | null
          units: number
          user_id: string
        }
        Update: {
          asset_class?: string
          cancelled_at?: string | null
          created_at?: string
          direction?: string
          executed_at?: string | null
          execution_price?: number | null
          expiration_date?: string | null
          fees?: number | null
          id?: string
          leverage_ratio?: number
          margin_required?: number
          order_type?: string
          position_value?: number
          rejected_reason?: string | null
          requested_price?: number
          slippage?: number | null
          status?: string
          stop_loss_price?: number | null
          symbol?: string
          take_profit_price?: number | null
          units?: number
          user_id?: string
        }
        Relationships: []
      }
      trading_positions: {
        Row: {
          asset_class: string
          current_price: number
          daily_pnl: number | null
          direction: string
          entry_price: number
          id: string
          last_updated: string
          leverage_ratio: number
          margin_used: number
          opened_at: string
          order_id: string | null
          position_value: number
          status: string
          stop_loss_price: number | null
          symbol: string
          take_profit_price: number | null
          total_fees: number | null
          units: number
          unrealized_pnl: number | null
          user_id: string
        }
        Insert: {
          asset_class: string
          current_price: number
          daily_pnl?: number | null
          direction: string
          entry_price: number
          id?: string
          last_updated?: string
          leverage_ratio?: number
          margin_used: number
          opened_at?: string
          order_id?: string | null
          position_value: number
          status?: string
          stop_loss_price?: number | null
          symbol: string
          take_profit_price?: number | null
          total_fees?: number | null
          units: number
          unrealized_pnl?: number | null
          user_id: string
        }
        Update: {
          asset_class?: string
          current_price?: number
          daily_pnl?: number | null
          direction?: string
          entry_price?: number
          id?: string
          last_updated?: string
          leverage_ratio?: number
          margin_used?: number
          opened_at?: string
          order_id?: string | null
          position_value?: number
          status?: string
          stop_loss_price?: number | null
          symbol?: string
          take_profit_price?: number | null
          total_fees?: number | null
          units?: number
          unrealized_pnl?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_positions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "trading_orders"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_position_margin: {
        Args: {
          p_asset_class: string
          p_symbol: string
          p_position_value: number
          p_leverage?: number
        }
        Returns: {
          max_leverage: number
          initial_margin: number
          maintenance_margin: number
          margin_level: number
          leverage_used: number
        }[]
      }
      calculate_position_pnl: {
        Args: {
          p_direction: string
          p_entry_price: number
          p_current_price: number
          p_units: number
        }
        Returns: number
      }
      calculate_position_pnl_realtime: {
        Args: {
          p_direction: string
          p_entry_price: number
          p_current_price: number
          p_units: number
        }
        Returns: number
      }
      calculate_realtime_pnl: {
        Args: { p_position_id: string; p_new_price: number }
        Returns: {
          unrealized_pnl: number
          daily_pnl: number
          pip_difference: number
          pip_value: number
        }[]
      }
      execute_market_order: {
        Args: { p_order_id: string; p_execution_price: number }
        Returns: boolean
      }
      update_account_metrics: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_position_leverage: {
        Args: { p_position_id: string; p_leverage?: number }
        Returns: boolean
      }
      update_position_realtime: {
        Args: { p_position_id: string; p_new_price: number }
        Returns: boolean
      }
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
