export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      kyc_verifications: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'submitted' | 'verified' | 'rejected'
          level: number
          date_of_birth: string
          nationality: string
          residence_address: string
          city: string
          postal_code: string
          country: string
          occupation: string
          employer: string
          annual_income: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          level?: number
          date_of_birth: string
          nationality: string
          residence_address: string
          city: string
          postal_code: string
          country: string
          occupation: string
          employer: string
          annual_income: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          level?: number
          date_of_birth?: string
          nationality?: string
          residence_address?: string
          city?: string
          postal_code?: string
          country?: string
          occupation?: string
          employer?: string
          annual_income?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      kyc_documents: {
        Row: {
          id: string
          verification_id: string
          type: 'passport' | 'national_id' | 'drivers_license'
          status: 'pending' | 'submitted' | 'verified' | 'rejected'
          document_url: string
          verification_notes?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          verification_id: string
          type: 'passport' | 'national_id' | 'drivers_license'
          status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          document_url: string
          verification_notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          verification_id?: string
          type?: 'passport' | 'national_id' | 'drivers_license'
          status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          document_url?: string
          verification_notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kyc_documents_verification_id_fkey'
            columns: ['verification_id']
            referencedRelation: 'kyc_verifications'
            referencedColumns: ['id']
          }
        ]

      }
      market_data: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      price_alerts: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      profiles: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      user_account: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      user_portfolio: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      user_trades: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      user_watchlist: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}