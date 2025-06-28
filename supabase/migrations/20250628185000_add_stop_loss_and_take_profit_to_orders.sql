-- Migration: Ensure 'stop_loss_price' and 'take_profit_price' columns exist in public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stop_loss_price NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS take_profit_price NUMERIC;
