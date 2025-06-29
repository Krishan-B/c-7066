-- Migration: Ensure 'stop_loss_price' and 'take_profit_price' columns exist in public.orders
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'stop_loss_price') THEN
            ALTER TABLE public.orders ADD COLUMN stop_loss_price NUMERIC;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'take_profit_price') THEN
            ALTER TABLE public.orders ADD COLUMN take_profit_price NUMERIC;
        END IF;
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping stop_loss_price and take_profit_price columns addition';
    END IF;
END
$$;
