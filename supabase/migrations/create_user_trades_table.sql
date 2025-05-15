
-- Create table for user trades
CREATE TABLE IF NOT EXISTS public.user_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  asset_symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  market_type TEXT NOT NULL,
  units DECIMAL(18, 8) NOT NULL,
  price_per_unit DECIMAL(18, 8) NOT NULL,
  total_amount DECIMAL(18, 8) NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'entry')),
  status TEXT NOT NULL CHECK (status IN ('open', 'pending', 'closed', 'cancelled', 'failed')),
  stop_loss DECIMAL(18, 8),
  take_profit DECIMAL(18, 8),
  close_price DECIMAL(18, 8),
  pnl DECIMAL(18, 8),
  executed_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies to secure user trades data
ALTER TABLE public.user_trades ENABLE ROW LEVEL SECURITY;

-- Users can only view their own trades
CREATE POLICY user_trades_select ON public.user_trades
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own trades
CREATE POLICY user_trades_insert ON public.user_trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own trades
CREATE POLICY user_trades_update ON public.user_trades
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_trades_user_id ON public.user_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trades_status ON public.user_trades(status);
