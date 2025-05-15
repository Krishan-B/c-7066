
-- Create table for user account data
CREATE TABLE IF NOT EXISTS public.user_account (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  cash_balance DECIMAL(18, 8) NOT NULL DEFAULT 10000.00,
  equity DECIMAL(18, 8) NOT NULL DEFAULT 10000.00,
  used_margin DECIMAL(18, 8) NOT NULL DEFAULT 0.00,
  available_funds DECIMAL(18, 8) NOT NULL DEFAULT 10000.00,
  unrealized_pnl DECIMAL(18, 8) NOT NULL DEFAULT 0.00,
  realized_pnl DECIMAL(18, 8) NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies to secure user account data
ALTER TABLE public.user_account ENABLE ROW LEVEL SECURITY;

-- Users can only view their own account data
CREATE POLICY user_account_select ON public.user_account
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own account data
CREATE POLICY user_account_update ON public.user_account
  FOR UPDATE USING (auth.uid() = id);

-- Only service role can insert new account records (or users for their own data)
CREATE POLICY user_account_insert ON public.user_account
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create account when user signs up
CREATE OR REPLACE FUNCTION public.create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_account (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_account();
