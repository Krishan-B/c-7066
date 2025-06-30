-- supabase/migrations/20250629093000_create_core_tables.sql

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create market_data table
create table if not exists public.market_data (
  id serial primary key,
  symbol text not null,
  price numeric(18,8) not null,
  timestamp timestamptz not null default now()
);

-- 3. Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  symbol text not null,
  asset_class text,
  order_type text,
  side text,
  quantity numeric(18,8),
  price numeric(18,8),
  status text,
  stop_loss_price numeric(18,8),
  take_profit_price numeric(18,8),
  created_at timestamptz default now(),
  margin_required numeric(18,8),
  position_value numeric(18,8),
  requested_price numeric(18,8),
  direction text
);

-- 4. Create positions table
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  symbol text not null,
  quantity numeric(18,8),
  entry_price numeric(18,8),
  leverage numeric(5,2),
  liquidation_price numeric(18,8),
  created_at timestamptz default now()
);

-- 5. RLS policies for user data protection
alter table public.profiles enable row level security;
create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Profiles can be inserted by owner" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles can be updated by owner" on public.profiles for update using (auth.uid() = id);

alter table public.orders enable row level security;
create policy "Orders are viewable by owner" on public.orders for select using (auth.uid() = user_id);
create policy "Orders can be inserted by owner" on public.orders for insert with check (auth.uid() = user_id);
create policy "Orders can be updated by owner" on public.orders for update using (auth.uid() = user_id);

alter table public.positions enable row level security;
create policy "Positions are viewable by owner" on public.positions for select using (auth.uid() = user_id);
create policy "Positions can be inserted by owner" on public.positions for insert with check (auth.uid() = user_id);
create policy "Positions can be updated by owner" on public.positions for update using (auth.uid() = user_id);

-- 6. Trigger for automatic profile creation on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
