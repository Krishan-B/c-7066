// Type declarations for Deno APIs in the context of Supabase Edge Functions
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  // Add any other Deno APIs that might be used in edge functions
  const env: Env;
  
  // Add other Deno namespace members as needed
  function exit(code?: number): never;
  
  interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Blob | BufferSource | FormData | ReadableStream | URLSearchParams;
  }

  function fetch(input: string | URL | Request, init?: FetchOptions): Promise<Response>;
}
