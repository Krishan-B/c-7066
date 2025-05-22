-- Create enum for KYC status
CREATE TYPE kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');

-- Create enum for document types
CREATE TYPE document_type AS ENUM ('passport', 'national_id', 'drivers_license');

-- Create table for KYC verification
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status kyc_status NOT NULL DEFAULT 'pending',
  level SMALLINT NOT NULL DEFAULT 1,
  date_of_birth DATE,
  nationality TEXT,
  residence_address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  occupation TEXT,
  employer TEXT,
  annual_income TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for KYC documents
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.kyc_verifications(id),
  type document_type NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  document_url TEXT,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can only view their own KYC verification
CREATE POLICY kyc_verifications_select ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own KYC verification if not verified
CREATE POLICY kyc_verifications_update ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status != 'verified');

-- Users can only insert their own KYC verification
CREATE POLICY kyc_verifications_insert ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only view their own documents
CREATE POLICY kyc_documents_select ON public.kyc_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kyc_verifications
      WHERE id = verification_id AND user_id = auth.uid()
    )
  );

-- Users can only update their own documents if not verified
CREATE POLICY kyc_documents_update ON public.kyc_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.kyc_verifications
      WHERE id = verification_id 
      AND user_id = auth.uid()
      AND status != 'verified'
    )
  );

-- Users can only insert documents for their own verification
CREATE POLICY kyc_documents_insert ON public.kyc_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kyc_verifications
      WHERE id = verification_id AND user_id = auth.uid()
    )
  );

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_kyc_verifications_updated_at
    BEFORE UPDATE ON public.kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at
    BEFORE UPDATE ON public.kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_verification_id ON public.kyc_documents(verification_id);