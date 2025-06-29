-- Drop and recreate all tables to resolve constraint issues
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.kyc_documents CASCADE;

-- Create tables in correct order
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    balance DECIMAL(18,8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT')),
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED')),
    quantity DECIMAL(18,8),
    price DECIMAL(18,8),
    stop_loss_price DECIMAL(18,8),
    take_profit_price DECIMAL(18,8),
    leverage DECIMAL(18,8),
    margin_used DECIMAL(18,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('LONG', 'SHORT')),
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    entry_price DECIMAL(18,8) NOT NULL,
    current_price DECIMAL(18,8) NOT NULL,
    quantity DECIMAL(18,8) NOT NULL,
    pnl DECIMAL(18,8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    category TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    comments TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.accounts
ADD CONSTRAINT accounts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_account_id_fkey
FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE,
ADD CONSTRAINT orders_asset_id_fkey
FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.positions
ADD CONSTRAINT positions_account_id_fkey
FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE,
ADD CONSTRAINT positions_asset_id_fkey
FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

ALTER TABLE public.kyc_documents
ADD CONSTRAINT kyc_documents_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT kyc_documents_reviewed_by_fkey
FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_account_id ON public.orders(account_id);
CREATE INDEX IF NOT EXISTS idx_orders_asset_id ON public.orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_positions_account_id ON public.positions(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_asset_id ON public.positions(asset_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);
