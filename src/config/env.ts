import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),

  // Market Data
  MARKET_DATA_API_KEY: z.string().min(1),
  MARKET_DATA_BASE_URL: z.string().url(),

  // Trade Settings
  MAX_SLIPPAGE_PERCENT: z.coerce.number().min(0).max(100).default(0.5),
  MAX_DAILY_LOSS_PERCENT: z.coerce.number().min(0).max(100).default(2),
  DEFAULT_LEVERAGE: z.coerce.number().min(1).default(1),

  // Risk Management
  MAX_POSITION_SIZE_PERCENT: z.coerce.number().min(0).max(100).default(5),
  MIN_MARGIN_REQUIREMENT: z.coerce.number().min(0).default(100)
});

// Parse and validate environment variables
export const env = envSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  MARKET_DATA_API_KEY: process.env.MARKET_DATA_API_KEY,
  MARKET_DATA_BASE_URL: process.env.MARKET_DATA_BASE_URL,
  MAX_SLIPPAGE_PERCENT: process.env.MAX_SLIPPAGE_PERCENT,
  MAX_DAILY_LOSS_PERCENT: process.env.MAX_DAILY_LOSS_PERCENT,
  DEFAULT_LEVERAGE: process.env.DEFAULT_LEVERAGE,
  MAX_POSITION_SIZE_PERCENT: process.env.MAX_POSITION_SIZE_PERCENT,
  MIN_MARGIN_REQUIREMENT: process.env.MIN_MARGIN_REQUIREMENT
});

// Export typed environment configuration
export type Env = z.infer<typeof envSchema>;