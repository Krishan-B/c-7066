-- Drop and recreate kyc_documents table
DROP TABLE IF EXISTS public.kyc_documents CASCADE;

CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    category TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    comments TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_category ON public.kyc_documents(category);

-- Enable RLS
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own KYC documents" ON public.kyc_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC documents" ON public.kyc_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC documents" ON public.kyc_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KYC documents" ON public.kyc_documents
    FOR DELETE USING (auth.uid() = user_id);
