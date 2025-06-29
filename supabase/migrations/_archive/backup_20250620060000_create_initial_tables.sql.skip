-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'kyc-documents', 'kyc-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'kyc-documents'
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'ID_PASSPORT', 'ID_FRONT', 'ID_BACK', 'DRIVERS_LICENSE', 
    'UTILITY_BILL', 'BANK_STATEMENT', 'CREDIT_CARD_STATEMENT', 
    'TAX_BILL', 'OTHER_ID', 'OTHER_ADDRESS', 'OTHER_DOC'
  )),
  category TEXT NOT NULL CHECK (category IN (
    'ID_VERIFICATION', 'ADDRESS_VERIFICATION', 'OTHER_DOCUMENTATION'
  )),
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  comments TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add KYC status to user metadata (stored in auth.users.raw_user_meta_data)
-- This will be managed through the auth system

-- Enable RLS on kyc_documents table
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for kyc_documents
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON public.kyc_documents;
CREATE POLICY "Users can view their own KYC documents"
  ON public.kyc_documents
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own KYC documents" ON public.kyc_documents;
CREATE POLICY "Users can insert their own KYC documents"
  ON public.kyc_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own KYC documents" ON public.kyc_documents;
CREATE POLICY "Users can update their own KYC documents"
  ON public.kyc_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage policies for KYC documents bucket
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
CREATE POLICY "Users can upload their own KYC documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
CREATE POLICY "Users can view their own KYC documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
CREATE POLICY "Admins can view all KYC documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON public.kyc_documents;
CREATE TRIGGER update_kyc_documents_updated_at
    BEFORE UPDATE ON public.kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  experience_level TEXT CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  preferences JSONB
);

-- Create accounts table
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT DEFAULT 'DEMO' CHECK (account_type IN ('DEMO', 'COMPETITION')),
  balance NUMERIC(15,2) DEFAULT 0.00,
  equity NUMERIC(15,2),
  margin_used NUMERIC(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reset_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  asset_class TEXT NOT NULL CHECK (asset_class IN ('FOREX', 'STOCKS', 'INDICES', 'COMMODITIES', 'CRYPTO')),
  base_currency VARCHAR(3),
  quote_currency VARCHAR(3),
  is_active BOOLEAN DEFAULT TRUE,
  leverage_max INTEGER,
  spread_base NUMERIC(8,5),
  contract_size NUMERIC(15,2) DEFAULT 1.00
);

-- Create positions table for trading platform
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
  units NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  leverage NUMERIC DEFAULT 1,
  open_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  close_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
  realized_pnl NUMERIC DEFAULT 0,
  unrealized_pnl NUMERIC DEFAULT 0,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on positions table
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Users can delete their own positions" ON public.positions;
CREATE POLICY "Users can delete their own positions"
  ON public.positions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp for positions
CREATE OR REPLACE FUNCTION update_positions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON public.positions
    FOR EACH ROW
    EXECUTE FUNCTION update_positions_updated_at_column();

-- Create orders table for trading platform
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'trailing_stop')),
  direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL,
  price NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
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

DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
CREATE POLICY "Users can delete their own orders"
  ON public.orders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at_column();

-- Enhance orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stop_price NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS filled_quantity NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS avg_fill_price NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS side TEXT NOT NULL CHECK (side IN ('buy', 'sell'));

-- Enhance positions table
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id);
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id);

-- Remove units column if it exists (for upgrades)
ALTER TABLE public.orders DROP COLUMN IF EXISTS units;
