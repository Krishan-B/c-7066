
-- Trading Engine Database Schema

-- Create enhanced orders table with comprehensive order management
DROP TABLE IF EXISTS public.trading_orders CASCADE;
CREATE TABLE public.trading_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'entry', 'stop_loss', 'take_profit')),
  direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
  units NUMERIC NOT NULL CHECK (units > 0),
  requested_price NUMERIC NOT NULL CHECK (requested_price > 0),
  execution_price NUMERIC,
  position_value NUMERIC NOT NULL,
  margin_required NUMERIC NOT NULL,
  leverage_ratio NUMERIC NOT NULL DEFAULT 1.0,
  stop_loss_price NUMERIC,
  take_profit_price NUMERIC,
  expiration_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'expired', 'filled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  fees NUMERIC DEFAULT 0,
  slippage NUMERIC DEFAULT 0
);

-- Create enhanced positions table for active trades
DROP TABLE IF EXISTS public.trading_positions CASCADE;
CREATE TABLE public.trading_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.trading_orders(id),
  symbol TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
  units NUMERIC NOT NULL CHECK (units > 0),
  entry_price NUMERIC NOT NULL CHECK (entry_price > 0),
  current_price NUMERIC NOT NULL CHECK (current_price > 0),
  position_value NUMERIC NOT NULL,
  margin_used NUMERIC NOT NULL,
  leverage_ratio NUMERIC NOT NULL DEFAULT 1.0,
  unrealized_pnl NUMERIC DEFAULT 0,
  daily_pnl NUMERIC DEFAULT 0,
  total_fees NUMERIC DEFAULT 0,
  stop_loss_price NUMERIC,
  take_profit_price NUMERIC,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

-- Create account metrics table for real-time tracking
DROP TABLE IF EXISTS public.account_metrics CASCADE;
CREATE TABLE public.account_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 10000.00,
  bonus NUMERIC NOT NULL DEFAULT 0.00,
  equity NUMERIC NOT NULL DEFAULT 10000.00,
  used_margin NUMERIC NOT NULL DEFAULT 0.00,
  available_funds NUMERIC NOT NULL DEFAULT 10000.00,
  unrealized_pnl NUMERIC NOT NULL DEFAULT 0.00,
  realized_pnl NUMERIC NOT NULL DEFAULT 0.00,
  total_exposure NUMERIC NOT NULL DEFAULT 0.00,
  margin_level NUMERIC NOT NULL DEFAULT 0.00,
  open_positions_count INTEGER NOT NULL DEFAULT 0,
  pending_orders_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create order history table for audit trail
CREATE TABLE public.order_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create asset leverage configuration
INSERT INTO public.asset_leverage_config (asset_class, symbol, max_leverage, min_margin_requirement, maintenance_margin, margin_call_level) 
VALUES 
  ('stocks', NULL, 20, 0.05, 0.1, 1.0),
  ('indices', NULL, 50, 0.02, 0.05, 1.0),
  ('commodities', NULL, 50, 0.02, 0.05, 1.0),
  ('forex', NULL, 100, 0.01, 0.025, 1.0),
  ('crypto', NULL, 50, 0.02, 0.05, 1.0)
ON CONFLICT (asset_class, symbol) DO UPDATE SET
  max_leverage = EXCLUDED.max_leverage,
  min_margin_requirement = EXCLUDED.min_margin_requirement,
  maintenance_margin = EXCLUDED.maintenance_margin;

-- Enable RLS on all trading tables
ALTER TABLE public.trading_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trading_orders
CREATE POLICY "Users can view their own orders" ON public.trading_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.trading_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.trading_orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for trading_positions
CREATE POLICY "Users can view their own positions" ON public.trading_positions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own positions" ON public.trading_positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own positions" ON public.trading_positions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for account_metrics
CREATE POLICY "Users can view their own metrics" ON public.account_metrics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own metrics" ON public.account_metrics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own metrics" ON public.account_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for order_history
CREATE POLICY "Users can view their own history" ON public.order_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own history" ON public.order_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trading engine calculation functions
CREATE OR REPLACE FUNCTION public.calculate_position_pnl_realtime(
  p_direction TEXT,
  p_entry_price NUMERIC,
  p_current_price NUMERIC,
  p_units NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  IF p_direction = 'buy' THEN
    RETURN (p_current_price - p_entry_price) * p_units;
  ELSE
    RETURN (p_entry_price - p_current_price) * p_units;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update account metrics in real-time
CREATE OR REPLACE FUNCTION public.update_account_metrics(p_user_id UUID) RETURNS VOID AS $$
DECLARE
  v_unrealized_pnl NUMERIC := 0;
  v_used_margin NUMERIC := 0;
  v_total_exposure NUMERIC := 0;
  v_open_positions INTEGER := 0;
  v_pending_orders INTEGER := 0;
  v_balance NUMERIC;
  v_bonus NUMERIC;
  v_realized_pnl NUMERIC;
  v_equity NUMERIC;
  v_available_funds NUMERIC;
  v_margin_level NUMERIC;
BEGIN
  -- Calculate totals from positions
  SELECT 
    COALESCE(SUM(unrealized_pnl), 0),
    COALESCE(SUM(margin_used), 0),
    COALESCE(SUM(position_value), 0),
    COUNT(*)
  INTO v_unrealized_pnl, v_used_margin, v_total_exposure, v_open_positions
  FROM public.trading_positions 
  WHERE user_id = p_user_id AND status = 'open';
  
  -- Count pending orders
  SELECT COUNT(*) INTO v_pending_orders
  FROM public.trading_orders
  WHERE user_id = p_user_id AND status = 'pending';
  
  -- Get current account data or create if not exists
  SELECT balance, bonus, realized_pnl 
  INTO v_balance, v_bonus, v_realized_pnl
  FROM public.account_metrics 
  WHERE user_id = p_user_id;
  
  -- Set defaults if account doesn't exist
  IF NOT FOUND THEN
    v_balance := 10000.00;
    v_bonus := 0.00;
    v_realized_pnl := 0.00;
  END IF;
  
  -- Calculate derived metrics
  v_equity := v_balance + v_unrealized_pnl;
  v_available_funds := v_balance + v_bonus - v_used_margin;
  v_margin_level := CASE 
    WHEN v_used_margin > 0 THEN (v_equity / v_used_margin) * 100 
    ELSE 0 
  END;
  
  -- Upsert account metrics
  INSERT INTO public.account_metrics (
    user_id, balance, bonus, equity, used_margin, available_funds, 
    unrealized_pnl, realized_pnl, total_exposure, margin_level,
    open_positions_count, pending_orders_count, last_updated
  ) VALUES (
    p_user_id, v_balance, v_bonus, v_equity, v_used_margin, v_available_funds,
    v_unrealized_pnl, v_realized_pnl, v_total_exposure, v_margin_level,
    v_open_positions, v_pending_orders, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    equity = v_equity,
    used_margin = v_used_margin,
    available_funds = v_available_funds,
    unrealized_pnl = v_unrealized_pnl,
    total_exposure = v_total_exposure,
    margin_level = v_margin_level,
    open_positions_count = v_open_positions,
    pending_orders_count = v_pending_orders,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to execute market order
CREATE OR REPLACE FUNCTION public.execute_market_order(
  p_order_id UUID,
  p_execution_price NUMERIC
) RETURNS BOOLEAN AS $$
DECLARE
  v_order RECORD;
  v_position_id UUID;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM public.trading_orders WHERE id = p_order_id;
  
  IF NOT FOUND OR v_order.status != 'pending' THEN
    RETURN FALSE;
  END IF;
  
  -- Update order status
  UPDATE public.trading_orders 
  SET 
    status = 'executed',
    execution_price = p_execution_price,
    executed_at = NOW()
  WHERE id = p_order_id;
  
  -- Create position
  INSERT INTO public.trading_positions (
    user_id, order_id, symbol, asset_class, direction, units,
    entry_price, current_price, position_value, margin_used, leverage_ratio,
    stop_loss_price, take_profit_price
  ) VALUES (
    v_order.user_id, p_order_id, v_order.symbol, v_order.asset_class,
    v_order.direction, v_order.units, p_execution_price, p_execution_price,
    v_order.position_value, v_order.margin_required, v_order.leverage_ratio,
    v_order.stop_loss_price, v_order.take_profit_price
  ) RETURNING id INTO v_position_id;
  
  -- Log to history
  INSERT INTO public.order_history (user_id, order_id, action, details)
  VALUES (v_order.user_id, p_order_id, 'executed', 
    json_build_object('execution_price', p_execution_price, 'position_id', v_position_id));
  
  -- Update account metrics
  PERFORM public.update_account_metrics(v_order.user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_trading_orders_user_status ON public.trading_orders(user_id, status);
CREATE INDEX idx_trading_positions_user_status ON public.trading_positions(user_id, status);
CREATE INDEX idx_trading_orders_symbol ON public.trading_orders(symbol);
CREATE INDEX idx_trading_positions_symbol ON public.trading_positions(symbol);

-- Enable realtime for trading tables
ALTER TABLE public.trading_orders REPLICA IDENTITY FULL;
ALTER TABLE public.trading_positions REPLICA IDENTITY FULL;
ALTER TABLE public.account_metrics REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_positions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.account_metrics;
