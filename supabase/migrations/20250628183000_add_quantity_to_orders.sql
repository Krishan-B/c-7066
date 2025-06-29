-- Migration: Ensure 'quantity' column exists in public.orders
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'quantity') THEN
            ALTER TABLE public.orders ADD COLUMN quantity NUMERIC NOT NULL DEFAULT 0;
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping quantity column addition';
    END IF;
END
$$;
