import { config } from "dotenv";
import { resolve } from "path";

// Silence all dotenv-related logs
const originalLog = console.log;
console.log = (...args) => {
  // Filter out dotenv logs but keep other console.log outputs
  if (
    typeof args[0] === "string" &&
    (args[0].includes("[dotenv@") || args[0].includes("encrypt with dotenvx"))
  ) {
    return;
  }
  originalLog(...args);
};

// Load environment variables silently
config({
  path: resolve(__dirname, "../.env"),
  override: true,
  debug: false,
});

// Set default values for required environment variables in test environment
const defaults = {
  VITE_SUPABASE_URL: "http://127.0.0.1:54321",
  VITE_SUPABASE_ANON_KEY: "dummy-anon-key",
  VITE_SUPABASE_SERVICE_ROLE_KEY: "dummy-service-key",
} as const;

// Set defaults if not already set
Object.entries(defaults).forEach(([key, value]) => {
  process.env[key] = process.env[key] || value;
});

// Validate required environment variables
const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_SERVICE_ROLE_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
