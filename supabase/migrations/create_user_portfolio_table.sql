
-- Create table for user portfolio
CREATE TABLE IF NOT EXISTS public.user_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  asset_symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  market_type TEXT NOT NULL,
  units DECIMAL(18, 8) NOT NULL,
  average_price DECIMAL(18, 8) NOT NULL,
  current_price DECIMAL(18, 8) NOT NULL,
  total_value DECIMAL(18, 8) NOT NULL,
  pnl DECIMAL(18, 8) NOT NULL DEFAULT 0,
  pnl_percentage DECIMAL(18, 8) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, asset_symbol)
);

-- Add RLS policies to secure user portfolio data
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;

-- Users can only view their own portfolio
CREATE POLICY user_portfolio_select ON public.user_portfolio
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert portfolio records (handled by edge function)
CREATE POLICY user_portfolio_insert ON public.user_portfolio
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only service role can update portfolio records (handled by edge function)
CREATE POLICY user_portfolio_update ON public.user_portfolio
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_portfolio_user_id ON public.user_portfolio(user_id);
