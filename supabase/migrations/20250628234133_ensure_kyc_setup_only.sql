-- This migration ensures KYC setup is complete
-- Since the KYC tables already exist in the remote database, this is just a verification

-- Verify KYC documents table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kyc_documents') THEN
        RAISE EXCEPTION 'KYC documents table does not exist';
    END IF;
END
$$;

-- Verify storage bucket exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'kyc-documents') THEN
        RAISE EXCEPTION 'KYC documents storage bucket does not exist';
    END IF;
END
$$;

-- Log successful verification
DO $$
BEGIN
    RAISE NOTICE 'KYC setup verification completed successfully';
END
$$;
