-- Final schema cleanup and reset
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all foreign key constraints
    FOR r IN (SELECT tc.constraint_name, tc.table_name
              FROM information_schema.table_constraints tc
              WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_schema='public'
              AND tc.table_name='kyc_documents')
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', 
                      r.table_name, 
                      r.constraint_name);
    END LOOP;

    -- Drop all check constraints
    FOR r IN (SELECT tc.constraint_name, tc.table_name
              FROM information_schema.table_constraints tc
              WHERE tc.constraint_type = 'CHECK' 
              AND tc.table_schema='public'
              AND tc.table_name='kyc_documents')
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', 
                      r.table_name, 
                      r.constraint_name);
    END LOOP;

    -- Drop all triggers
    FOR r IN (SELECT tgname::text as trigger_name, relname::text as table_name
              FROM pg_trigger t 
              JOIN pg_class c ON t.tgrelid = c.oid 
              WHERE c.relname = 'kyc_documents')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 
                      r.trigger_name, 
                      r.table_name);
    END LOOP;

    -- Drop all policies
    FOR r IN (SELECT policyname 
              FROM pg_policies 
              WHERE tablename = 'kyc_documents' 
              AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.kyc_documents', 
                      r.policyname);
    END LOOP;

    RAISE NOTICE 'All constraints, triggers, and policies have been cleaned up';
END $$;
