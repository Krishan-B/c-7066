-- Migration: Ensure 'quantity' column exists in public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity NUMERIC NOT NULL DEFAULT 0;
