-- Migration: Fix function search_path warnings (Supabase Linter)
-- Date: 2025-06-25

-- Re-create all affected functions with explicit SET search_path = public

CREATE OR REPLACE FUNCTION public.calculate_realtime_pnl(
  p_position_id UUID,
  p_new_price NUMERIC
) RETURNS TABLE(
  unrealized_pnl NUMERIC,
  daily_pnl NUMERIC,
  pip_difference NUMERIC,
  pip_value NUMERIC
)
SET search_path = public
AS $$
DECLARE
  pos RECORD;
  pnl_result NUMERIC;
  daily_result NUMERIC;
  pip_diff NUMERIC;
  pip_val NUMERIC;
BEGIN
  SELECT * INTO pos FROM public.positions WHERE id = p_position_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF pos.direction = 'buy' THEN
    pnl_result := (p_new_price - pos.entry_price) * pos.quantity;
  ELSE
    pnl_result := (pos.entry_price - p_new_price) * pos.quantity;
  END IF;
  daily_result := pnl_result - COALESCE(pos.session_pnl, 0);
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

CREATE OR REPLACE FUNCTION public.update_position_realtime(
  p_position_id UUID,
  p_new_price NUMERIC
) RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
  pnl_data RECORD;
BEGIN
  SELECT * INTO pnl_data FROM public.calculate_realtime_pnl(p_position_id, p_new_price);
  UPDATE public.positions SET current_price = p_new_price, unrealized_pnl = pnl_data.unrealized_pnl, daily_pnl = pnl_data.daily_pnl, pip_difference = pnl_data.pip_difference, pip_value = pnl_data.pip_value, last_updated = NOW() WHERE id = p_position_id;
  INSERT INTO public.position_updates (position_id, user_id, price_update, pnl_change, unrealized_pnl)
  SELECT p_position_id, user_id, p_new_price, pnl_data.unrealized_pnl - COALESCE(unrealized_pnl, 0), pnl_data.unrealized_pnl FROM public.positions WHERE id = p_position_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_position_margin(
  p_asset_class TEXT,
  p_symbol TEXT,
  p_position_value NUMERIC,
  p_leverage NUMERIC DEFAULT NULL
) RETURNS TABLE(
  max_leverage INTEGER,
  initial_margin NUMERIC,
  maintenance_margin NUMERIC,
  margin_level NUMERIC,
  leverage_used NUMERIC
)
SET search_path = public
AS $$
DECLARE
  config RECORD;
  calculated_leverage NUMERIC;
  initial_margin_val NUMERIC;
  maintenance_margin_val NUMERIC;
BEGIN
  SELECT * INTO config FROM public.asset_leverage_config WHERE asset_class = p_asset_class AND (symbol = p_symbol OR symbol IS NULL) ORDER BY symbol NULLS LAST LIMIT 1;
  IF NOT FOUND THEN
    config.max_leverage := 10;
    config.min_margin_requirement := 0.1;
    config.maintenance_margin := 0.2;
    config.margin_call_level := 1.0;
  END IF;
  calculated_leverage := COALESCE(p_leverage, config.max_leverage);
  calculated_leverage := LEAST(calculated_leverage, config.max_leverage);
  initial_margin_val := p_position_value / calculated_leverage;
  maintenance_margin_val := p_position_value * config.maintenance_margin;
  RETURN QUERY SELECT config.max_leverage, initial_margin_val, maintenance_margin_val, config.margin_call_level, calculated_leverage;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_position_leverage(
  p_position_id UUID,
  p_leverage NUMERIC DEFAULT NULL
) RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
  pos RECORD;
  margin_data RECORD;
BEGIN
  SELECT * INTO pos FROM public.positions WHERE id = p_position_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  SELECT * INTO margin_data FROM public.calculate_position_margin(pos.asset_class, pos.symbol, pos.position_value, p_leverage);
  UPDATE public.positions SET leverage_ratio = margin_data.leverage_used, initial_margin = margin_data.initial_margin, maintenance_margin = margin_data.maintenance_margin, margin_level = margin_data.margin_level, margin_used = margin_data.initial_margin, last_updated = NOW() WHERE id = p_position_id;
  INSERT INTO public.margin_calculations (position_id, user_id, initial_margin, maintenance_margin, used_margin, free_margin, margin_level, leverage_used)
  SELECT p_position_id, pos.user_id, margin_data.initial_margin, margin_data.maintenance_margin, margin_data.initial_margin, 0, margin_data.margin_level, margin_data.leverage_used;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.auto_calculate_position_leverage()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_position_leverage(NEW.id, NEW.leverage_ratio);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
