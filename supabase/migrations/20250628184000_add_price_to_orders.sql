-- Migration: Ensure 'price' column exists in public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS price NUMERIC;
