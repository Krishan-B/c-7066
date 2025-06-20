
-- Add stop-loss and take-profit support to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stop_loss_price NUMERIC,
ADD COLUMN IF NOT EXISTS take_profit_price NUMERIC,
ADD COLUMN IF NOT EXISTS trailing_stop_distance NUMERIC,
ADD COLUMN IF NOT EXISTS order_group_id UUID,
ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES public.orders(id),
ADD COLUMN IF NOT EXISTS order_category TEXT DEFAULT 'primary' CHECK (order_category IN ('primary', 'stop_loss', 'take_profit', 'trailing_stop'));

-- Update order_type to support new order types
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_order_type_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_order_type_check 
CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit', 'stop_loss', 'take_profit', 'trailing_stop'));

-- Create index for better performance on order relationships
CREATE INDEX IF NOT EXISTS idx_orders_parent_order_id ON public.orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_group_id ON public.orders(order_group_id);

-- Create trigger to auto-cancel child orders when parent is filled/cancelled
CREATE OR REPLACE FUNCTION handle_parent_order_status_change()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_parent_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_parent_order_status_change();
