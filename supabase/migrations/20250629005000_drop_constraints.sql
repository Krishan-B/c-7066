-- Drop constraints safely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop foreign key constraints
    FOR r IN (SELECT DISTINCT tc.table_schema, tc.constraint_name, tc.table_name
              FROM information_schema.table_constraints AS tc
              JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
              WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public')
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    
    -- Drop check constraints
    FOR r IN (SELECT DISTINCT tc.table_schema, tc.constraint_name, tc.table_name
              FROM information_schema.table_constraints AS tc
              WHERE tc.constraint_type = 'CHECK'
              AND tc.table_schema = 'public')
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;
