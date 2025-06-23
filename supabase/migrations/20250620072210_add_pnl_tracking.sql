-- Add real-time P&L tracking columns to positions table
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS daily_pnl NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS session_pnl NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_fees NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS swap_charges NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pip_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pip_difference NUMERIC DEFAULT 0;

-- Create position_updates table for real-time tracking
CREATE TABLE IF NOT EXISTS public.position_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID REFERENCES public.positions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  price_update NUMERIC NOT NULL,
  pnl_change NUMERIC NOT NULL,
  unrealized_pnl NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  market_session TEXT DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS for position_updates
ALTER TABLE public.position_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for position_updates
CREATE POLICY "Users can view their own position updates" 
  ON public.position_updates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own position updates" 
  ON public.position_updates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function for real-time P&L calculation
CREATE OR REPLACE FUNCTION public.calculate_realtime_pnl(
  p_position_id UUID,
  p_new_price NUMERIC
) RETURNS TABLE(
  unrealized_pnl NUMERIC,
  daily_pnl NUMERIC,
  pip_difference NUMERIC,
  pip_value NUMERIC
) AS $$
DECLARE
  pos RECORD;
  pnl_result NUMERIC;
  daily_result NUMERIC;
  pip_diff NUMERIC;
  pip_val NUMERIC;
BEGIN
  -- Get position details
  SELECT * INTO pos 
  FROM public.positions 
  WHERE id = p_position_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate unrealized P&L
  IF pos.direction = 'buy' THEN
    pnl_result := (p_new_price - pos.entry_price) * pos.quantity;
  ELSE
    pnl_result := (pos.entry_price - p_new_price) * pos.quantity;
  END IF;
  
  -- Calculate daily P&L (difference from session start)
  daily_result := pnl_result - COALESCE(pos.session_pnl, 0);
  
  -- Calculate pip difference and value (for forex)
  IF pos.asset_class = 'forex' THEN
    pip_diff := ABS(p_new_price - pos.entry_price) * 10000;
    pip_val := pnl_result / NULLIF(pip_diff, 0);
  ELSE
    pip_diff := 0;
    pip_val := 0;
  END IF;
  
  RETURN QUERY SELECT pnl_result, daily_result, pip_diff, pip_val;
END;
$$ LANGUAGE plpgsql;

-- Create function to update position with real-time data
CREATE OR REPLACE FUNCTION public.update_position_realtime(
  p_position_id UUID,
  p_new_price NUMERIC
) RETURNS BOOLEAN AS $$
DECLARE
  pnl_data RECORD;
BEGIN
  -- Calculate new P&L values
  SELECT * INTO pnl_data 
  FROM public.calculate_realtime_pnl(p_position_id, p_new_price);
  
  -- Update position
  UPDATE public.positions 
  SET 
    current_price = p_new_price,
    unrealized_pnl = pnl_data.unrealized_pnl,
    daily_pnl = pnl_data.daily_pnl,
    pip_difference = pnl_data.pip_difference,
    pip_value = pnl_data.pip_value,
    last_updated = NOW()
  WHERE id = p_position_id;
  
  -- Insert update record
  INSERT INTO public.position_updates (
    position_id, 
    user_id, 
    price_update, 
    pnl_change, 
    unrealized_pnl
  )
  SELECT 
    p_position_id,
    user_id,
    p_new_price,
    pnl_data.unrealized_pnl - COALESCE(unrealized_pnl, 0),
    pnl_data.unrealized_pnl
  FROM public.positions 
  WHERE id = p_position_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_position_updates_position_id ON public.position_updates(position_id);
CREATE INDEX IF NOT EXISTS idx_position_updates_timestamp ON public.position_updates(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_positions_last_updated ON public.positions(last_updated DESC);

-- Enable realtime for position updates
ALTER TABLE public.positions REPLICA IDENTITY FULL;
ALTER TABLE public.position_updates REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.position_updates;
