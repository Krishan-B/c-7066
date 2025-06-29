drop trigger if exists "update_accounts_updated_at" on "public"."accounts";

drop trigger if exists "update_assets_updated_at" on "public"."assets";

drop policy "Users can insert their own accounts" on "public"."accounts";

drop policy "Users can update their own accounts" on "public"."accounts";

drop policy "Users can view their own accounts" on "public"."accounts";

drop policy "Anyone can view assets" on "public"."assets";

drop policy "Users can delete their own KYC documents" on "public"."kyc_documents";

drop policy "Users can insert orders for their accounts" on "public"."orders";

drop policy "Users can insert positions for their accounts" on "public"."positions";

drop policy "Users can update their own orders" on "public"."orders";

drop policy "Users can view their own orders" on "public"."orders";

drop policy "Users can update their own positions" on "public"."positions";

drop policy "Users can view their own positions" on "public"."positions";

alter table "public"."kyc_documents" drop constraint "kyc_documents_reviewed_by_fkey";

alter table "public"."positions" drop constraint "positions_side_check";

alter table "public"."accounts" drop constraint "accounts_user_id_fkey";

alter table "public"."orders" drop constraint "orders_account_id_fkey";

alter table "public"."orders" drop constraint "orders_asset_id_fkey";

alter table "public"."orders" drop constraint "orders_order_type_check";

alter table "public"."orders" drop constraint "orders_side_check";

alter table "public"."orders" drop constraint "orders_status_check";

alter table "public"."positions" drop constraint "positions_account_id_fkey";

alter table "public"."positions" drop constraint "positions_asset_id_fkey";

alter table "public"."positions" drop constraint "positions_status_check";

drop index if exists "public"."idx_accounts_user_id";

drop index if exists "public"."idx_assets_asset_class";

drop index if exists "public"."idx_assets_symbol";

drop index if exists "public"."idx_kyc_documents_category";

drop index if exists "public"."idx_kyc_documents_status";

drop index if exists "public"."idx_kyc_documents_user_id";

drop index if exists "public"."idx_orders_account_id";

drop index if exists "public"."idx_positions_account_id";

create table "public"."asset_leverage_config" (
    "id" uuid not null default gen_random_uuid(),
    "asset_class" text not null,
    "symbol" text,
    "max_leverage" integer not null,
    "min_margin_requirement" numeric not null,
    "maintenance_margin" numeric not null,
    "margin_call_level" numeric not null default 1.0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."asset_leverage_config" enable row level security;

create table "public"."historical_market_data" (
    "id" uuid not null default gen_random_uuid(),
    "symbol" text not null,
    "market_type" text not null,
    "timestamp" timestamp with time zone not null,
    "open_price" numeric not null,
    "high_price" numeric not null,
    "low_price" numeric not null,
    "close_price" numeric not null,
    "volume" numeric
);


alter table "public"."historical_market_data" enable row level security;

create table "public"."kyc_audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "previous_status" text,
    "new_status" text not null,
    "comments" text,
    "reviewed_by" text,
    "reviewed_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."kyc_audit_log" enable row level security;

create table "public"."margin_calculations" (
    "id" uuid not null default gen_random_uuid(),
    "position_id" uuid,
    "user_id" uuid not null,
    "initial_margin" numeric not null,
    "maintenance_margin" numeric not null,
    "used_margin" numeric not null,
    "free_margin" numeric not null,
    "margin_level" numeric not null,
    "leverage_used" numeric not null,
    "calculated_at" timestamp with time zone not null default now()
);


alter table "public"."margin_calculations" enable row level security;

create table "public"."market_data" (
    "id" uuid not null default gen_random_uuid(),
    "symbol" text not null,
    "name" text not null,
    "price" numeric not null,
    "change_percentage" numeric not null,
    "volume" text not null,
    "market_cap" text,
    "market_type" text not null,
    "last_updated" timestamp with time zone default now(),
    "last_price" numeric,
    "high_price" numeric,
    "low_price" numeric,
    "open_price" numeric,
    "previous_close" numeric,
    "timestamp" timestamp with time zone default now()
);


alter table "public"."market_data" enable row level security;

create table "public"."order_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "order_id" uuid not null,
    "action" text not null,
    "details" jsonb,
    "timestamp" timestamp with time zone not null default now()
);


alter table "public"."order_history" enable row level security;

create table "public"."position_history" (
    "id" uuid not null default gen_random_uuid(),
    "position_id" uuid not null,
    "user_id" uuid not null,
    "action" text not null,
    "price" numeric(18,8) not null,
    "units" numeric(18,8),
    "pnl" numeric(18,2),
    "margin_impact" numeric(18,2),
    "timestamp" timestamp with time zone not null default now(),
    "notes" text
);


alter table "public"."position_history" enable row level security;

create table "public"."position_updates" (
    "id" uuid not null default gen_random_uuid(),
    "position_id" uuid,
    "user_id" uuid not null,
    "price_update" numeric not null,
    "pnl_change" numeric not null,
    "unrealized_pnl" numeric not null,
    "timestamp" timestamp with time zone not null default now(),
    "market_session" text default 'regular'::text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."position_updates" enable row level security;

create table "public"."price_alerts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "asset_symbol" text not null,
    "asset_name" text not null,
    "market_type" text not null,
    "target_price" numeric not null,
    "condition" text not null,
    "is_triggered" boolean default false,
    "created_at" timestamp with time zone default now(),
    "triggered_at" timestamp with time zone
);


alter table "public"."price_alerts" enable row level security;

create table "public"."risk_metrics" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "total_exposure" numeric(18,2) default 0,
    "used_margin" numeric(18,2) default 0,
    "available_margin" numeric(18,2) default 0,
    "margin_level" numeric(8,4) default 0,
    "portfolio_var" numeric(18,2) default 0,
    "max_position_size" numeric(18,2) default 0,
    "correlation_risk" numeric(5,2) default 0,
    "diversification_score" numeric(5,2) default 0,
    "risk_score" numeric(5,2) default 0,
    "last_calculated" timestamp with time zone not null default now()
);


alter table "public"."risk_metrics" enable row level security;

create table "public"."trade_analytics" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "period_start" date not null,
    "period_end" date not null,
    "total_trades" integer default 0,
    "winning_trades" integer default 0,
    "losing_trades" integer default 0,
    "total_pnl" numeric(18,2) default 0,
    "total_fees" numeric(18,2) default 0,
    "net_pnl" numeric(18,2) default 0,
    "win_rate" numeric(5,2) default 0,
    "avg_win" numeric(18,2) default 0,
    "avg_loss" numeric(18,2) default 0,
    "profit_factor" numeric(8,4) default 0,
    "max_drawdown" numeric(18,2) default 0,
    "sharpe_ratio" numeric(8,4) default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."trade_analytics" enable row level security;

create table "public"."trading_orders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "symbol" text not null,
    "asset_class" text not null,
    "order_type" text not null,
    "direction" text not null,
    "units" numeric not null,
    "requested_price" numeric not null,
    "execution_price" numeric,
    "position_value" numeric not null,
    "margin_required" numeric not null,
    "leverage_ratio" numeric not null default 1.0,
    "stop_loss_price" numeric,
    "take_profit_price" numeric,
    "expiration_date" timestamp with time zone,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone not null default now(),
    "executed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "rejected_reason" text,
    "fees" numeric default 0,
    "slippage" numeric default 0
);


alter table "public"."trading_orders" enable row level security;

create table "public"."trading_positions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "order_id" uuid,
    "symbol" text not null,
    "asset_class" text not null,
    "direction" text not null,
    "units" numeric not null,
    "entry_price" numeric not null,
    "current_price" numeric not null,
    "position_value" numeric not null,
    "margin_used" numeric not null,
    "leverage_ratio" numeric not null default 1.0,
    "unrealized_pnl" numeric default 0,
    "daily_pnl" numeric default 0,
    "total_fees" numeric default 0,
    "stop_loss_price" numeric,
    "take_profit_price" numeric,
    "opened_at" timestamp with time zone not null default now(),
    "last_updated" timestamp with time zone not null default now(),
    "status" text not null default 'open'::text
);


alter table "public"."trading_positions" enable row level security;

create table "public"."user_account" (
    "id" uuid not null,
    "cash_balance" numeric not null default 10000.00,
    "equity" numeric not null default 10000.00,
    "used_margin" numeric not null default 0.00,
    "available_funds" numeric not null default 10000.00,
    "realized_pnl" numeric not null default 0.00,
    "unrealized_pnl" numeric not null default 0.00,
    "last_updated" timestamp with time zone default now()
);


alter table "public"."user_account" enable row level security;

create table "public"."user_portfolio" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "asset_symbol" text not null,
    "asset_name" text not null,
    "market_type" text not null,
    "units" numeric not null,
    "average_price" numeric not null,
    "current_price" numeric not null,
    "total_value" numeric not null,
    "pnl" numeric not null,
    "pnl_percentage" numeric not null,
    "last_updated" timestamp with time zone default now()
);


alter table "public"."user_portfolio" enable row level security;

create table "public"."user_trades" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "asset_symbol" text not null,
    "asset_name" text not null,
    "market_type" text not null,
    "trade_type" text not null,
    "order_type" text not null,
    "units" numeric not null,
    "price_per_unit" numeric not null,
    "total_amount" numeric not null,
    "status" text not null,
    "stop_loss" numeric,
    "take_profit" numeric,
    "expiration_date" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "executed_at" timestamp with time zone,
    "closed_at" timestamp with time zone,
    "pnl" numeric
);


alter table "public"."user_trades" enable row level security;

create table "public"."user_watchlist" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "asset_symbol" text not null,
    "asset_name" text not null,
    "market_type" text not null,
    "added_at" timestamp with time zone default now()
);


alter table "public"."user_watchlist" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "email" character varying(255) not null,
    "password_hash" character varying(255),
    "first_name" character varying(100),
    "last_name" character varying(100),
    "experience_level" text,
    "created_at" timestamp with time zone default now(),
    "last_login" timestamp with time zone,
    "is_verified" boolean default false,
    "kyc_status" text default 'PENDING'::text,
    "preferences" jsonb
);


alter table "public"."users" enable row level security;

alter table "public"."accounts" drop column "margin_free";

alter table "public"."accounts" drop column "margin_level";

alter table "public"."accounts" drop column "updated_at";

alter table "public"."accounts" alter column "equity" drop default;

alter table "public"."assets" drop column "created_at";

alter table "public"."assets" drop column "pip_value";

alter table "public"."assets" drop column "updated_at";

alter table "public"."assets" add column "user_id" uuid not null;

alter table "public"."assets" alter column "base_currency" set data type character varying(3) using "base_currency"::character varying(3);

alter table "public"."assets" alter column "leverage_max" drop default;

alter table "public"."assets" alter column "name" set data type character varying(255) using "name"::character varying(255);

alter table "public"."assets" alter column "quote_currency" set data type character varying(3) using "quote_currency"::character varying(3);

alter table "public"."assets" alter column "spread_base" drop default;

alter table "public"."assets" alter column "symbol" set data type character varying(20) using "symbol"::character varying(20);

alter table "public"."assets" enable row level security;

alter table "public"."kyc_documents" add column "plexop_review_id" text;

alter table "public"."kyc_documents" alter column "status" set not null;

alter table "public"."orders" drop column "filled_at";

alter table "public"."orders" drop column "updated_at";

alter table "public"."orders" add column "asset_class" text not null;

alter table "public"."orders" add column "cancelled_at" timestamp with time zone;

alter table "public"."orders" add column "direction" text not null;

alter table "public"."orders" add column "executed_at" timestamp with time zone;

alter table "public"."orders" add column "execution_price" numeric(18,8);

alter table "public"."orders" add column "expiration_date" timestamp with time zone;

alter table "public"."orders" add column "leverage" integer default 1;

alter table "public"."orders" add column "margin_required" numeric(18,2) not null;

alter table "public"."orders" add column "margin_used" numeric(18,8);

alter table "public"."orders" add column "order_category" text default 'primary'::text;

alter table "public"."orders" add column "order_group_id" uuid;

alter table "public"."orders" add column "parent_order_id" uuid;

alter table "public"."orders" add column "position_value" numeric(18,2) not null;

alter table "public"."orders" add column "rejected_reason" text;

alter table "public"."orders" add column "requested_price" numeric(18,8) not null;

alter table "public"."orders" add column "stop_loss" numeric(18,8);

alter table "public"."orders" add column "symbol" text not null;

alter table "public"."orders" add column "take_profit" numeric(18,8);

alter table "public"."orders" add column "trailing_stop_distance" numeric;

alter table "public"."orders" add column "user_id" uuid not null;

alter table "public"."orders" alter column "account_id" drop not null;

alter table "public"."orders" alter column "asset_id" drop not null;

alter table "public"."orders" alter column "avg_fill_price" set data type numeric using "avg_fill_price"::numeric;

alter table "public"."orders" alter column "created_at" set not null;

alter table "public"."orders" alter column "filled_quantity" set data type numeric using "filled_quantity"::numeric;

alter table "public"."orders" alter column "price" set data type numeric using "price"::numeric;

alter table "public"."orders" alter column "quantity" set default 0;

alter table "public"."orders" alter column "quantity" set data type numeric using "quantity"::numeric;

alter table "public"."orders" alter column "status" set default 'pending'::text;

alter table "public"."orders" alter column "status" set not null;

alter table "public"."orders" alter column "stop_loss_price" set data type numeric using "stop_loss_price"::numeric;

alter table "public"."orders" alter column "stop_price" set data type numeric using "stop_price"::numeric;

alter table "public"."orders" alter column "take_profit_price" set data type numeric using "take_profit_price"::numeric;

alter table "public"."positions" drop column "created_at";

alter table "public"."positions" drop column "pnl";

alter table "public"."positions" drop column "side";

alter table "public"."positions" drop column "size";

alter table "public"."positions" drop column "updated_at";

alter table "public"."positions" add column "asset_class" text not null;

alter table "public"."positions" add column "close_price" numeric(18,8);

alter table "public"."positions" add column "daily_pnl" numeric default 0;

alter table "public"."positions" add column "direction" text not null;

alter table "public"."positions" add column "last_updated" timestamp with time zone not null default now();

alter table "public"."positions" add column "margin_used" numeric(18,2) not null;

alter table "public"."positions" add column "opened_at" timestamp with time zone not null default now();

alter table "public"."positions" add column "order_id" uuid;

alter table "public"."positions" add column "pip_difference" numeric default 0;

alter table "public"."positions" add column "pip_value" numeric default 0;

alter table "public"."positions" add column "position_value" numeric(18,2) not null;

alter table "public"."positions" add column "realized_pnl" numeric(18,2);

alter table "public"."positions" add column "session_pnl" numeric default 0;

alter table "public"."positions" add column "stop_loss" numeric(18,8);

alter table "public"."positions" add column "swap_charges" numeric default 0;

alter table "public"."positions" add column "take_profit" numeric(18,8);

alter table "public"."positions" add column "total_fees" numeric default 0;

alter table "public"."positions" add column "units" numeric(18,8) not null;

alter table "public"."positions" add column "unrealized_pnl" numeric(18,2) default 0;

alter table "public"."positions" alter column "current_price" set not null;

alter table "public"."positions" alter column "current_price" set data type numeric(18,8) using "current_price"::numeric(18,8);

alter table "public"."positions" alter column "entry_price" set data type numeric(18,8) using "entry_price"::numeric(18,8);

alter table "public"."positions" alter column "leverage_ratio" set default 1.0;

alter table "public"."positions" alter column "leverage_ratio" set data type numeric using "leverage_ratio"::numeric;

alter table "public"."positions" alter column "status" set default 'open'::text;

alter table "public"."profiles" drop column "full_name";

alter table "public"."profiles" add column "kyc_status" text default 'NOT_SUBMITTED'::text;

alter table "public"."profiles" add column "plexop_user_id" text;

alter table "public"."profiles" alter column "created_at" set not null;

alter table "public"."profiles" alter column "updated_at" set not null;

CREATE UNIQUE INDEX account_metrics_user_id_key ON public.account_metrics USING btree (user_id);

CREATE UNIQUE INDEX asset_leverage_config_asset_class_symbol_key ON public.asset_leverage_config USING btree (asset_class, symbol);

CREATE UNIQUE INDEX asset_leverage_config_pkey ON public.asset_leverage_config USING btree (id);

CREATE UNIQUE INDEX historical_market_data_pkey ON public.historical_market_data USING btree (id);

CREATE UNIQUE INDEX historical_market_data_symbol_market_type_timestamp_key ON public.historical_market_data USING btree (symbol, market_type, "timestamp");

CREATE INDEX idx_asset_leverage_config_asset_class ON public.asset_leverage_config USING btree (asset_class);

CREATE INDEX idx_asset_leverage_config_symbol ON public.asset_leverage_config USING btree (symbol);

CREATE INDEX idx_assets_user_id ON public.assets USING btree (user_id);

CREATE INDEX idx_kyc_audit_log_document_id ON public.kyc_audit_log USING btree (document_id);

CREATE INDEX idx_kyc_documents_plexop_review_id ON public.kyc_documents USING btree (plexop_review_id);

CREATE INDEX idx_margin_calculations_position_id ON public.margin_calculations USING btree (position_id);

CREATE INDEX idx_margin_calculations_user_id ON public.margin_calculations USING btree (user_id);

CREATE INDEX idx_market_data_last_updated ON public.market_data USING btree (last_updated);

CREATE INDEX idx_market_data_market_type ON public.market_data USING btree (market_type);

CREATE INDEX idx_market_data_symbol ON public.market_data USING btree (symbol);

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);

CREATE INDEX idx_orders_group_id ON public.orders USING btree (order_group_id);

CREATE INDEX idx_orders_parent_order_id ON public.orders USING btree (parent_order_id);

CREATE INDEX idx_orders_symbol ON public.orders USING btree (symbol);

CREATE INDEX idx_orders_symbol_created ON public.orders USING btree (symbol, created_at DESC);

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);

CREATE INDEX idx_orders_user_id_status ON public.orders USING btree (user_id, status);

CREATE INDEX idx_position_history_position_id ON public.position_history USING btree (position_id);

CREATE INDEX idx_position_updates_position_id ON public.position_updates USING btree (position_id);

CREATE INDEX idx_position_updates_timestamp ON public.position_updates USING btree ("timestamp" DESC);

CREATE INDEX idx_positions_last_updated ON public.positions USING btree (last_updated DESC);

CREATE INDEX idx_positions_user_id_status ON public.positions USING btree (user_id, status);

CREATE INDEX idx_profiles_plexop_user_id ON public.profiles USING btree (plexop_user_id);

CREATE INDEX idx_risk_metrics_user_calculated ON public.risk_metrics USING btree (user_id, last_calculated DESC);

CREATE INDEX idx_trade_analytics_user_period ON public.trade_analytics USING btree (user_id, period_start, period_end);

CREATE INDEX idx_trading_orders_symbol ON public.trading_orders USING btree (symbol);

CREATE INDEX idx_trading_orders_user_status ON public.trading_orders USING btree (user_id, status);

CREATE INDEX idx_trading_positions_symbol ON public.trading_positions USING btree (symbol);

CREATE INDEX idx_trading_positions_user_status ON public.trading_positions USING btree (user_id, status);

CREATE UNIQUE INDEX kyc_audit_log_pkey ON public.kyc_audit_log USING btree (id);

CREATE UNIQUE INDEX margin_calculations_pkey ON public.margin_calculations USING btree (id);

CREATE INDEX market_data_market_type_idx ON public.market_data USING btree (market_type);

CREATE UNIQUE INDEX market_data_pkey ON public.market_data USING btree (id);

CREATE UNIQUE INDEX market_data_symbol_key ON public.market_data USING btree (symbol);

CREATE UNIQUE INDEX order_history_pkey ON public.order_history USING btree (id);

CREATE UNIQUE INDEX position_history_pkey ON public.position_history USING btree (id);

CREATE UNIQUE INDEX position_updates_pkey ON public.position_updates USING btree (id);

CREATE UNIQUE INDEX price_alerts_pkey ON public.price_alerts USING btree (id);

CREATE UNIQUE INDEX risk_metrics_pkey ON public.risk_metrics USING btree (id);

CREATE UNIQUE INDEX trade_analytics_pkey ON public.trade_analytics USING btree (id);

CREATE UNIQUE INDEX trading_orders_pkey ON public.trading_orders USING btree (id);

CREATE UNIQUE INDEX trading_positions_pkey ON public.trading_positions USING btree (id);

CREATE UNIQUE INDEX user_account_pkey ON public.user_account USING btree (id);

CREATE UNIQUE INDEX user_portfolio_pkey ON public.user_portfolio USING btree (id);

CREATE UNIQUE INDEX user_portfolio_user_id_asset_symbol_market_type_key ON public.user_portfolio USING btree (user_id, asset_symbol, market_type);

CREATE UNIQUE INDEX user_trades_pkey ON public.user_trades USING btree (id);

CREATE INDEX user_trades_user_id_idx ON public.user_trades USING btree (user_id);

CREATE UNIQUE INDEX user_watchlist_pkey ON public.user_watchlist USING btree (id);

CREATE UNIQUE INDEX user_watchlist_user_id_asset_symbol_market_type_key ON public.user_watchlist USING btree (user_id, asset_symbol, market_type);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."asset_leverage_config" add constraint "asset_leverage_config_pkey" PRIMARY KEY using index "asset_leverage_config_pkey";

alter table "public"."historical_market_data" add constraint "historical_market_data_pkey" PRIMARY KEY using index "historical_market_data_pkey";

alter table "public"."kyc_audit_log" add constraint "kyc_audit_log_pkey" PRIMARY KEY using index "kyc_audit_log_pkey";

alter table "public"."margin_calculations" add constraint "margin_calculations_pkey" PRIMARY KEY using index "margin_calculations_pkey";

alter table "public"."market_data" add constraint "market_data_pkey" PRIMARY KEY using index "market_data_pkey";

alter table "public"."order_history" add constraint "order_history_pkey" PRIMARY KEY using index "order_history_pkey";

alter table "public"."position_history" add constraint "position_history_pkey" PRIMARY KEY using index "position_history_pkey";

alter table "public"."position_updates" add constraint "position_updates_pkey" PRIMARY KEY using index "position_updates_pkey";

alter table "public"."price_alerts" add constraint "price_alerts_pkey" PRIMARY KEY using index "price_alerts_pkey";

alter table "public"."risk_metrics" add constraint "risk_metrics_pkey" PRIMARY KEY using index "risk_metrics_pkey";

alter table "public"."trade_analytics" add constraint "trade_analytics_pkey" PRIMARY KEY using index "trade_analytics_pkey";

alter table "public"."trading_orders" add constraint "trading_orders_pkey" PRIMARY KEY using index "trading_orders_pkey";

alter table "public"."trading_positions" add constraint "trading_positions_pkey" PRIMARY KEY using index "trading_positions_pkey";

alter table "public"."user_account" add constraint "user_account_pkey" PRIMARY KEY using index "user_account_pkey";

alter table "public"."user_portfolio" add constraint "user_portfolio_pkey" PRIMARY KEY using index "user_portfolio_pkey";

alter table "public"."user_trades" add constraint "user_trades_pkey" PRIMARY KEY using index "user_trades_pkey";

alter table "public"."user_watchlist" add constraint "user_watchlist_pkey" PRIMARY KEY using index "user_watchlist_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."account_metrics" add constraint "account_metrics_user_id_key" UNIQUE using index "account_metrics_user_id_key";

alter table "public"."asset_leverage_config" add constraint "asset_leverage_config_asset_class_symbol_key" UNIQUE using index "asset_leverage_config_asset_class_symbol_key";

alter table "public"."assets" add constraint "assets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."assets" validate constraint "assets_user_id_fkey";

alter table "public"."historical_market_data" add constraint "historical_market_data_symbol_market_type_timestamp_key" UNIQUE using index "historical_market_data_symbol_market_type_timestamp_key";

alter table "public"."kyc_audit_log" add constraint "kyc_audit_log_document_id_fkey" FOREIGN KEY (document_id) REFERENCES kyc_documents(id) ON DELETE CASCADE not valid;

alter table "public"."kyc_audit_log" validate constraint "kyc_audit_log_document_id_fkey";

alter table "public"."kyc_documents" add constraint "kyc_documents_category_check" CHECK ((category = ANY (ARRAY['ID_VERIFICATION'::text, 'ADDRESS_VERIFICATION'::text, 'OTHER_DOCUMENTATION'::text]))) not valid;

alter table "public"."kyc_documents" validate constraint "kyc_documents_category_check";

alter table "public"."kyc_documents" add constraint "kyc_documents_document_type_check" CHECK ((document_type = ANY (ARRAY['ID_PASSPORT'::text, 'ID_FRONT'::text, 'ID_BACK'::text, 'DRIVERS_LICENSE'::text, 'UTILITY_BILL'::text, 'BANK_STATEMENT'::text, 'CREDIT_CARD_STATEMENT'::text, 'TAX_BILL'::text, 'OTHER_ID'::text, 'OTHER_ADDRESS'::text, 'OTHER_DOC'::text]))) not valid;

alter table "public"."kyc_documents" validate constraint "kyc_documents_document_type_check";

alter table "public"."margin_calculations" add constraint "margin_calculations_position_id_fkey" FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE not valid;

alter table "public"."margin_calculations" validate constraint "margin_calculations_position_id_fkey";

alter table "public"."market_data" add constraint "market_data_symbol_key" UNIQUE using index "market_data_symbol_key";

alter table "public"."orders" add constraint "orders_asset_class_check" CHECK ((asset_class = ANY (ARRAY['FOREX'::text, 'STOCKS'::text, 'CRYPTO'::text, 'INDICES'::text, 'COMMODITIES'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_asset_class_check";

alter table "public"."orders" add constraint "orders_direction_check" CHECK ((direction = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_direction_check";

alter table "public"."orders" add constraint "orders_order_category_check" CHECK ((order_category = ANY (ARRAY['primary'::text, 'stop_loss'::text, 'take_profit'::text, 'trailing_stop'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_order_category_check";

alter table "public"."orders" add constraint "orders_parent_order_id_fkey" FOREIGN KEY (parent_order_id) REFERENCES orders(id) not valid;

alter table "public"."orders" validate constraint "orders_parent_order_id_fkey";

alter table "public"."orders" add constraint "orders_requested_price_check" CHECK ((requested_price > (0)::numeric)) not valid;

alter table "public"."orders" validate constraint "orders_requested_price_check";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."position_history" add constraint "position_history_action_check" CHECK ((action = ANY (ARRAY['opened'::text, 'modified'::text, 'closed'::text, 'stop_loss_triggered'::text, 'take_profit_triggered'::text]))) not valid;

alter table "public"."position_history" validate constraint "position_history_action_check";

alter table "public"."position_history" add constraint "position_history_position_id_fkey" FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE not valid;

alter table "public"."position_history" validate constraint "position_history_position_id_fkey";

alter table "public"."position_history" add constraint "position_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."position_history" validate constraint "position_history_user_id_fkey";

alter table "public"."position_updates" add constraint "position_updates_position_id_fkey" FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE not valid;

alter table "public"."position_updates" validate constraint "position_updates_position_id_fkey";

alter table "public"."positions" add constraint "positions_asset_class_check" CHECK ((asset_class = ANY (ARRAY['FOREX'::text, 'STOCKS'::text, 'CRYPTO'::text, 'INDICES'::text, 'COMMODITIES'::text]))) not valid;

alter table "public"."positions" validate constraint "positions_asset_class_check";

alter table "public"."positions" add constraint "positions_current_price_check" CHECK ((current_price > (0)::numeric)) not valid;

alter table "public"."positions" validate constraint "positions_current_price_check";

alter table "public"."positions" add constraint "positions_direction_check" CHECK ((direction = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."positions" validate constraint "positions_direction_check";

alter table "public"."positions" add constraint "positions_entry_price_check" CHECK ((entry_price > (0)::numeric)) not valid;

alter table "public"."positions" validate constraint "positions_entry_price_check";

alter table "public"."positions" add constraint "positions_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) not valid;

alter table "public"."positions" validate constraint "positions_order_id_fkey";

alter table "public"."positions" add constraint "positions_units_check" CHECK ((units > (0)::numeric)) not valid;

alter table "public"."positions" validate constraint "positions_units_check";

alter table "public"."price_alerts" add constraint "price_alerts_condition_check" CHECK ((condition = ANY (ARRAY['above'::text, 'below'::text]))) not valid;

alter table "public"."price_alerts" validate constraint "price_alerts_condition_check";

alter table "public"."price_alerts" add constraint "price_alerts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."price_alerts" validate constraint "price_alerts_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_kyc_status_check" CHECK ((kyc_status = ANY (ARRAY['APPROVED'::text, 'PENDING'::text, 'REJECTED'::text, 'NOT_SUBMITTED'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_kyc_status_check";

alter table "public"."risk_metrics" add constraint "risk_metrics_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."risk_metrics" validate constraint "risk_metrics_user_id_fkey";

alter table "public"."trade_analytics" add constraint "trade_analytics_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."trade_analytics" validate constraint "trade_analytics_user_id_fkey";

alter table "public"."trading_orders" add constraint "trading_orders_direction_check" CHECK ((direction = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."trading_orders" validate constraint "trading_orders_direction_check";

alter table "public"."trading_orders" add constraint "trading_orders_order_type_check" CHECK ((order_type = ANY (ARRAY['market'::text, 'entry'::text, 'stop_loss'::text, 'take_profit'::text]))) not valid;

alter table "public"."trading_orders" validate constraint "trading_orders_order_type_check";

alter table "public"."trading_orders" add constraint "trading_orders_requested_price_check" CHECK ((requested_price > (0)::numeric)) not valid;

alter table "public"."trading_orders" validate constraint "trading_orders_requested_price_check";

alter table "public"."trading_orders" add constraint "trading_orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'executed'::text, 'cancelled'::text, 'expired'::text, 'filled'::text]))) not valid;

alter table "public"."trading_orders" validate constraint "trading_orders_status_check";

alter table "public"."trading_orders" add constraint "trading_orders_units_check" CHECK ((units > (0)::numeric)) not valid;

alter table "public"."trading_orders" validate constraint "trading_orders_units_check";

alter table "public"."trading_positions" add constraint "trading_positions_current_price_check" CHECK ((current_price > (0)::numeric)) not valid;

alter table "public"."trading_positions" validate constraint "trading_positions_current_price_check";

alter table "public"."trading_positions" add constraint "trading_positions_direction_check" CHECK ((direction = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."trading_positions" validate constraint "trading_positions_direction_check";

alter table "public"."trading_positions" add constraint "trading_positions_entry_price_check" CHECK ((entry_price > (0)::numeric)) not valid;

alter table "public"."trading_positions" validate constraint "trading_positions_entry_price_check";

alter table "public"."trading_positions" add constraint "trading_positions_order_id_fkey" FOREIGN KEY (order_id) REFERENCES trading_orders(id) not valid;

alter table "public"."trading_positions" validate constraint "trading_positions_order_id_fkey";

alter table "public"."trading_positions" add constraint "trading_positions_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text]))) not valid;

alter table "public"."trading_positions" validate constraint "trading_positions_status_check";

alter table "public"."trading_positions" add constraint "trading_positions_units_check" CHECK ((units > (0)::numeric)) not valid;

alter table "public"."trading_positions" validate constraint "trading_positions_units_check";

alter table "public"."user_account" add constraint "user_account_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_account" validate constraint "user_account_id_fkey";

alter table "public"."user_portfolio" add constraint "user_portfolio_user_id_asset_symbol_market_type_key" UNIQUE using index "user_portfolio_user_id_asset_symbol_market_type_key";

alter table "public"."user_portfolio" add constraint "user_portfolio_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_portfolio" validate constraint "user_portfolio_user_id_fkey";

alter table "public"."user_trades" add constraint "user_trades_order_type_check" CHECK ((order_type = ANY (ARRAY['market'::text, 'entry'::text]))) not valid;

alter table "public"."user_trades" validate constraint "user_trades_order_type_check";

alter table "public"."user_trades" add constraint "user_trades_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'canceled'::text, 'active'::text]))) not valid;

alter table "public"."user_trades" validate constraint "user_trades_status_check";

alter table "public"."user_trades" add constraint "user_trades_trade_type_check" CHECK ((trade_type = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."user_trades" validate constraint "user_trades_trade_type_check";

alter table "public"."user_trades" add constraint "user_trades_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_trades" validate constraint "user_trades_user_id_fkey";

alter table "public"."user_watchlist" add constraint "user_watchlist_user_id_asset_symbol_market_type_key" UNIQUE using index "user_watchlist_user_id_asset_symbol_market_type_key";

alter table "public"."user_watchlist" add constraint "user_watchlist_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_watchlist" validate constraint "user_watchlist_user_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_experience_level_check" CHECK ((experience_level = ANY (ARRAY['BEGINNER'::text, 'INTERMEDIATE'::text, 'ADVANCED'::text]))) not valid;

alter table "public"."users" validate constraint "users_experience_level_check";

alter table "public"."users" add constraint "users_kyc_status_check" CHECK ((kyc_status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text]))) not valid;

alter table "public"."users" validate constraint "users_kyc_status_check";

alter table "public"."accounts" add constraint "accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."accounts" validate constraint "accounts_user_id_fkey";

alter table "public"."orders" add constraint "orders_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) not valid;

alter table "public"."orders" validate constraint "orders_account_id_fkey";

alter table "public"."orders" add constraint "orders_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES assets(id) not valid;

alter table "public"."orders" validate constraint "orders_asset_id_fkey";

alter table "public"."orders" add constraint "orders_order_type_check" CHECK ((order_type = ANY (ARRAY['market'::text, 'limit'::text, 'stop'::text, 'stop_limit'::text, 'stop_loss'::text, 'take_profit'::text, 'trailing_stop'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_order_type_check";

alter table "public"."orders" add constraint "orders_side_check" CHECK ((side = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_side_check";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'filled'::text, 'cancelled'::text, 'rejected'::text, 'expired'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

alter table "public"."positions" add constraint "positions_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) not valid;

alter table "public"."positions" validate constraint "positions_account_id_fkey";

alter table "public"."positions" add constraint "positions_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES assets(id) not valid;

alter table "public"."positions" validate constraint "positions_asset_id_fkey";

alter table "public"."positions" add constraint "positions_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text, 'partial'::text]))) not valid;

alter table "public"."positions" validate constraint "positions_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_position_pnl(p_direction text, p_entry_price numeric, p_current_price numeric, p_units numeric)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF p_direction = 'buy' THEN
        RETURN (p_current_price - p_entry_price) * p_units;
    ELSE
        RETURN (p_entry_price - p_current_price) * p_units;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_position_pnl_realtime(p_direction text, p_entry_price numeric, p_current_price numeric, p_units numeric)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF p_direction = 'buy' THEN
    RETURN (p_current_price - p_entry_price) * p_units;
  ELSE
    RETURN (p_entry_price - p_current_price) * p_units;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_account()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.user_account (id, cash_balance, equity, used_margin, available_funds)
  VALUES (NEW.id, 10000.00, 10000.00, 0.00, 10000.00);
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.execute_market_order(p_order_id uuid, p_execution_price numeric)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_parent_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- If parent order is filled or cancelled, cancel all child orders
  IF NEW.status IN ('filled', 'cancelled') AND OLD.status != NEW.status THEN
    UPDATE public.orders 
    SET status = 'cancelled', 
        cancelled_at = NOW()
    WHERE parent_order_id = NEW.id 
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_kyc_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status IN ('APPROVED', 'REJECTED') AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Call the deployed Edge Function for KYC status notifications
    PERFORM net.http_post(
      'https://hntsrkacolpseqnyidis.functions.supabase.co/kyc-status-notification',
      json_build_object(
        'user_id', NEW.user_id,
        'document_id', NEW.id,
        'new_status', NEW.status,
        'comments', NEW.comments
      )::text,
      'application/json'
    );
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_account_metrics(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_market_data_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_orders_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_position_pnl()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.unrealized_pnl = calculate_position_pnl(
        NEW.direction,
        NEW.entry_price,
        NEW.current_price,
        NEW.units
    );
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_positions_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."asset_leverage_config" to "anon";

grant insert on table "public"."asset_leverage_config" to "anon";

grant references on table "public"."asset_leverage_config" to "anon";

grant select on table "public"."asset_leverage_config" to "anon";

grant trigger on table "public"."asset_leverage_config" to "anon";

grant truncate on table "public"."asset_leverage_config" to "anon";

grant update on table "public"."asset_leverage_config" to "anon";

grant delete on table "public"."asset_leverage_config" to "authenticated";

grant insert on table "public"."asset_leverage_config" to "authenticated";

grant references on table "public"."asset_leverage_config" to "authenticated";

grant select on table "public"."asset_leverage_config" to "authenticated";

grant trigger on table "public"."asset_leverage_config" to "authenticated";

grant truncate on table "public"."asset_leverage_config" to "authenticated";

grant update on table "public"."asset_leverage_config" to "authenticated";

grant delete on table "public"."asset_leverage_config" to "service_role";

grant insert on table "public"."asset_leverage_config" to "service_role";

grant references on table "public"."asset_leverage_config" to "service_role";

grant select on table "public"."asset_leverage_config" to "service_role";

grant trigger on table "public"."asset_leverage_config" to "service_role";

grant truncate on table "public"."asset_leverage_config" to "service_role";

grant update on table "public"."asset_leverage_config" to "service_role";

grant delete on table "public"."historical_market_data" to "anon";

grant insert on table "public"."historical_market_data" to "anon";

grant references on table "public"."historical_market_data" to "anon";

grant select on table "public"."historical_market_data" to "anon";

grant trigger on table "public"."historical_market_data" to "anon";

grant truncate on table "public"."historical_market_data" to "anon";

grant update on table "public"."historical_market_data" to "anon";

grant delete on table "public"."historical_market_data" to "authenticated";

grant insert on table "public"."historical_market_data" to "authenticated";

grant references on table "public"."historical_market_data" to "authenticated";

grant select on table "public"."historical_market_data" to "authenticated";

grant trigger on table "public"."historical_market_data" to "authenticated";

grant truncate on table "public"."historical_market_data" to "authenticated";

grant update on table "public"."historical_market_data" to "authenticated";

grant delete on table "public"."historical_market_data" to "service_role";

grant insert on table "public"."historical_market_data" to "service_role";

grant references on table "public"."historical_market_data" to "service_role";

grant select on table "public"."historical_market_data" to "service_role";

grant trigger on table "public"."historical_market_data" to "service_role";

grant truncate on table "public"."historical_market_data" to "service_role";

grant update on table "public"."historical_market_data" to "service_role";

grant delete on table "public"."kyc_audit_log" to "anon";

grant insert on table "public"."kyc_audit_log" to "anon";

grant references on table "public"."kyc_audit_log" to "anon";

grant select on table "public"."kyc_audit_log" to "anon";

grant trigger on table "public"."kyc_audit_log" to "anon";

grant truncate on table "public"."kyc_audit_log" to "anon";

grant update on table "public"."kyc_audit_log" to "anon";

grant delete on table "public"."kyc_audit_log" to "authenticated";

grant insert on table "public"."kyc_audit_log" to "authenticated";

grant references on table "public"."kyc_audit_log" to "authenticated";

grant select on table "public"."kyc_audit_log" to "authenticated";

grant trigger on table "public"."kyc_audit_log" to "authenticated";

grant truncate on table "public"."kyc_audit_log" to "authenticated";

grant update on table "public"."kyc_audit_log" to "authenticated";

grant delete on table "public"."kyc_audit_log" to "service_role";

grant insert on table "public"."kyc_audit_log" to "service_role";

grant references on table "public"."kyc_audit_log" to "service_role";

grant select on table "public"."kyc_audit_log" to "service_role";

grant trigger on table "public"."kyc_audit_log" to "service_role";

grant truncate on table "public"."kyc_audit_log" to "service_role";

grant update on table "public"."kyc_audit_log" to "service_role";

grant delete on table "public"."margin_calculations" to "anon";

grant insert on table "public"."margin_calculations" to "anon";

grant references on table "public"."margin_calculations" to "anon";

grant select on table "public"."margin_calculations" to "anon";

grant trigger on table "public"."margin_calculations" to "anon";

grant truncate on table "public"."margin_calculations" to "anon";

grant update on table "public"."margin_calculations" to "anon";

grant delete on table "public"."margin_calculations" to "authenticated";

grant insert on table "public"."margin_calculations" to "authenticated";

grant references on table "public"."margin_calculations" to "authenticated";

grant select on table "public"."margin_calculations" to "authenticated";

grant trigger on table "public"."margin_calculations" to "authenticated";

grant truncate on table "public"."margin_calculations" to "authenticated";

grant update on table "public"."margin_calculations" to "authenticated";

grant delete on table "public"."margin_calculations" to "service_role";

grant insert on table "public"."margin_calculations" to "service_role";

grant references on table "public"."margin_calculations" to "service_role";

grant select on table "public"."margin_calculations" to "service_role";

grant trigger on table "public"."margin_calculations" to "service_role";

grant truncate on table "public"."margin_calculations" to "service_role";

grant update on table "public"."margin_calculations" to "service_role";

grant delete on table "public"."market_data" to "anon";

grant insert on table "public"."market_data" to "anon";

grant references on table "public"."market_data" to "anon";

grant select on table "public"."market_data" to "anon";

grant trigger on table "public"."market_data" to "anon";

grant truncate on table "public"."market_data" to "anon";

grant update on table "public"."market_data" to "anon";

grant delete on table "public"."market_data" to "authenticated";

grant insert on table "public"."market_data" to "authenticated";

grant references on table "public"."market_data" to "authenticated";

grant select on table "public"."market_data" to "authenticated";

grant trigger on table "public"."market_data" to "authenticated";

grant truncate on table "public"."market_data" to "authenticated";

grant update on table "public"."market_data" to "authenticated";

grant delete on table "public"."market_data" to "service_role";

grant insert on table "public"."market_data" to "service_role";

grant references on table "public"."market_data" to "service_role";

grant select on table "public"."market_data" to "service_role";

grant trigger on table "public"."market_data" to "service_role";

grant truncate on table "public"."market_data" to "service_role";

grant update on table "public"."market_data" to "service_role";

grant delete on table "public"."order_history" to "anon";

grant insert on table "public"."order_history" to "anon";

grant references on table "public"."order_history" to "anon";

grant select on table "public"."order_history" to "anon";

grant trigger on table "public"."order_history" to "anon";

grant truncate on table "public"."order_history" to "anon";

grant update on table "public"."order_history" to "anon";

grant delete on table "public"."order_history" to "authenticated";

grant insert on table "public"."order_history" to "authenticated";

grant references on table "public"."order_history" to "authenticated";

grant select on table "public"."order_history" to "authenticated";

grant trigger on table "public"."order_history" to "authenticated";

grant truncate on table "public"."order_history" to "authenticated";

grant update on table "public"."order_history" to "authenticated";

grant delete on table "public"."order_history" to "service_role";

grant insert on table "public"."order_history" to "service_role";

grant references on table "public"."order_history" to "service_role";

grant select on table "public"."order_history" to "service_role";

grant trigger on table "public"."order_history" to "service_role";

grant truncate on table "public"."order_history" to "service_role";

grant update on table "public"."order_history" to "service_role";

grant delete on table "public"."position_history" to "anon";

grant insert on table "public"."position_history" to "anon";

grant references on table "public"."position_history" to "anon";

grant select on table "public"."position_history" to "anon";

grant trigger on table "public"."position_history" to "anon";

grant truncate on table "public"."position_history" to "anon";

grant update on table "public"."position_history" to "anon";

grant delete on table "public"."position_history" to "authenticated";

grant insert on table "public"."position_history" to "authenticated";

grant references on table "public"."position_history" to "authenticated";

grant select on table "public"."position_history" to "authenticated";

grant trigger on table "public"."position_history" to "authenticated";

grant truncate on table "public"."position_history" to "authenticated";

grant update on table "public"."position_history" to "authenticated";

grant delete on table "public"."position_history" to "service_role";

grant insert on table "public"."position_history" to "service_role";

grant references on table "public"."position_history" to "service_role";

grant select on table "public"."position_history" to "service_role";

grant trigger on table "public"."position_history" to "service_role";

grant truncate on table "public"."position_history" to "service_role";

grant update on table "public"."position_history" to "service_role";

grant delete on table "public"."position_updates" to "anon";

grant insert on table "public"."position_updates" to "anon";

grant references on table "public"."position_updates" to "anon";

grant select on table "public"."position_updates" to "anon";

grant trigger on table "public"."position_updates" to "anon";

grant truncate on table "public"."position_updates" to "anon";

grant update on table "public"."position_updates" to "anon";

grant delete on table "public"."position_updates" to "authenticated";

grant insert on table "public"."position_updates" to "authenticated";

grant references on table "public"."position_updates" to "authenticated";

grant select on table "public"."position_updates" to "authenticated";

grant trigger on table "public"."position_updates" to "authenticated";

grant truncate on table "public"."position_updates" to "authenticated";

grant update on table "public"."position_updates" to "authenticated";

grant delete on table "public"."position_updates" to "service_role";

grant insert on table "public"."position_updates" to "service_role";

grant references on table "public"."position_updates" to "service_role";

grant select on table "public"."position_updates" to "service_role";

grant trigger on table "public"."position_updates" to "service_role";

grant truncate on table "public"."position_updates" to "service_role";

grant update on table "public"."position_updates" to "service_role";

grant delete on table "public"."price_alerts" to "anon";

grant insert on table "public"."price_alerts" to "anon";

grant references on table "public"."price_alerts" to "anon";

grant select on table "public"."price_alerts" to "anon";

grant trigger on table "public"."price_alerts" to "anon";

grant truncate on table "public"."price_alerts" to "anon";

grant update on table "public"."price_alerts" to "anon";

grant delete on table "public"."price_alerts" to "authenticated";

grant insert on table "public"."price_alerts" to "authenticated";

grant references on table "public"."price_alerts" to "authenticated";

grant select on table "public"."price_alerts" to "authenticated";

grant trigger on table "public"."price_alerts" to "authenticated";

grant truncate on table "public"."price_alerts" to "authenticated";

grant update on table "public"."price_alerts" to "authenticated";

grant delete on table "public"."price_alerts" to "service_role";

grant insert on table "public"."price_alerts" to "service_role";

grant references on table "public"."price_alerts" to "service_role";

grant select on table "public"."price_alerts" to "service_role";

grant trigger on table "public"."price_alerts" to "service_role";

grant truncate on table "public"."price_alerts" to "service_role";

grant update on table "public"."price_alerts" to "service_role";

grant delete on table "public"."risk_metrics" to "anon";

grant insert on table "public"."risk_metrics" to "anon";

grant references on table "public"."risk_metrics" to "anon";

grant select on table "public"."risk_metrics" to "anon";

grant trigger on table "public"."risk_metrics" to "anon";

grant truncate on table "public"."risk_metrics" to "anon";

grant update on table "public"."risk_metrics" to "anon";

grant delete on table "public"."risk_metrics" to "authenticated";

grant insert on table "public"."risk_metrics" to "authenticated";

grant references on table "public"."risk_metrics" to "authenticated";

grant select on table "public"."risk_metrics" to "authenticated";

grant trigger on table "public"."risk_metrics" to "authenticated";

grant truncate on table "public"."risk_metrics" to "authenticated";

grant update on table "public"."risk_metrics" to "authenticated";

grant delete on table "public"."risk_metrics" to "service_role";

grant insert on table "public"."risk_metrics" to "service_role";

grant references on table "public"."risk_metrics" to "service_role";

grant select on table "public"."risk_metrics" to "service_role";

grant trigger on table "public"."risk_metrics" to "service_role";

grant truncate on table "public"."risk_metrics" to "service_role";

grant update on table "public"."risk_metrics" to "service_role";

grant delete on table "public"."trade_analytics" to "anon";

grant insert on table "public"."trade_analytics" to "anon";

grant references on table "public"."trade_analytics" to "anon";

grant select on table "public"."trade_analytics" to "anon";

grant trigger on table "public"."trade_analytics" to "anon";

grant truncate on table "public"."trade_analytics" to "anon";

grant update on table "public"."trade_analytics" to "anon";

grant delete on table "public"."trade_analytics" to "authenticated";

grant insert on table "public"."trade_analytics" to "authenticated";

grant references on table "public"."trade_analytics" to "authenticated";

grant select on table "public"."trade_analytics" to "authenticated";

grant trigger on table "public"."trade_analytics" to "authenticated";

grant truncate on table "public"."trade_analytics" to "authenticated";

grant update on table "public"."trade_analytics" to "authenticated";

grant delete on table "public"."trade_analytics" to "service_role";

grant insert on table "public"."trade_analytics" to "service_role";

grant references on table "public"."trade_analytics" to "service_role";

grant select on table "public"."trade_analytics" to "service_role";

grant trigger on table "public"."trade_analytics" to "service_role";

grant truncate on table "public"."trade_analytics" to "service_role";

grant update on table "public"."trade_analytics" to "service_role";

grant delete on table "public"."trading_orders" to "anon";

grant insert on table "public"."trading_orders" to "anon";

grant references on table "public"."trading_orders" to "anon";

grant select on table "public"."trading_orders" to "anon";

grant trigger on table "public"."trading_orders" to "anon";

grant truncate on table "public"."trading_orders" to "anon";

grant update on table "public"."trading_orders" to "anon";

grant delete on table "public"."trading_orders" to "authenticated";

grant insert on table "public"."trading_orders" to "authenticated";

grant references on table "public"."trading_orders" to "authenticated";

grant select on table "public"."trading_orders" to "authenticated";

grant trigger on table "public"."trading_orders" to "authenticated";

grant truncate on table "public"."trading_orders" to "authenticated";

grant update on table "public"."trading_orders" to "authenticated";

grant delete on table "public"."trading_orders" to "service_role";

grant insert on table "public"."trading_orders" to "service_role";

grant references on table "public"."trading_orders" to "service_role";

grant select on table "public"."trading_orders" to "service_role";

grant trigger on table "public"."trading_orders" to "service_role";

grant truncate on table "public"."trading_orders" to "service_role";

grant update on table "public"."trading_orders" to "service_role";

grant delete on table "public"."trading_positions" to "anon";

grant insert on table "public"."trading_positions" to "anon";

grant references on table "public"."trading_positions" to "anon";

grant select on table "public"."trading_positions" to "anon";

grant trigger on table "public"."trading_positions" to "anon";

grant truncate on table "public"."trading_positions" to "anon";

grant update on table "public"."trading_positions" to "anon";

grant delete on table "public"."trading_positions" to "authenticated";

grant insert on table "public"."trading_positions" to "authenticated";

grant references on table "public"."trading_positions" to "authenticated";

grant select on table "public"."trading_positions" to "authenticated";

grant trigger on table "public"."trading_positions" to "authenticated";

grant truncate on table "public"."trading_positions" to "authenticated";

grant update on table "public"."trading_positions" to "authenticated";

grant delete on table "public"."trading_positions" to "service_role";

grant insert on table "public"."trading_positions" to "service_role";

grant references on table "public"."trading_positions" to "service_role";

grant select on table "public"."trading_positions" to "service_role";

grant trigger on table "public"."trading_positions" to "service_role";

grant truncate on table "public"."trading_positions" to "service_role";

grant update on table "public"."trading_positions" to "service_role";

grant delete on table "public"."user_account" to "anon";

grant insert on table "public"."user_account" to "anon";

grant references on table "public"."user_account" to "anon";

grant select on table "public"."user_account" to "anon";

grant trigger on table "public"."user_account" to "anon";

grant truncate on table "public"."user_account" to "anon";

grant update on table "public"."user_account" to "anon";

grant delete on table "public"."user_account" to "authenticated";

grant insert on table "public"."user_account" to "authenticated";

grant references on table "public"."user_account" to "authenticated";

grant select on table "public"."user_account" to "authenticated";

grant trigger on table "public"."user_account" to "authenticated";

grant truncate on table "public"."user_account" to "authenticated";

grant update on table "public"."user_account" to "authenticated";

grant delete on table "public"."user_account" to "service_role";

grant insert on table "public"."user_account" to "service_role";

grant references on table "public"."user_account" to "service_role";

grant select on table "public"."user_account" to "service_role";

grant trigger on table "public"."user_account" to "service_role";

grant truncate on table "public"."user_account" to "service_role";

grant update on table "public"."user_account" to "service_role";

grant delete on table "public"."user_portfolio" to "anon";

grant insert on table "public"."user_portfolio" to "anon";

grant references on table "public"."user_portfolio" to "anon";

grant select on table "public"."user_portfolio" to "anon";

grant trigger on table "public"."user_portfolio" to "anon";

grant truncate on table "public"."user_portfolio" to "anon";

grant update on table "public"."user_portfolio" to "anon";

grant delete on table "public"."user_portfolio" to "authenticated";

grant insert on table "public"."user_portfolio" to "authenticated";

grant references on table "public"."user_portfolio" to "authenticated";

grant select on table "public"."user_portfolio" to "authenticated";

grant trigger on table "public"."user_portfolio" to "authenticated";

grant truncate on table "public"."user_portfolio" to "authenticated";

grant update on table "public"."user_portfolio" to "authenticated";

grant delete on table "public"."user_portfolio" to "service_role";

grant insert on table "public"."user_portfolio" to "service_role";

grant references on table "public"."user_portfolio" to "service_role";

grant select on table "public"."user_portfolio" to "service_role";

grant trigger on table "public"."user_portfolio" to "service_role";

grant truncate on table "public"."user_portfolio" to "service_role";

grant update on table "public"."user_portfolio" to "service_role";

grant delete on table "public"."user_trades" to "anon";

grant insert on table "public"."user_trades" to "anon";

grant references on table "public"."user_trades" to "anon";

grant select on table "public"."user_trades" to "anon";

grant trigger on table "public"."user_trades" to "anon";

grant truncate on table "public"."user_trades" to "anon";

grant update on table "public"."user_trades" to "anon";

grant delete on table "public"."user_trades" to "authenticated";

grant insert on table "public"."user_trades" to "authenticated";

grant references on table "public"."user_trades" to "authenticated";

grant select on table "public"."user_trades" to "authenticated";

grant trigger on table "public"."user_trades" to "authenticated";

grant truncate on table "public"."user_trades" to "authenticated";

grant update on table "public"."user_trades" to "authenticated";

grant delete on table "public"."user_trades" to "service_role";

grant insert on table "public"."user_trades" to "service_role";

grant references on table "public"."user_trades" to "service_role";

grant select on table "public"."user_trades" to "service_role";

grant trigger on table "public"."user_trades" to "service_role";

grant truncate on table "public"."user_trades" to "service_role";

grant update on table "public"."user_trades" to "service_role";

grant delete on table "public"."user_watchlist" to "anon";

grant insert on table "public"."user_watchlist" to "anon";

grant references on table "public"."user_watchlist" to "anon";

grant select on table "public"."user_watchlist" to "anon";

grant trigger on table "public"."user_watchlist" to "anon";

grant truncate on table "public"."user_watchlist" to "anon";

grant update on table "public"."user_watchlist" to "anon";

grant delete on table "public"."user_watchlist" to "authenticated";

grant insert on table "public"."user_watchlist" to "authenticated";

grant references on table "public"."user_watchlist" to "authenticated";

grant select on table "public"."user_watchlist" to "authenticated";

grant trigger on table "public"."user_watchlist" to "authenticated";

grant truncate on table "public"."user_watchlist" to "authenticated";

grant update on table "public"."user_watchlist" to "authenticated";

grant delete on table "public"."user_watchlist" to "service_role";

grant insert on table "public"."user_watchlist" to "service_role";

grant references on table "public"."user_watchlist" to "service_role";

grant select on table "public"."user_watchlist" to "service_role";

grant trigger on table "public"."user_watchlist" to "service_role";

grant truncate on table "public"."user_watchlist" to "service_role";

grant update on table "public"."user_watchlist" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Users can insert their own metrics"
on "public"."account_metrics"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own metrics"
on "public"."account_metrics"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own metrics"
on "public"."account_metrics"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "select_own_account"
on "public"."accounts"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Anyone can view leverage config"
on "public"."asset_leverage_config"
as permissive
for select
to public
using (true);


create policy "Delete own assets"
on "public"."assets"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Insert own assets"
on "public"."assets"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Select own assets"
on "public"."assets"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Update own assets"
on "public"."assets"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Allow public read access to historical market data"
on "public"."historical_market_data"
as permissive
for select
to public
using (true);


create policy "Users can delete their own KYC audit logs"
on "public"."kyc_audit_log"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = (reviewed_by)::uuid));


create policy "Users can insert their own margin calculations"
on "public"."margin_calculations"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own margin calculations"
on "public"."margin_calculations"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Allow anyone to read market data"
on "public"."market_data"
as permissive
for select
to public
using (true);


create policy "Allow public read access to market data"
on "public"."market_data"
as permissive
for select
to public
using (true);


create policy "Anyone can view market data"
on "public"."market_data"
as permissive
for select
to public
using (true);


create policy "Only service role can modify market data"
on "public"."market_data"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


create policy "Users can insert their own history"
on "public"."order_history"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own history"
on "public"."order_history"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own orders"
on "public"."orders"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own orders"
on "public"."orders"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can insert their own position history"
on "public"."position_history"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own position history"
on "public"."position_history"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own position updates"
on "public"."position_updates"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own position updates"
on "public"."position_updates"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own positions"
on "public"."positions"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own price alerts"
on "public"."price_alerts"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own price alerts"
on "public"."price_alerts"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own price alerts"
on "public"."price_alerts"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own price alerts"
on "public"."price_alerts"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can insert their own risk metrics"
on "public"."risk_metrics"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own risk metrics"
on "public"."risk_metrics"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own risk metrics"
on "public"."risk_metrics"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own trade analytics"
on "public"."trade_analytics"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own trade analytics"
on "public"."trade_analytics"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own trade analytics"
on "public"."trade_analytics"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can create their own orders"
on "public"."trading_orders"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own orders"
on "public"."trading_orders"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own orders"
on "public"."trading_orders"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can create their own positions"
on "public"."trading_positions"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own positions"
on "public"."trading_positions"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own positions"
on "public"."trading_positions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can update their own account"
on "public"."user_account"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view their own account"
on "public"."user_account"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can update their own portfolio"
on "public"."user_portfolio"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own portfolio"
on "public"."user_portfolio"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own trades"
on "public"."user_trades"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own trades"
on "public"."user_trades"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own trades"
on "public"."user_trades"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete from their own watchlist"
on "public"."user_watchlist"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert into their own watchlist"
on "public"."user_watchlist"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own watchlist"
on "public"."user_watchlist"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own watchlist"
on "public"."user_watchlist"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Select own data"
on "public"."users"
as permissive
for select
to public
using ((id = ( SELECT auth.uid() AS uid)));


create policy "Users can update their own orders"
on "public"."orders"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own orders"
on "public"."orders"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can update their own positions"
on "public"."positions"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own positions"
on "public"."positions"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER kyc_status_notify_trigger AFTER UPDATE ON public.kyc_documents FOR EACH ROW EXECUTE FUNCTION notify_kyc_status_change();

CREATE TRIGGER update_market_data_updated_at BEFORE UPDATE ON public.market_data FOR EACH ROW EXECUTE FUNCTION update_market_data_updated_at();

CREATE TRIGGER trigger_parent_order_status_change AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION handle_parent_order_status_change();

CREATE TRIGGER calculate_position_pnl_trigger BEFORE UPDATE OF current_price ON public.positions FOR EACH ROW EXECUTE FUNCTION update_position_pnl();

CREATE TRIGGER trigger_auto_calculate_leverage AFTER INSERT OR UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION auto_calculate_position_leverage();

CREATE TRIGGER update_positions_last_updated BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_analytics_updated_at BEFORE UPDATE ON public.trade_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


