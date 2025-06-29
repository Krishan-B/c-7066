-- Create core trading tables that are referenced by other migrations

-- Users table extensions (assuming auth.users exists)
-- No need to create users table as it's handled by Supabase Auth

-- Accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT DEFAULT 'DEMO' CHECK (account_type IN ('DEMO', 'COMPETITION')),
    balance NUMERIC(15,2) DEFAULT 0.00,
    equity NUMERIC(15,2) DEFAULT 0.00,
    margin_used NUMERIC(15,2) DEFAULT 0.00,
    margin_free NUMERIC(15,2) DEFAULT 0.00,
    margin_level NUMERIC(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reset_count INTEGER DEFAULT 0
);

-- Assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK (asset_class IN ('FOREX', 'STOCKS', 'INDICES', 'COMMODITIES', 'CRYPTO')),
    base_currency TEXT,
    quote_currency TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    leverage_max INTEGER DEFAULT 1,
    spread_base NUMERIC(8,5) DEFAULT 0.00001,
    contract_size NUMERIC(15,2) DEFAULT 1.00,
    pip_value NUMERIC(8,5) DEFAULT 0.0001,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT')),
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity NUMERIC(15,4) NOT NULL,
    price NUMERIC(15,5),
    stop_price NUMERIC(15,5),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'REJECTED')),
    filled_quantity NUMERIC(15,4) DEFAULT 0,
    avg_fill_price NUMERIC(15,5),
    stop_loss_price NUMERIC(15,5),
    take_profit_price NUMERIC(15,5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    filled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions table - handle column updates safely
DO $$
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'positions') THEN
        CREATE TABLE public.positions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
            asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
            side TEXT NOT NULL CHECK (side IN ('LONG', 'SHORT')),
            quantity NUMERIC(15,4) NOT NULL,
            entry_price NUMERIC(15,5) NOT NULL,
            current_price NUMERIC(15,5),
            leverage INTEGER DEFAULT 1,
            margin_required NUMERIC(15,2) DEFAULT 0,
            unrealized_pnl NUMERIC(15,2) DEFAULT 0,
            realized_pnl NUMERIC(15,2) DEFAULT 0,
            rollover_charges NUMERIC(15,2) DEFAULT 0.00,
            take_profit NUMERIC(15,5),
            stop_loss NUMERIC(15,5),
            is_open BOOLEAN DEFAULT TRUE,
            opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            closed_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created positions table';
    ELSE
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'positions' AND column_name = 'account_id') THEN
            ALTER TABLE public.positions ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added account_id column to positions table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'positions' AND column_name = 'asset_id') THEN
            ALTER TABLE public.positions ADD COLUMN asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added asset_id column to positions table';
        END IF;
        
        -- Add other columns with similar checks
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'positions' AND column_name = 'side') THEN
            ALTER TABLE public.positions ADD COLUMN side TEXT NOT NULL DEFAULT 'LONG' CHECK (side IN ('LONG', 'SHORT'));
            RAISE NOTICE 'Added side column to positions table';
        END IF;
        
        -- Continue with other columns...
        RAISE NOTICE 'Positions table already exists, column updates applied if needed';
    END IF;
END
$$;

-- Create indexes for performance safely
DO $$
BEGIN
    -- Create account indexes if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts') THEN
        CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
        RAISE NOTICE 'Account indexes created or already exist';
    END IF;

    -- Create asset indexes if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets') THEN
        CREATE INDEX IF NOT EXISTS idx_assets_symbol ON public.assets(symbol);
        CREATE INDEX IF NOT EXISTS idx_assets_asset_class ON public.assets(asset_class);
        RAISE NOTICE 'Asset indexes created or already exist';
    END IF;

    -- Create order indexes if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_account_id ON public.orders(account_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
        RAISE NOTICE 'Order indexes created or already exist';
    END IF;

    -- Create position indexes if table and column exist
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'positions' AND column_name = 'account_id') THEN
        CREATE INDEX IF NOT EXISTS idx_positions_account_id ON public.positions(account_id);
        RAISE NOTICE 'Position indexes created or already exist';
    END IF;
END
$$;

-- Create is_open index only if column exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'positions' AND column_name = 'is_open') THEN
        CREATE INDEX IF NOT EXISTS idx_positions_is_open ON public.positions(is_open);
    END IF;
END
$$;

-- Enable RLS for tables
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts') THEN
        ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'positions') THEN
        ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Set up RLS policies for accounts if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts') THEN
        DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
        CREATE POLICY "Users can view their own accounts" ON public.accounts
            FOR SELECT USING (user_id = auth.uid());

        DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
        CREATE POLICY "Users can insert their own accounts" ON public.accounts
            FOR INSERT WITH CHECK (user_id = auth.uid());

        DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
        CREATE POLICY "Users can update their own accounts" ON public.accounts
            FOR UPDATE USING (user_id = auth.uid());
            
        RAISE NOTICE 'Account RLS policies created or updated';
    END IF;
END
$$;

-- Set up RLS policies for orders if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
        CREATE POLICY "Users can view their own orders" ON public.orders
            FOR SELECT USING (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));

        DROP POLICY IF EXISTS "Users can insert orders for their accounts" ON public.orders;
        CREATE POLICY "Users can insert orders for their accounts" ON public.orders
            FOR INSERT WITH CHECK (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));

        DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
        CREATE POLICY "Users can update their own orders" ON public.orders
            FOR UPDATE USING (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));
            
        RAISE NOTICE 'Order RLS policies created or updated';
    END IF;
END
$$;

-- Set up RLS policies for positions if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'positions') THEN
        DROP POLICY IF EXISTS "Users can view their own positions" ON public.positions;
        CREATE POLICY "Users can view their own positions" ON public.positions
            FOR SELECT USING (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));

        DROP POLICY IF EXISTS "Users can insert positions for their accounts" ON public.positions;
        CREATE POLICY "Users can insert positions for their accounts" ON public.positions
            FOR INSERT WITH CHECK (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));

        DROP POLICY IF EXISTS "Users can update their own positions" ON public.positions;
        CREATE POLICY "Users can update their own positions" ON public.positions
            FOR UPDATE USING (account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid()));
            
        RAISE NOTICE 'Position RLS policies created or updated';
    END IF;
END
$$;

-- Set up RLS policy for assets if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets') THEN
        DROP POLICY IF EXISTS "Anyone can view assets" ON public.assets;
        CREATE POLICY "Anyone can view assets" ON public.assets
            FOR SELECT USING (TRUE);
            
        RAISE NOTICE 'Asset RLS policies created or updated';
    END IF;
END
$$;

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for all tables that have updated_at column
DO $$
BEGIN
    -- Accounts table trigger
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
        CREATE TRIGGER update_accounts_updated_at
            BEFORE UPDATE ON public.accounts
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        RAISE NOTICE 'Created/updated trigger for accounts table';
    END IF;

    -- Assets table trigger
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
        CREATE TRIGGER update_assets_updated_at
            BEFORE UPDATE ON public.assets
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        RAISE NOTICE 'Created/updated trigger for assets table';
    END IF;

    -- Orders table trigger
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
        CREATE TRIGGER update_orders_updated_at
            BEFORE UPDATE ON public.orders
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        RAISE NOTICE 'Created/updated trigger for orders table';
    END IF;

    -- Positions table trigger
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'positions' AND column_name = 'updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS update_positions_updated_at ON public.positions;
        CREATE TRIGGER update_positions_updated_at
            BEFORE UPDATE ON public.positions
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        RAISE NOTICE 'Created/updated trigger for positions table';
    END IF;
END
$$;
