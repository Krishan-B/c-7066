
/// <reference types="vite/client" />

// Define the interface for Finnhub API key from environment variables
interface ImportMetaEnv {
  readonly VITE_FINNHUB_API_KEY?: string;
  readonly VITE_POLYGON_API_KEY?: string;
  readonly VITE_ALPHA_VANTAGE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
