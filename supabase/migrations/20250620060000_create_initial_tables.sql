
-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 
  'kyc-documents', 
  false, 
  10485760, -- 10MB limit as per PRD
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

-- Create KYC documents table
CREATE TABLE public.kyc_documents (
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
CREATE POLICY "Users can view their own KYC documents"
  ON public.kyc_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC documents"
  ON public.kyc_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC documents"
  ON public.kyc_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage policies for KYC documents bucket
CREATE POLICY "Users can upload their own KYC documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own KYC documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

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

CREATE TRIGGER update_kyc_documents_updated_at
    BEFORE UPDATE ON public.kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
