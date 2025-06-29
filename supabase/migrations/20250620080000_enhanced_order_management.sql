
-- Add stop-loss and take-profit support to orders table
-- Check if orders table exists before altering
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'trailing_stop_distance') THEN
            ALTER TABLE public.orders ADD COLUMN trailing_stop_distance NUMERIC;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_group_id') THEN
            ALTER TABLE public.orders ADD COLUMN order_group_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'parent_order_id') THEN
            ALTER TABLE public.orders ADD COLUMN parent_order_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_category') THEN
            ALTER TABLE public.orders ADD COLUMN order_category TEXT DEFAULT 'primary';
        END IF;
        
        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'orders' 
            AND constraint_name = 'orders_parent_order_id_fkey'
        ) THEN
            ALTER TABLE public.orders ADD CONSTRAINT orders_parent_order_id_fkey 
            FOREIGN KEY (parent_order_id) REFERENCES public.orders(id);
        END IF;
        
        -- Add check constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.check_constraints 
            WHERE constraint_schema = 'public' 
            AND constraint_name = 'orders_order_category_check'
        ) THEN
            ALTER TABLE public.orders ADD CONSTRAINT orders_order_category_check 
            CHECK (order_category IN ('primary', 'stop_loss', 'take_profit', 'trailing_stop'));
        END IF;

        -- Update order_type to support new order types
        ALTER TABLE public.orders 
        DROP CONSTRAINT IF EXISTS orders_order_type_check;

        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_order_type_check 
        CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit', 'stop_loss', 'take_profit', 'trailing_stop'));

        -- Create index for better performance on order relationships
        CREATE INDEX IF NOT EXISTS idx_orders_parent_order_id ON public.orders(parent_order_id);
        CREATE INDEX IF NOT EXISTS idx_orders_group_id ON public.orders(order_group_id);
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping order management enhancements';
    END IF;
END
$$;

-- Create trigger to auto-cancel child orders when parent is filled/cancelled
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        CREATE OR REPLACE FUNCTION handle_parent_order_status_change()
        RETURNS TRIGGER AS $func$
        BEGIN
          -- If parent order is filled or cancelled, cancel all child orders
          IF NEW.status IN ('filled', 'cancelled') AND OLD.status != NEW.status THEN
            UPDATE public.orders 
            SET status = 'cancelled', 
                cancelled_at = NOW()
            WHERE parent_order_id = NEW.id 
              AND status = 'pending';
          END IF;
          
          RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_parent_order_status_change ON public.orders;
        CREATE TRIGGER trigger_parent_order_status_change
          AFTER UPDATE ON public.orders
          FOR EACH ROW
          EXECUTE FUNCTION handle_parent_order_status_change();
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping trigger creation';
    END IF;
END
$$;
