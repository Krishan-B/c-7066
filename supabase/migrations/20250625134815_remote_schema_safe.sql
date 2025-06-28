-- Safe remote schema synchronization
-- This migration ensures remote schema matches local without conflicts

-- Create tables only if they don't exist

-- Create account_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.account_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 10000.00,
    bonus NUMERIC NOT NULL DEFAULT 0.00,
    equity NUMERIC NOT NULL DEFAULT 10000.00,
    used_margin NUMERIC NOT NULL DEFAULT 0.00,
    available_funds NUMERIC NOT NULL DEFAULT 10000.00,
    unrealized_pnl NUMERIC NOT NULL DEFAULT 0.00,
    realized_pnl NUMERIC NOT NULL DEFAULT 0.00,
    total_exposure NUMERIC NOT NULL DEFAULT 0.00,
    margin_level NUMERIC NOT NULL DEFAULT 0.00,
    open_positions_count INTEGER NOT NULL DEFAULT 0,
    pending_orders_count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'account_metrics_user_id_fkey' 
        AND table_name = 'account_metrics'
    ) THEN
        ALTER TABLE account_metrics ADD CONSTRAINT account_metrics_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create positions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    size NUMERIC NOT NULL,
    entry_price NUMERIC NOT NULL,
    current_price NUMERIC,
    pnl NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    leverage_ratio INTEGER DEFAULT 1,
    initial_margin NUMERIC DEFAULT 0,
    maintenance_margin NUMERIC DEFAULT 0,
    margin_level NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- Add foreign key constraint for positions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'positions_user_id_fkey' 
        AND table_name = 'positions'
    ) THEN
        ALTER TABLE positions ADD CONSTRAINT positions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for account_metrics
DROP POLICY IF EXISTS "Users can view their own account metrics" ON public.account_metrics;
CREATE POLICY "Users can view their own account metrics"
  ON public.account_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own account metrics" ON public.account_metrics;
CREATE POLICY "Users can update their own account metrics"
  ON public.account_metrics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for positions
DROP POLICY IF EXISTS "Users can view their own positions" ON public.positions;
CREATE POLICY "Users can view their own positions"
  ON public.positions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own positions" ON public.positions;
CREATE POLICY "Users can insert their own positions"
  ON public.positions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own positions" ON public.positions;
CREATE POLICY "Users can update their own positions"
  ON public.positions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_account_metrics_user_id ON public.account_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON public.positions(symbol);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);

-- Create or update triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers for positions
DROP TRIGGER IF EXISTS update_positions_updated_at ON public.positions;
CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON public.positions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for account_metrics  
DROP TRIGGER IF EXISTS update_account_metrics_last_updated ON public.account_metrics;
CREATE TRIGGER update_account_metrics_last_updated
    BEFORE UPDATE ON public.account_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
