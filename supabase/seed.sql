-- supabase/seed.sql

-- Insert mock users into auth.users to satisfy foreign key constraints
insert into auth.users (id, email, encrypted_password)
values
  ('00000000-0000-0000-0000-000000000000', 'mockuser1@example.com', 'password1'),
  ('00000000-0000-0000-0000-000000000001', 'mockuser2@example.com', 'password2')
ON CONFLICT (id) DO NOTHING;

-- Clear out existing data to make this script idempotent
DELETE FROM public.orders;

-- Insert mock data into the orders table
insert into public.orders (
  id, user_id, symbol, asset_class, order_type, direction, quantity, price, status, stop_loss_price, take_profit_price, created_at,
  margin_required, position_value, requested_price, units
)
values
  -- A limit buy order for BTC
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'BTC/USDT', 'CRYPTO', 'limit', 'buy', 0.5, 60000.00, 'pending', 58000.00, 65000.00, now(), 1000.00, 30000.00, 60000.00, 0.5),
  -- A market sell order for ETH
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ETH/USDT', 'CRYPTO', 'market', 'sell', 10.0, null, 'filled', null, null, now() - interval '1 day', 2000.00, 20000.00, 2000.00, 10.0),
  -- A cancelled stop-limit order
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'SOL/USDT', 'CRYPTO', 'stop_limit', 'buy', 100.0, 150.00, 'cancelled', 145.00, null, now() - interval '2 days', 500.00, 15000.00, 150.00, 100.0);

-- You can add more seed data for other tables here
