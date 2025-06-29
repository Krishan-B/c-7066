-- Safe schema update
DO $$ 
DECLARE
    tables CURSOR FOR
        SELECT tablename 
        FROM pg_tables
        WHERE schemaname = 'public';
    policies CURSOR FOR
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public';
    triggers CURSOR FOR
        SELECT tgname, relname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relnamespace = 'public'::regnamespace;
    constraints CURSOR FOR
        SELECT tc.table_schema, tc.constraint_name, tc.table_name, tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public';
    r RECORD;
BEGIN
    -- Drop policies safely
    FOR r IN policies LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;

    -- Drop triggers safely
    FOR r IN triggers LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I',
                      r.tgname, r.relname);
    END LOOP;

    -- Drop constraints safely
    FOR r IN constraints LOOP
        IF r.constraint_type IN ('FOREIGN KEY', 'CHECK') THEN
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
                         r.table_schema, r.table_name, r.constraint_name);
        END IF;
    END LOOP;

    RAISE NOTICE 'Schema cleanup completed successfully';
END $$;
