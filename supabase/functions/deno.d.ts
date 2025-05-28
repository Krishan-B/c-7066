// Type declarations for Deno-specific modules and globals
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export interface SupabaseClient {
    from: (table: string) => {
      select: (query?: string) => {
        eq: (column: string, value: string | number) => {
          single: () => Promise<{ data: Record<string, unknown>; error: Record<string, unknown> | null }>;
          maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: Record<string, unknown> | null }>;
        };
        in: (column: string, values: (string | number)[]) => Promise<{ data: Record<string, unknown>[]; error: Record<string, unknown> | null }>;
        order: (column: string, options?: { ascending: boolean }) => {
          limit: (count: number) => Promise<{ data: Record<string, unknown>[]; error: Record<string, unknown> | null }>;
        };
      };
      upsert: (data: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ data: Record<string, unknown>; error: Record<string, unknown> | null }>;
      insert: (data: Record<string, unknown> | Record<string, unknown>[], options?: Record<string, unknown>) => Promise<{ data: Record<string, unknown>; error: Record<string, unknown> | null }>;
      update: (data: Record<string, unknown>) => {
        eq: (column: string, value: string | number) => Promise<{ data: Record<string, unknown>; error: Record<string, unknown> | null }>;
      };
      delete: () => {
        eq: (column: string, value: string | number) => Promise<{ data: Record<string, unknown>; error: Record<string, unknown> | null }>;
      };
    };
    auth: {
      getUser: (token?: string) => Promise<{ data: { user: Record<string, unknown> }; error: Record<string, unknown> | null }>;
    };
    storage: {
      from: (bucket: string) => {
        upload: (path: string, data: File | Blob | ArrayBuffer | ArrayBufferView, options?: Record<string, unknown>) => Promise<{ data: Record<string, unknown>; error: Record<string, unknown> | null }>;
        download: (path: string) => Promise<{ data: Blob; error: Record<string, unknown> | null }>;
      };
    };
  }
  
  export function createClient(url: string, key: string): SupabaseClient;
}

// Declare Deno namespace/global
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  export const env: Env;
}
