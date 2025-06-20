-- supabase/seed.sql

-- Clear out existing data to make this script idempotent
TRUNCATE TABLE public.orders RESTART IDENTITY;

-- Insert mock data into the orders table
insert into public.orders (id, user_id, symbol, order_type, side, quantity, price, status, stop_loss_price, take_profit_price, created_at)
values
  -- A limit buy order for BTC
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'BTC/USDT', 'limit', 'buy', 0.5, 60000.00, 'pending', 58000.00, 65000.00, now()),
  -- A market sell order for ETH
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ETH/USDT', 'market', 'sell', 10.0, null, 'filled', null, null, now() - interval '1 day'),
  -- A cancelled stop-limit order
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'SOL/USDT', 'stop_limit', 'buy', 100.0, 150.00, 'cancelled', 145.00, null, now() - interval '2 days');

-- You can add more seed data for other tables here
