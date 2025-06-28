

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."auto_calculate_position_leverage"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  PERFORM public.update_position_leverage(NEW.id, NEW.leverage_ratio);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_calculate_position_leverage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_position_margin"("p_asset_class" "text", "p_symbol" "text", "p_position_value" numeric, "p_leverage" numeric DEFAULT NULL::numeric) RETURNS TABLE("max_leverage" integer, "initial_margin" numeric, "maintenance_margin" numeric, "margin_level" numeric, "leverage_used" numeric)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
$$;


ALTER FUNCTION "public"."calculate_position_margin"("p_asset_class" "text", "p_symbol" "text", "p_position_value" numeric, "p_leverage" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_position_pnl"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF p_direction = 'buy' THEN
        RETURN (p_current_price - p_entry_price) * p_units;
    ELSE
        RETURN (p_entry_price - p_current_price) * p_units;
    END IF;
END;
$$;


ALTER FUNCTION "public"."calculate_position_pnl"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_position_pnl_realtime"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF p_direction = 'buy' THEN
    RETURN (p_current_price - p_entry_price) * p_units;
  ELSE
    RETURN (p_entry_price - p_current_price) * p_units;
  END IF;
END;
$$;


ALTER FUNCTION "public"."calculate_position_pnl_realtime"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_realtime_pnl"("p_position_id" "uuid", "p_new_price" numeric) RETURNS TABLE("unrealized_pnl" numeric, "daily_pnl" numeric, "pip_difference" numeric, "pip_value" numeric)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  pos RECORD;
  pnl_result NUMERIC;
  daily_result NUMERIC;
  pip_diff NUMERIC;
  pip_val NUMERIC;
BEGIN
  -- Get position details
  SELECT * INTO pos 
  FROM public.positions 
  WHERE id = p_position_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate unrealized P&L
  IF pos.direction = 'buy' THEN
    pnl_result := (p_new_price - pos.entry_price) * pos.quantity;
  ELSE
    pnl_result := (pos.entry_price - p_new_price) * pos.quantity;
  END IF;
  
  -- Calculate daily P&L (difference from session start)
  daily_result := pnl_result - COALESCE(pos.session_pnl, 0);
  
  -- Calculate pip difference and value (for forex)
  IF pos.asset_class = 'forex' THEN
    pip_diff := ABS(p_new_price - pos.entry_price) * 10000;
    pip_val := pnl_result / NULLIF(pip_diff, 0);
  ELSE
    pip_diff := 0;
    pip_val := 0;
  END IF;
  
  RETURN QUERY SELECT pnl_result, daily_result, pip_diff, pip_val;
END;
$$;


ALTER FUNCTION "public"."calculate_realtime_pnl"("p_position_id" "uuid", "p_new_price" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_account"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO public.user_account (id, cash_balance, equity, used_margin, available_funds)
  VALUES (NEW.id, 10000.00, 10000.00, 0.00, 10000.00);
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."create_user_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."execute_market_order"("p_order_id" "uuid", "p_execution_price" numeric) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."execute_market_order"("p_order_id" "uuid", "p_execution_price" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_kyc_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_kyc_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_account_metrics"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_account_metrics"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_market_data_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_market_data_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_orders_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_orders_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_position_leverage"("p_position_id" "uuid", "p_leverage" numeric DEFAULT NULL::numeric) RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
$$;


ALTER FUNCTION "public"."update_position_leverage"("p_position_id" "uuid", "p_leverage" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_position_pnl"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_position_pnl"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_position_realtime"("p_position_id" "uuid", "p_new_price" numeric) RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  pnl_data RECORD;
BEGIN
  -- Calculate new P&L values
  SELECT * INTO pnl_data 
  FROM public.calculate_realtime_pnl(p_position_id, p_new_price);
  
  -- Update position
  UPDATE public.positions 
  SET 
    current_price = p_new_price,
    unrealized_pnl = pnl_data.unrealized_pnl,
    daily_pnl = pnl_data.daily_pnl,
    pip_difference = pnl_data.pip_difference,
    pip_value = pnl_data.pip_value,
    last_updated = NOW()
  WHERE id = p_position_id;
  
  -- Insert update record
  INSERT INTO public.position_updates (
    position_id, 
    user_id, 
    price_update, 
    pnl_change, 
    unrealized_pnl
  )
  SELECT 
    p_position_id,
    user_id,
    p_new_price,
    pnl_data.unrealized_pnl - COALESCE(unrealized_pnl, 0),
    pnl_data.unrealized_pnl
  FROM public.positions 
  WHERE id = p_position_id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."update_position_realtime"("p_position_id" "uuid", "p_new_price" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_positions_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_positions_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "balance" numeric DEFAULT 10000.00 NOT NULL,
    "bonus" numeric DEFAULT 0.00 NOT NULL,
    "equity" numeric DEFAULT 10000.00 NOT NULL,
    "used_margin" numeric DEFAULT 0.00 NOT NULL,
    "available_funds" numeric DEFAULT 10000.00 NOT NULL,
    "unrealized_pnl" numeric DEFAULT 0.00 NOT NULL,
    "realized_pnl" numeric DEFAULT 0.00 NOT NULL,
    "total_exposure" numeric DEFAULT 0.00 NOT NULL,
    "margin_level" numeric DEFAULT 0.00 NOT NULL,
    "open_positions_count" integer DEFAULT 0 NOT NULL,
    "pending_orders_count" integer DEFAULT 0 NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."account_metrics" REPLICA IDENTITY FULL;


ALTER TABLE "public"."account_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "account_type" "text" DEFAULT 'DEMO'::"text",
    "balance" numeric(15,2) DEFAULT 0.00,
    "equity" numeric(15,2),
    "margin_used" numeric(15,2) DEFAULT 0.00,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reset_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    CONSTRAINT "accounts_account_type_check" CHECK (("account_type" = ANY (ARRAY['DEMO'::"text", 'COMPETITION'::"text"])))
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."asset_leverage_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "asset_class" "text" NOT NULL,
    "symbol" "text",
    "max_leverage" integer NOT NULL,
    "min_margin_requirement" numeric NOT NULL,
    "maintenance_margin" numeric NOT NULL,
    "margin_call_level" numeric DEFAULT 1.0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."asset_leverage_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "symbol" character varying(20) NOT NULL,
    "name" character varying(255) NOT NULL,
    "asset_class" "text" NOT NULL,
    "base_currency" character varying(3),
    "quote_currency" character varying(3),
    "is_active" boolean DEFAULT true,
    "leverage_max" integer,
    "spread_base" numeric(8,5),
    "contract_size" numeric(15,2) DEFAULT 1.00,
    CONSTRAINT "assets_asset_class_check" CHECK (("asset_class" = ANY (ARRAY['FOREX'::"text", 'STOCKS'::"text", 'INDICES'::"text", 'COMMODITIES'::"text", 'CRYPTO'::"text"])))
);


ALTER TABLE "public"."assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."historical_market_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "symbol" "text" NOT NULL,
    "market_type" "text" NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    "open_price" numeric NOT NULL,
    "high_price" numeric NOT NULL,
    "low_price" numeric NOT NULL,
    "close_price" numeric NOT NULL,
    "volume" numeric
);


ALTER TABLE "public"."historical_market_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kyc_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "previous_status" "text",
    "new_status" "text" NOT NULL,
    "comments" "text",
    "reviewed_by" "text",
    "reviewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kyc_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kyc_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "document_type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "comments" "text",
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "plexop_review_id" "text",
    CONSTRAINT "kyc_documents_category_check" CHECK (("category" = ANY (ARRAY['ID_VERIFICATION'::"text", 'ADDRESS_VERIFICATION'::"text", 'OTHER_DOCUMENTATION'::"text"]))),
    CONSTRAINT "kyc_documents_document_type_check" CHECK (("document_type" = ANY (ARRAY['ID_PASSPORT'::"text", 'ID_FRONT'::"text", 'ID_BACK'::"text", 'DRIVERS_LICENSE'::"text", 'UTILITY_BILL'::"text", 'BANK_STATEMENT'::"text", 'CREDIT_CARD_STATEMENT'::"text", 'TAX_BILL'::"text", 'OTHER_ID'::"text", 'OTHER_ADDRESS'::"text", 'OTHER_DOC'::"text"]))),
    CONSTRAINT "kyc_documents_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'APPROVED'::"text", 'REJECTED'::"text"])))
);


ALTER TABLE "public"."kyc_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."margin_calculations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "position_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "initial_margin" numeric NOT NULL,
    "maintenance_margin" numeric NOT NULL,
    "used_margin" numeric NOT NULL,
    "free_margin" numeric NOT NULL,
    "margin_level" numeric NOT NULL,
    "leverage_used" numeric NOT NULL,
    "calculated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."margin_calculations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."market_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "symbol" "text" NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric NOT NULL,
    "change_percentage" numeric NOT NULL,
    "volume" "text" NOT NULL,
    "market_cap" "text",
    "market_type" "text" NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "last_price" numeric,
    "high_price" numeric,
    "low_price" numeric,
    "open_price" numeric,
    "previous_close" numeric,
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."market_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "details" "jsonb",
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "symbol" "text" NOT NULL,
    "asset_class" "text" NOT NULL,
    "order_type" "text" NOT NULL,
    "direction" "text" NOT NULL,
    "requested_price" numeric(18,8) NOT NULL,
    "execution_price" numeric(18,8),
    "position_value" numeric(18,2) NOT NULL,
    "margin_required" numeric(18,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "stop_loss" numeric(18,8),
    "take_profit" numeric(18,8),
    "expiration_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "executed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "rejected_reason" "text",
    "account_id" "uuid",
    "asset_id" "uuid",
    "stop_price" numeric,
    "filled_quantity" numeric DEFAULT 0,
    "avg_fill_price" numeric,
    "expires_at" timestamp with time zone,
    "side" "text" NOT NULL,
    CONSTRAINT "orders_asset_class_check" CHECK (("asset_class" = ANY (ARRAY['FOREX'::"text", 'STOCKS'::"text", 'CRYPTO'::"text", 'INDICES'::"text", 'COMMODITIES'::"text"]))),
    CONSTRAINT "orders_direction_check" CHECK (("direction" = ANY (ARRAY['buy'::"text", 'sell'::"text"]))),
    CONSTRAINT "orders_order_type_check" CHECK (("order_type" = ANY (ARRAY['market'::"text", 'limit'::"text", 'stop'::"text", 'stop_limit'::"text"]))),
    CONSTRAINT "orders_requested_price_check" CHECK (("requested_price" > (0)::numeric)),
    CONSTRAINT "orders_side_check" CHECK (("side" = ANY (ARRAY['buy'::"text", 'sell'::"text"]))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'filled'::"text", 'cancelled'::"text", 'rejected'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."position_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "position_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "price" numeric(18,8) NOT NULL,
    "units" numeric(18,8),
    "pnl" numeric(18,2),
    "margin_impact" numeric(18,2),
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    CONSTRAINT "position_history_action_check" CHECK (("action" = ANY (ARRAY['opened'::"text", 'modified'::"text", 'closed'::"text", 'stop_loss_triggered'::"text", 'take_profit_triggered'::"text"])))
);


ALTER TABLE "public"."position_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."position_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "position_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "price_update" numeric NOT NULL,
    "pnl_change" numeric NOT NULL,
    "unrealized_pnl" numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "market_session" "text" DEFAULT 'regular'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."position_updates" REPLICA IDENTITY FULL;


ALTER TABLE "public"."position_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."positions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "symbol" "text" NOT NULL,
    "asset_class" "text" NOT NULL,
    "direction" "text" NOT NULL,
    "units" numeric(18,8) NOT NULL,
    "entry_price" numeric(18,8) NOT NULL,
    "current_price" numeric(18,8) NOT NULL,
    "close_price" numeric(18,8),
    "position_value" numeric(18,2) NOT NULL,
    "margin_used" numeric(18,2) NOT NULL,
    "unrealized_pnl" numeric(18,2) DEFAULT 0,
    "realized_pnl" numeric(18,2),
    "stop_loss" numeric(18,8),
    "take_profit" numeric(18,8),
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "opened_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "daily_pnl" numeric DEFAULT 0,
    "session_pnl" numeric DEFAULT 0,
    "total_fees" numeric DEFAULT 0,
    "swap_charges" numeric DEFAULT 0,
    "pip_value" numeric DEFAULT 0,
    "pip_difference" numeric DEFAULT 0,
    "leverage_ratio" numeric DEFAULT 1.0,
    "initial_margin" numeric DEFAULT 0,
    "maintenance_margin" numeric DEFAULT 0,
    "margin_level" numeric DEFAULT 0,
    "account_id" "uuid",
    "asset_id" "uuid",
    CONSTRAINT "positions_asset_class_check" CHECK (("asset_class" = ANY (ARRAY['FOREX'::"text", 'STOCKS'::"text", 'CRYPTO'::"text", 'INDICES'::"text", 'COMMODITIES'::"text"]))),
    CONSTRAINT "positions_current_price_check" CHECK (("current_price" > (0)::numeric)),
    CONSTRAINT "positions_direction_check" CHECK (("direction" = ANY (ARRAY['buy'::"text", 'sell'::"text"]))),
    CONSTRAINT "positions_entry_price_check" CHECK (("entry_price" > (0)::numeric)),
    CONSTRAINT "positions_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'closed'::"text", 'partial'::"text"]))),
    CONSTRAINT "positions_units_check" CHECK (("units" > (0)::numeric))
);

ALTER TABLE ONLY "public"."positions" REPLICA IDENTITY FULL;


ALTER TABLE "public"."positions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."price_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "asset_symbol" "text" NOT NULL,
    "asset_name" "text" NOT NULL,
    "market_type" "text" NOT NULL,
    "target_price" numeric NOT NULL,
    "condition" "text" NOT NULL,
    "is_triggered" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "triggered_at" timestamp with time zone,
    CONSTRAINT "price_alerts_condition_check" CHECK (("condition" = ANY (ARRAY['above'::"text", 'below'::"text"])))
);


ALTER TABLE "public"."price_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "kyc_status" "text" DEFAULT 'NOT_SUBMITTED'::"text",
    "plexop_user_id" "text",
    CONSTRAINT "profiles_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['APPROVED'::"text", 'PENDING'::"text", 'REJECTED'::"text", 'NOT_SUBMITTED'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_exposure" numeric(18,2) DEFAULT 0,
    "used_margin" numeric(18,2) DEFAULT 0,
    "available_margin" numeric(18,2) DEFAULT 0,
    "margin_level" numeric(8,4) DEFAULT 0,
    "portfolio_var" numeric(18,2) DEFAULT 0,
    "max_position_size" numeric(18,2) DEFAULT 0,
    "correlation_risk" numeric(5,2) DEFAULT 0,
    "diversification_score" numeric(5,2) DEFAULT 0,
    "risk_score" numeric(5,2) DEFAULT 0,
    "last_calculated" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."risk_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trade_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "total_trades" integer DEFAULT 0,
    "winning_trades" integer DEFAULT 0,
    "losing_trades" integer DEFAULT 0,
    "total_pnl" numeric(18,2) DEFAULT 0,
    "total_fees" numeric(18,2) DEFAULT 0,
    "net_pnl" numeric(18,2) DEFAULT 0,
    "win_rate" numeric(5,2) DEFAULT 0,
    "avg_win" numeric(18,2) DEFAULT 0,
    "avg_loss" numeric(18,2) DEFAULT 0,
    "profit_factor" numeric(8,4) DEFAULT 0,
    "max_drawdown" numeric(18,2) DEFAULT 0,
    "sharpe_ratio" numeric(8,4) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trade_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trading_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "symbol" "text" NOT NULL,
    "asset_class" "text" NOT NULL,
    "order_type" "text" NOT NULL,
    "direction" "text" NOT NULL,
    "units" numeric NOT NULL,
    "requested_price" numeric NOT NULL,
    "execution_price" numeric,
    "position_value" numeric NOT NULL,
    "margin_required" numeric NOT NULL,
    "leverage_ratio" numeric DEFAULT 1.0 NOT NULL,
    "stop_loss_price" numeric,
    "take_profit_price" numeric,
    "expiration_date" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "executed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "rejected_reason" "text",
    "fees" numeric DEFAULT 0,
    "slippage" numeric DEFAULT 0,
    CONSTRAINT "trading_orders_direction_check" CHECK (("direction" = ANY (ARRAY['buy'::"text", 'sell'::"text"]))),
    CONSTRAINT "trading_orders_order_type_check" CHECK (("order_type" = ANY (ARRAY['market'::"text", 'entry'::"text", 'stop_loss'::"text", 'take_profit'::"text"]))),
    CONSTRAINT "trading_orders_requested_price_check" CHECK (("requested_price" > (0)::numeric)),
    CONSTRAINT "trading_orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'executed'::"text", 'cancelled'::"text", 'expired'::"text", 'filled'::"text"]))),
    CONSTRAINT "trading_orders_units_check" CHECK (("units" > (0)::numeric))
);

ALTER TABLE ONLY "public"."trading_orders" REPLICA IDENTITY FULL;


ALTER TABLE "public"."trading_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trading_positions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "symbol" "text" NOT NULL,
    "asset_class" "text" NOT NULL,
    "direction" "text" NOT NULL,
    "units" numeric NOT NULL,
    "entry_price" numeric NOT NULL,
    "current_price" numeric NOT NULL,
    "position_value" numeric NOT NULL,
    "margin_used" numeric NOT NULL,
    "leverage_ratio" numeric DEFAULT 1.0 NOT NULL,
    "unrealized_pnl" numeric DEFAULT 0,
    "daily_pnl" numeric DEFAULT 0,
    "total_fees" numeric DEFAULT 0,
    "stop_loss_price" numeric,
    "take_profit_price" numeric,
    "opened_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    CONSTRAINT "trading_positions_current_price_check" CHECK (("current_price" > (0)::numeric)),
    CONSTRAINT "trading_positions_direction_check" CHECK (("direction" = ANY (ARRAY['buy'::"text", 'sell'::"text"]))),
    CONSTRAINT "trading_positions_entry_price_check" CHECK (("entry_price" > (0)::numeric)),
    CONSTRAINT "trading_positions_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'closed'::"text"]))),
    CONSTRAINT "trading_positions_units_check" CHECK (("units" > (0)::numeric))
);

ALTER TABLE ONLY "public"."trading_positions" REPLICA IDENTITY FULL;


ALTER TABLE "public"."trading_positions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_account" (
    "id" "uuid" NOT NULL,
    "cash_balance" numeric DEFAULT 10000.00 NOT NULL,
    "equity" numeric DEFAULT 10000.00 NOT NULL,
    "used_margin" numeric DEFAULT 0.00 NOT NULL,
    "available_funds" numeric DEFAULT 10000.00 NOT NULL,
    "realized_pnl" numeric DEFAULT 0.00 NOT NULL,
    "unrealized_pnl" numeric DEFAULT 0.00 NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_portfolio" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "asset_symbol" "text" NOT NULL,
    "asset_name" "text" NOT NULL,
    "market_type" "text" NOT NULL,
    "units" numeric NOT NULL,
    "average_price" numeric NOT NULL,
    "current_price" numeric NOT NULL,
    "total_value" numeric NOT NULL,
    "pnl" numeric NOT NULL,
    "pnl_percentage" numeric NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_portfolio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_trades" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "asset_symbol" "text" NOT NULL,
    "asset_name" "text" NOT NULL,
    "market_type" "text" NOT NULL,
    "trade_type" "text" NOT NULL,
    "order_type" "text" NOT NULL,
    "units" numeric NOT NULL,
    "price_per_unit" numeric NOT NULL,
    "total_amount" numeric NOT NULL,
    "status" "text" NOT NULL,
    "stop_loss" numeric,
    "take_profit" numeric,
    "expiration_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "executed_at" timestamp with time zone,
    "closed_at" timestamp with time zone,
    "pnl" numeric,
    CONSTRAINT "user_trades_order_type_check" CHECK (("order_type" = ANY (ARRAY['market'::"text", 'entry'::"text"]))),
    CONSTRAINT "user_trades_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'canceled'::"text", 'active'::"text"]))),
    CONSTRAINT "user_trades_trade_type_check" CHECK (("trade_type" = ANY (ARRAY['buy'::"text", 'sell'::"text"])))
);


ALTER TABLE "public"."user_trades" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_watchlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "asset_symbol" "text" NOT NULL,
    "asset_name" "text" NOT NULL,
    "market_type" "text" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_watchlist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" character varying(255),
    "first_name" character varying(100),
    "last_name" character varying(100),
    "experience_level" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_login" timestamp with time zone,
    "is_verified" boolean DEFAULT false,
    "kyc_status" "text" DEFAULT 'PENDING'::"text",
    "preferences" "jsonb",
    CONSTRAINT "users_experience_level_check" CHECK (("experience_level" = ANY (ARRAY['BEGINNER'::"text", 'INTERMEDIATE'::"text", 'ADVANCED'::"text"]))),
    CONSTRAINT "users_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['PENDING'::"text", 'APPROVED'::"text", 'REJECTED'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account_metrics"
    ADD CONSTRAINT "account_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."account_metrics"
    ADD CONSTRAINT "account_metrics_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_leverage_config"
    ADD CONSTRAINT "asset_leverage_config_asset_class_symbol_key" UNIQUE ("asset_class", "symbol");



ALTER TABLE ONLY "public"."asset_leverage_config"
    ADD CONSTRAINT "asset_leverage_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_symbol_key" UNIQUE ("symbol");



ALTER TABLE ONLY "public"."historical_market_data"
    ADD CONSTRAINT "historical_market_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."historical_market_data"
    ADD CONSTRAINT "historical_market_data_symbol_market_type_timestamp_key" UNIQUE ("symbol", "market_type", "timestamp");



ALTER TABLE ONLY "public"."kyc_audit_log"
    ADD CONSTRAINT "kyc_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kyc_documents"
    ADD CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."margin_calculations"
    ADD CONSTRAINT "margin_calculations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_data"
    ADD CONSTRAINT "market_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_data"
    ADD CONSTRAINT "market_data_symbol_key" UNIQUE ("symbol");



ALTER TABLE ONLY "public"."order_history"
    ADD CONSTRAINT "order_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."position_history"
    ADD CONSTRAINT "position_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."position_updates"
    ADD CONSTRAINT "position_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_alerts"
    ADD CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."risk_metrics"
    ADD CONSTRAINT "risk_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trade_analytics"
    ADD CONSTRAINT "trade_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trading_orders"
    ADD CONSTRAINT "trading_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trading_positions"
    ADD CONSTRAINT "trading_positions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_account"
    ADD CONSTRAINT "user_account_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_portfolio"
    ADD CONSTRAINT "user_portfolio_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_portfolio"
    ADD CONSTRAINT "user_portfolio_user_id_asset_symbol_market_type_key" UNIQUE ("user_id", "asset_symbol", "market_type");



ALTER TABLE ONLY "public"."user_trades"
    ADD CONSTRAINT "user_trades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_watchlist"
    ADD CONSTRAINT "user_watchlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_watchlist"
    ADD CONSTRAINT "user_watchlist_user_id_asset_symbol_market_type_key" UNIQUE ("user_id", "asset_symbol", "market_type");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_asset_leverage_config_asset_class" ON "public"."asset_leverage_config" USING "btree" ("asset_class");



CREATE INDEX "idx_asset_leverage_config_symbol" ON "public"."asset_leverage_config" USING "btree" ("symbol");



CREATE INDEX "idx_kyc_audit_log_document_id" ON "public"."kyc_audit_log" USING "btree" ("document_id");



CREATE INDEX "idx_kyc_documents_plexop_review_id" ON "public"."kyc_documents" USING "btree" ("plexop_review_id");



CREATE INDEX "idx_margin_calculations_position_id" ON "public"."margin_calculations" USING "btree" ("position_id");



CREATE INDEX "idx_margin_calculations_user_id" ON "public"."margin_calculations" USING "btree" ("user_id");



CREATE INDEX "idx_market_data_last_updated" ON "public"."market_data" USING "btree" ("last_updated");



CREATE INDEX "idx_market_data_market_type" ON "public"."market_data" USING "btree" ("market_type");



CREATE INDEX "idx_market_data_symbol" ON "public"."market_data" USING "btree" ("symbol");



CREATE INDEX "idx_orders_symbol_created" ON "public"."orders" USING "btree" ("symbol", "created_at" DESC);



CREATE INDEX "idx_orders_user_id_status" ON "public"."orders" USING "btree" ("user_id", "status");



CREATE INDEX "idx_position_history_position_id" ON "public"."position_history" USING "btree" ("position_id");



CREATE INDEX "idx_position_updates_position_id" ON "public"."position_updates" USING "btree" ("position_id");



CREATE INDEX "idx_position_updates_timestamp" ON "public"."position_updates" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_positions_last_updated" ON "public"."positions" USING "btree" ("last_updated" DESC);



CREATE INDEX "idx_positions_symbol" ON "public"."positions" USING "btree" ("symbol");



CREATE INDEX "idx_positions_user_id_status" ON "public"."positions" USING "btree" ("user_id", "status");



CREATE INDEX "idx_profiles_plexop_user_id" ON "public"."profiles" USING "btree" ("plexop_user_id");



CREATE INDEX "idx_risk_metrics_user_calculated" ON "public"."risk_metrics" USING "btree" ("user_id", "last_calculated" DESC);



CREATE INDEX "idx_trade_analytics_user_period" ON "public"."trade_analytics" USING "btree" ("user_id", "period_start", "period_end");



CREATE INDEX "idx_trading_orders_symbol" ON "public"."trading_orders" USING "btree" ("symbol");



CREATE INDEX "idx_trading_orders_user_status" ON "public"."trading_orders" USING "btree" ("user_id", "status");



CREATE INDEX "idx_trading_positions_symbol" ON "public"."trading_positions" USING "btree" ("symbol");



CREATE INDEX "idx_trading_positions_user_status" ON "public"."trading_positions" USING "btree" ("user_id", "status");



CREATE INDEX "market_data_market_type_idx" ON "public"."market_data" USING "btree" ("market_type");



CREATE INDEX "user_trades_user_id_idx" ON "public"."user_trades" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "calculate_position_pnl_trigger" BEFORE UPDATE OF "current_price" ON "public"."positions" FOR EACH ROW EXECUTE FUNCTION "public"."update_position_pnl"();



CREATE OR REPLACE TRIGGER "kyc_status_notify_trigger" AFTER UPDATE ON "public"."kyc_documents" FOR EACH ROW EXECUTE FUNCTION "public"."notify_kyc_status_change"();



CREATE OR REPLACE TRIGGER "trigger_auto_calculate_leverage" AFTER INSERT OR UPDATE ON "public"."positions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_calculate_position_leverage"();



CREATE OR REPLACE TRIGGER "update_kyc_documents_updated_at" BEFORE UPDATE ON "public"."kyc_documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_market_data_updated_at" BEFORE UPDATE ON "public"."market_data" FOR EACH ROW EXECUTE FUNCTION "public"."update_market_data_updated_at"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_orders_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_positions_last_updated" BEFORE UPDATE ON "public"."positions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_positions_updated_at" BEFORE UPDATE ON "public"."positions" FOR EACH ROW EXECUTE FUNCTION "public"."update_positions_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_trade_analytics_updated_at" BEFORE UPDATE ON "public"."trade_analytics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kyc_audit_log"
    ADD CONSTRAINT "kyc_audit_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."kyc_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kyc_documents"
    ADD CONSTRAINT "kyc_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."margin_calculations"
    ADD CONSTRAINT "margin_calculations_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."position_history"
    ADD CONSTRAINT "position_history_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."position_history"
    ADD CONSTRAINT "position_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."position_updates"
    ADD CONSTRAINT "position_updates_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."price_alerts"
    ADD CONSTRAINT "price_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_metrics"
    ADD CONSTRAINT "risk_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trade_analytics"
    ADD CONSTRAINT "trade_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trading_positions"
    ADD CONSTRAINT "trading_positions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."trading_orders"("id");



ALTER TABLE ONLY "public"."user_account"
    ADD CONSTRAINT "user_account_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_portfolio"
    ADD CONSTRAINT "user_portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_trades"
    ADD CONSTRAINT "user_trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_watchlist"
    ADD CONSTRAINT "user_watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow anyone to read market data" ON "public"."market_data" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to historical market data" ON "public"."historical_market_data" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to market data" ON "public"."market_data" FOR SELECT USING (true);



CREATE POLICY "Anyone can view leverage config" ON "public"."asset_leverage_config" FOR SELECT USING (true);



CREATE POLICY "Anyone can view market data" ON "public"."market_data" FOR SELECT USING (true);



CREATE POLICY "Only service role can modify market data" ON "public"."market_data" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can create their own orders" ON "public"."trading_orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own positions" ON "public"."trading_positions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete from their own watchlist" ON "public"."user_watchlist" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own orders" ON "public"."orders" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own positions" ON "public"."positions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own price alerts" ON "public"."price_alerts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert into their own watchlist" ON "public"."user_watchlist" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own KYC documents" ON "public"."kyc_documents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own history" ON "public"."order_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own margin calculations" ON "public"."margin_calculations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own metrics" ON "public"."account_metrics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own orders" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own position history" ON "public"."position_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own position updates" ON "public"."position_updates" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own positions" ON "public"."positions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own price alerts" ON "public"."price_alerts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own risk metrics" ON "public"."risk_metrics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own trade analytics" ON "public"."trade_analytics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own trades" ON "public"."user_trades" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own KYC documents" ON "public"."kyc_documents" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own account" ON "public"."user_account" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own metrics" ON "public"."account_metrics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own orders" ON "public"."orders" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own orders" ON "public"."trading_orders" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own portfolio" ON "public"."user_portfolio" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own positions" ON "public"."positions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own positions" ON "public"."trading_positions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own price alerts" ON "public"."price_alerts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own risk metrics" ON "public"."risk_metrics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own trade analytics" ON "public"."trade_analytics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own trades" ON "public"."user_trades" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own watchlist" ON "public"."user_watchlist" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own KYC documents" ON "public"."kyc_documents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own account" ON "public"."user_account" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own history" ON "public"."order_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own margin calculations" ON "public"."margin_calculations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own metrics" ON "public"."account_metrics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own orders" ON "public"."trading_orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own portfolio" ON "public"."user_portfolio" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own position history" ON "public"."position_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own position updates" ON "public"."position_updates" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own positions" ON "public"."positions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own positions" ON "public"."trading_positions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own price alerts" ON "public"."price_alerts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own risk metrics" ON "public"."risk_metrics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own trade analytics" ON "public"."trade_analytics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own trades" ON "public"."user_trades" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own watchlist" ON "public"."user_watchlist" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."account_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_leverage_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."historical_market_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kyc_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kyc_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."margin_calculations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."market_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."position_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."position_updates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."positions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."risk_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trade_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trading_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trading_positions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_account" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_portfolio" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_trades" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_watchlist" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."account_metrics";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."position_updates";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."positions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trading_orders";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trading_positions";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."auto_calculate_position_leverage"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_calculate_position_leverage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_calculate_position_leverage"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_position_margin"("p_asset_class" "text", "p_symbol" "text", "p_position_value" numeric, "p_leverage" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_position_margin"("p_asset_class" "text", "p_symbol" "text", "p_position_value" numeric, "p_leverage" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_position_margin"("p_asset_class" "text", "p_symbol" "text", "p_position_value" numeric, "p_leverage" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_position_pnl"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_position_pnl"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_position_pnl"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_position_pnl_realtime"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_position_pnl_realtime"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_position_pnl_realtime"("p_direction" "text", "p_entry_price" numeric, "p_current_price" numeric, "p_units" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_realtime_pnl"("p_position_id" "uuid", "p_new_price" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_realtime_pnl"("p_position_id" "uuid", "p_new_price" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_realtime_pnl"("p_position_id" "uuid", "p_new_price" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."execute_market_order"("p_order_id" "uuid", "p_execution_price" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."execute_market_order"("p_order_id" "uuid", "p_execution_price" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."execute_market_order"("p_order_id" "uuid", "p_execution_price" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_kyc_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_kyc_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_kyc_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_account_metrics"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_account_metrics"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_account_metrics"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_market_data_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_market_data_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_market_data_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_orders_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_orders_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_orders_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_position_leverage"("p_position_id" "uuid", "p_leverage" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_position_leverage"("p_position_id" "uuid", "p_leverage" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_position_leverage"("p_position_id" "uuid", "p_leverage" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_position_pnl"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_position_pnl"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_position_pnl"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_position_realtime"("p_position_id" "uuid", "p_new_price" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_position_realtime"("p_position_id" "uuid", "p_new_price" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_position_realtime"("p_position_id" "uuid", "p_new_price" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_positions_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_positions_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_positions_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."account_metrics" TO "anon";
GRANT ALL ON TABLE "public"."account_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."account_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON TABLE "public"."asset_leverage_config" TO "anon";
GRANT ALL ON TABLE "public"."asset_leverage_config" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_leverage_config" TO "service_role";



GRANT ALL ON TABLE "public"."assets" TO "anon";
GRANT ALL ON TABLE "public"."assets" TO "authenticated";
GRANT ALL ON TABLE "public"."assets" TO "service_role";



GRANT ALL ON TABLE "public"."historical_market_data" TO "anon";
GRANT ALL ON TABLE "public"."historical_market_data" TO "authenticated";
GRANT ALL ON TABLE "public"."historical_market_data" TO "service_role";



GRANT ALL ON TABLE "public"."kyc_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."kyc_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."kyc_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."kyc_documents" TO "anon";
GRANT ALL ON TABLE "public"."kyc_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."kyc_documents" TO "service_role";



GRANT ALL ON TABLE "public"."margin_calculations" TO "anon";
GRANT ALL ON TABLE "public"."margin_calculations" TO "authenticated";
GRANT ALL ON TABLE "public"."margin_calculations" TO "service_role";



GRANT ALL ON TABLE "public"."market_data" TO "anon";
GRANT ALL ON TABLE "public"."market_data" TO "authenticated";
GRANT ALL ON TABLE "public"."market_data" TO "service_role";



GRANT ALL ON TABLE "public"."order_history" TO "anon";
GRANT ALL ON TABLE "public"."order_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_history" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."position_history" TO "anon";
GRANT ALL ON TABLE "public"."position_history" TO "authenticated";
GRANT ALL ON TABLE "public"."position_history" TO "service_role";



GRANT ALL ON TABLE "public"."position_updates" TO "anon";
GRANT ALL ON TABLE "public"."position_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."position_updates" TO "service_role";



GRANT ALL ON TABLE "public"."positions" TO "anon";
GRANT ALL ON TABLE "public"."positions" TO "authenticated";
GRANT ALL ON TABLE "public"."positions" TO "service_role";



GRANT ALL ON TABLE "public"."price_alerts" TO "anon";
GRANT ALL ON TABLE "public"."price_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."price_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."risk_metrics" TO "anon";
GRANT ALL ON TABLE "public"."risk_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."trade_analytics" TO "anon";
GRANT ALL ON TABLE "public"."trade_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."trading_orders" TO "anon";
GRANT ALL ON TABLE "public"."trading_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."trading_orders" TO "service_role";



GRANT ALL ON TABLE "public"."trading_positions" TO "anon";
GRANT ALL ON TABLE "public"."trading_positions" TO "authenticated";
GRANT ALL ON TABLE "public"."trading_positions" TO "service_role";



GRANT ALL ON TABLE "public"."user_account" TO "anon";
GRANT ALL ON TABLE "public"."user_account" TO "authenticated";
GRANT ALL ON TABLE "public"."user_account" TO "service_role";



GRANT ALL ON TABLE "public"."user_portfolio" TO "anon";
GRANT ALL ON TABLE "public"."user_portfolio" TO "authenticated";
GRANT ALL ON TABLE "public"."user_portfolio" TO "service_role";



GRANT ALL ON TABLE "public"."user_trades" TO "anon";
GRANT ALL ON TABLE "public"."user_trades" TO "authenticated";
GRANT ALL ON TABLE "public"."user_trades" TO "service_role";



GRANT ALL ON TABLE "public"."user_watchlist" TO "anon";
GRANT ALL ON TABLE "public"."user_watchlist" TO "authenticated";
GRANT ALL ON TABLE "public"."user_watchlist" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
