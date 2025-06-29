-- Migration: Ensure 'price' column exists in public.orders
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'price') THEN
            ALTER TABLE public.orders ADD COLUMN price NUMERIC;
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping price column addition';
    END IF;
END
$$;
