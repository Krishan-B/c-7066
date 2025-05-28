/**
 * Type definitions for Supabase client
 * This file provides a common type for the Supabase client throughout the application
 */

// Record-based type for Supabase client to avoid using 'any'
export interface SupabaseClientType {
  auth: {
    getUser: (token?: string) => Promise<{
      data: {
        user: unknown;
      };
      error: unknown;
    }>;
    signOut: (options?: { scope?: string }) => Promise<{
      error: unknown;
    }>;
  };
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string | number) => {
        single: () => Promise<{
          data: Record<string, unknown>;
          error: unknown;
        }>;
      };
      filter: (column: string, operator: string, value: unknown) => {
        order: (column: string, options?: { ascending?: boolean }) => {
          limit: (limit: number) => Promise<{
            data: Array<Record<string, unknown>>;
            error: unknown;
          }>;
        };
      };
    };
    update: (data: Record<string, unknown>) => {
      eq: (column: string, value: string | number) => Promise<{
        data: Record<string, unknown>;
        error: unknown;
      }>;
    };
    insert: (data: Record<string, unknown>) => Promise<{
      data: Record<string, unknown>;
      error: unknown;
    }>;
  };
  channel: (name: string) => {
    on: (
      event: string,
      filter: Record<string, unknown>,
      callback: (payload: Record<string, unknown>) => void
    ) => {
      subscribe: (callback?: (status: string) => void) => unknown;
    };
  };
  functions: {
    invoke: (
      name: string,
      options?: { body?: Record<string, unknown> }
    ) => Promise<{
      data: unknown;
      error: unknown;
    }>;
  };
  removeChannel: (channel: unknown) => void;
}