-- Sync migration: Reconcile local and remote schemas
-- This migration safely applies local changes to remote without conflicts

-- 1. Check and create KYC documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'kyc-documents', 'kyc-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'kyc-documents'
);

-- 2. Check and add columns to existing tables (if they don't exist)

-- Add quantity column to orders table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'orders' AND column_name = 'quantity' AND table_schema = 'public') THEN
            ALTER TABLE public.orders ADD COLUMN quantity DECIMAL(18, 8);
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping quantity column addition';
    END IF;
END $$;

-- Add price column to orders table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'orders' AND column_name = 'price' AND table_schema = 'public') THEN
            ALTER TABLE public.orders ADD COLUMN price DECIMAL(18, 8);
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping price column addition';
    END IF;
END $$;

-- Add stop_loss column to orders table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'orders' AND column_name = 'stop_loss' AND table_schema = 'public') THEN
            ALTER TABLE public.orders ADD COLUMN stop_loss DECIMAL(18, 8);
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping stop_loss column addition';
    END IF;
END $$;

-- Add take_profit column to orders table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'orders' AND column_name = 'take_profit' AND table_schema = 'public') THEN
            ALTER TABLE public.orders ADD COLUMN take_profit DECIMAL(18, 8);
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping take_profit column addition';
    END IF;
END $$;

-- Add leverage column to orders table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'orders' AND column_name = 'leverage' AND table_schema = 'public') THEN
            ALTER TABLE public.orders ADD COLUMN leverage INTEGER DEFAULT 1;
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping leverage column addition';
    END IF;
END $$;

-- Add margin_used column to orders table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'orders' AND column_name = 'margin_used' AND table_schema = 'public') THEN
            ALTER TABLE public.orders ADD COLUMN margin_used DECIMAL(18, 8);
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping margin_used column addition';
    END IF;
END $$;

-- 3. Create or replace functions that might have changed

-- Update the get_user_balance function with proper search path
CREATE OR REPLACE FUNCTION public.get_user_balance(user_uuid UUID)
RETURNS TABLE(
  currency TEXT,
  available_balance DECIMAL,
  locked_balance DECIMAL,
  total_balance DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.currency,
    b.available_balance,
    b.locked_balance,
    (b.available_balance + b.locked_balance) AS total_balance
  FROM public.balances b
  WHERE b.user_id = user_uuid;
END;
$$;

-- Update the calculate_pnl function with proper search path
CREATE OR REPLACE FUNCTION public.calculate_pnl(
  p_user_id UUID,
  p_symbol TEXT DEFAULT NULL
)
RETURNS TABLE(
  symbol TEXT,
  unrealized_pnl DECIMAL,
  realized_pnl DECIMAL,
  total_pnl DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.symbol,
    COALESCE(SUM(CASE WHEN t.side = 'BUY' THEN t.quantity * (100.00 - t.price) ELSE t.quantity * (t.price - 100.00) END), 0) as unrealized_pnl,
    COALESCE(SUM(CASE WHEN t.status = 'FILLED' THEN t.quantity * 0.1 ELSE 0 END), 0) as realized_pnl,
    COALESCE(SUM(CASE WHEN t.side = 'BUY' THEN t.quantity * (100.00 - t.price) ELSE t.quantity * (t.price - 100.00) END), 0) + 
    COALESCE(SUM(CASE WHEN t.status = 'FILLED' THEN t.quantity * 0.1 ELSE 0 END), 0) as total_pnl
  FROM public.orders t
  WHERE t.user_id = p_user_id
    AND (p_symbol IS NULL OR t.symbol = p_symbol)
  GROUP BY t.symbol;
END;
$$;

-- 4. Ensure all necessary indexes exist

-- Create indexes on orders table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        -- Create index on orders.user_id if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
        
        -- Create index on orders.symbol if it doesn't exist  
        CREATE INDEX IF NOT EXISTS idx_orders_symbol ON public.orders(symbol);
        
        -- Create index on orders.status if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
        
        -- Create index on orders.created_at if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
    END IF;
END $$;

-- Create index on balances.user_id if it doesn't exist and table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balances' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_balances_user_id ON public.balances(user_id);
    END IF;
END $$;

-- Create index on balances.currency if it doesn't exist and table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balances' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_balances_currency ON public.balances(currency);
    END IF;
END $$;

-- 5. Update RLS policies to ensure they're current

-- Refresh orders table policies if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
        CREATE POLICY "Users can view their own orders"
          ON public.orders
          FOR SELECT
          USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
        CREATE POLICY "Users can insert their own orders"
          ON public.orders
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
        CREATE POLICY "Users can update their own orders"
          ON public.orders
          FOR UPDATE
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Refresh balances table policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balances' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own balances" ON public.balances;
        CREATE POLICY "Users can view their own balances"
          ON public.balances
          FOR SELECT
          USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own balances" ON public.balances;
        CREATE POLICY "Users can update their own balances"
          ON public.balances
          FOR UPDATE
          USING (auth.uid() = user_id);
          
        -- Enable RLS on balances table
        ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on all tables if not already enabled
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 6. Create or update any missing triggers

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to orders table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
        CREATE TRIGGER update_orders_updated_at
            BEFORE UPDATE ON public.orders
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Drop and recreate trigger for balances if the table has updated_at column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'balances' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_balances_updated_at ON public.balances;
        CREATE TRIGGER update_balances_updated_at
            BEFORE UPDATE ON public.balances
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
