// Global type declarations for Deno and external modules used in Supabase Edge Functions

// Declare modules for ESM imports
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  // Define common types used in Supabase responses
  type PostgrestError = {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  
  type PostgrestSingleResponse<T> = {
    data: T;
    error: PostgrestError | null;
    count: number | null;
    status: number;
    statusText: string;
  };
  
  type PostgrestMaybeSingleResponse<T> = {
    data: T | null;
    error: PostgrestError | null;
    count: number | null;
    status: number;
    statusText: string;
  };
  
  type PostgrestResponse<T> = {
    data: T[];
    error: PostgrestError | null;
    count: number | null;
    status: number;
    statusText: string;
  };
  
  // Define SupabaseClient interface for TypeScript
  export interface SupabaseClient {
    from: <T extends Record<string, unknown> = Record<string, unknown>>(table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: string | number | boolean) => {
          single: () => Promise<PostgrestSingleResponse<T>>;
          maybeSingle: () => Promise<PostgrestMaybeSingleResponse<T>>;
          order: (column: string, options?: { ascending?: boolean }) => PostgrestResponse<T>;
        };
        in: (column: string, values: (string | number | boolean)[]) => Promise<PostgrestResponse<T>>;
        order: (column: string, options?: { ascending?: boolean }) => {
          limit: (count: number) => Promise<PostgrestResponse<T>>;
        };
        limit: (count: number) => Promise<PostgrestResponse<T>>;
      };
      upsert: (data: Partial<T>, options?: { onConflict?: string }) => Promise<PostgrestSingleResponse<T>>;
      insert: <U extends Partial<T>>(data: U | U[], options?: Record<string, unknown>) => Promise<PostgrestResponse<T>>;
      update: (data: Partial<T>) => {
        eq: (column: string, value: string | number | boolean) => Promise<PostgrestSingleResponse<T>>;
      };
      delete: () => {
        eq: (column: string, value: string | number | boolean) => Promise<PostgrestSingleResponse<T>>;
      };
    };
    auth: {
      getUser: (token?: string) => Promise<{ data: { user: Record<string, unknown> }; error: PostgrestError | null }>;
    };
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string, 
          data: File | Blob | ArrayBuffer | ArrayBufferView, 
          options?: Record<string, unknown>
        ) => Promise<{ data: Record<string, unknown>; error: PostgrestError | null }>;
        download: (path: string) => Promise<{ data: Blob; error: PostgrestError | null }>;
      };
    };
  }
  
  export function createClient(url: string, key: string): SupabaseClient;
}

// Declare Deno namespace
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  const env: Env;
  
  function exit(code?: number): never;
  
  interface FetchOptions {
    method?: string;
    headers?: Record<string, string> | Headers;
    body?: string | Blob | BufferSource | FormData | ReadableStream<Uint8Array> | URLSearchParams;
  }

  function fetch(input: string | URL | Request, init?: FetchOptions): Promise<Response>;
}
