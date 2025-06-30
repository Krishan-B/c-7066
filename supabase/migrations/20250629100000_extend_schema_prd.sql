-- Migration: Extend schema to match PRD requirements

-- 1. Users Table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash varchar(255) not null,
  first_name varchar(100),
  last_name varchar(100),
  experience_level varchar(20) check (experience_level in ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  created_at timestamp default now(),
  last_login timestamp,
  is_verified boolean default false,
  kyc_status varchar(20) default 'PENDING' check (kyc_status in ('PENDING', 'APPROVED', 'REJECTED')),
  preferences jsonb
);

-- 2. KYC Documents Table
create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  document_type varchar(32),
  category varchar(32),
  file_url varchar(500) not null,
  file_name varchar(255),
  status varchar(20) default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  comments text,
  uploaded_at timestamp default now(),
  reviewed_at timestamp,
  reviewed_by uuid
);

-- 3. Accounts Table
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  account_type varchar(20) check (account_type in ('DEMO', 'COMPETITION')),
  balance decimal(15,2) default 0.00,
  equity decimal(15,2),
  margin_used decimal(15,2) default 0.00,
  created_at timestamp default now(),
  reset_count integer default 0,
  is_active boolean default true
);

-- 4. Assets Table
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  symbol varchar(20) unique not null,
  name varchar(255) not null,
  asset_class varchar(20) check (asset_class in ('FOREX', 'STOCKS', 'INDICES', 'COMMODITIES', 'CRYPTO')),
  base_currency varchar(3),
  quote_currency varchar(3),
  is_active boolean default true,
  leverage_max integer,
  spread_base decimal(8,5),
  contract_size decimal(15,2) default 1.00
);

-- 5. Orders Table (Extended)
create table if not exists public.orders_ext (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id),
  asset_id uuid references public.assets(id),
  order_type varchar(20) check (order_type in ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT')),
  side varchar(10) check (side in ('BUY', 'SELL')),
  quantity decimal(15,4) not null,
  price decimal(15,5),
  stop_price decimal(15,5),
  status varchar(20) default 'PENDING' check (status in ('PENDING', 'FILLED', 'CANCELLED', 'REJECTED')),
  filled_quantity decimal(15,4) default 0,
  avg_fill_price decimal(15,5),
  created_at timestamp default now(),
  filled_at timestamp,
  expires_at timestamp
);

-- 6. Positions Table (Extended)
create table if not exists public.positions_ext (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id),
  asset_id uuid references public.assets(id),
  side varchar(10) check (side in ('LONG', 'SHORT')),
  quantity decimal(15,4) not null,
  entry_price decimal(15,5) not null,
  current_price decimal(15,5),
  leverage integer,
  margin_required decimal(15,2),
  unrealized_pnl decimal(15,2),
  rollover_charges decimal(15,2) default 0.00,
  take_profit decimal(15,5),
  stop_loss decimal(15,5),
  opened_at timestamp default now(),
  updated_at timestamp default now()
);
