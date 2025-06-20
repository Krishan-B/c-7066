-- COPY THE ENTIRE CONTENT BELOW INTO SUPABASE SQL EDITOR
-- =====================================================

-- Enhanced Trading Engine Database Schema
-- Date: June 19, 2025

-- Create orders table for order management
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK (
        asset_class IN (
            'FOREX',
            'STOCKS',
            'CRYPTO',
            'INDICES',
            'COMMODITIES'
        )
    ),
    order_type TEXT NOT NULL CHECK (
        order_type IN (
            'market',
            'limit',
            'stop',
            'stop_limit'
        )
    ),
    direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
    units DECIMAL(18, 8) NOT NULL CHECK (units > 0),
    requested_price DECIMAL(18, 8) NOT NULL CHECK (requested_price > 0),
    execution_price DECIMAL(18, 8),
    position_value DECIMAL(18, 2) NOT NULL,
    margin_required DECIMAL(18, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'filled',
            'cancelled',
            'rejected',
            'expired'
        )
    ),
    stop_loss DECIMAL(18, 8),
    take_profit DECIMAL(18, 8),
    expiration_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    executed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    rejected_reason TEXT
);

-- Create positions table for position tracking
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders (id),
    symbol TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK (
        asset_class IN (
            'FOREX',
            'STOCKS',
            'CRYPTO',
            'INDICES',
            'COMMODITIES'
        )
    ),
    direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
    units DECIMAL(18, 8) NOT NULL CHECK (units > 0),
    entry_price DECIMAL(18, 8) NOT NULL CHECK (entry_price > 0),
    current_price DECIMAL(18, 8) NOT NULL CHECK (current_price > 0),
    close_price DECIMAL(18, 8),
    position_value DECIMAL(18, 2) NOT NULL,
    margin_used DECIMAL(18, 2) NOT NULL,
    unrealized_pnl DECIMAL(18, 2) DEFAULT 0,
    realized_pnl DECIMAL(18, 2),
    stop_loss DECIMAL(18, 8),
    take_profit DECIMAL(18, 8),
    status TEXT NOT NULL DEFAULT 'open' CHECK (
        status IN ('open', 'closed', 'partial')
    ),
    opened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create position_history table for tracking position changes
CREATE TABLE IF NOT EXISTS public.position_history (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    position_id UUID NOT NULL REFERENCES public.positions (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (
        action IN (
            'opened',
            'modified',
            'closed',
            'stop_loss_triggered',
            'take_profit_triggered'
        )
    ),
    price DECIMAL(18, 8) NOT NULL,
    units DECIMAL(18, 8),
    pnl DECIMAL(18, 2),
    margin_impact DECIMAL(18, 2),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notes TEXT
);

-- Create trade_analytics table for performance tracking
CREATE TABLE IF NOT EXISTS public.trade_analytics (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    total_pnl DECIMAL(18, 2) DEFAULT 0,
    total_fees DECIMAL(18, 2) DEFAULT 0,
    net_pnl DECIMAL(18, 2) DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    avg_win DECIMAL(18, 2) DEFAULT 0,
    avg_loss DECIMAL(18, 2) DEFAULT 0,
    profit_factor DECIMAL(8, 4) DEFAULT 0,
    max_drawdown DECIMAL(18, 2) DEFAULT 0,
    sharpe_ratio DECIMAL(8, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create risk_metrics table for risk management
CREATE TABLE IF NOT EXISTS public.risk_metrics (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    total_exposure DECIMAL(18, 2) DEFAULT 0,
    used_margin DECIMAL(18, 2) DEFAULT 0,
    available_margin DECIMAL(18, 2) DEFAULT 0,
    margin_level DECIMAL(8, 4) DEFAULT 0,
    portfolio_var DECIMAL(18, 2) DEFAULT 0,
    max_position_size DECIMAL(18, 2) DEFAULT 0,
    correlation_risk DECIMAL(5, 2) DEFAULT 0,
    diversification_score DECIMAL(5, 2) DEFAULT 0,
    risk_score DECIMAL(5, 2) DEFAULT 0,
    last_calculated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status ON public.orders (user_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_symbol_created ON public.orders (symbol, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_positions_user_id_status ON public.positions (user_id, status);

CREATE INDEX IF NOT EXISTS idx_positions_symbol ON public.positions (symbol);

CREATE INDEX IF NOT EXISTS idx_position_history_position_id ON public.position_history (position_id);

CREATE INDEX IF NOT EXISTS idx_trade_analytics_user_period ON public.trade_analytics (
    user_id,
    period_start,
    period_end
);

CREATE INDEX IF NOT EXISTS idx_risk_metrics_user_calculated ON public.risk_metrics (user_id, last_calculated DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.position_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trade_analytics ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.risk_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders FOR
UPDATE USING (auth.uid () = user_id);

-- Create RLS policies for positions
CREATE POLICY "Users can view their own positions" ON public.positions FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert their own positions" ON public.positions FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update their own positions" ON public.positions FOR
UPDATE USING (auth.uid () = user_id);

-- Create RLS policies for position_history
CREATE POLICY "Users can view their own position history" ON public.position_history FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert their own position history" ON public.position_history FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Create RLS policies for trade_analytics
CREATE POLICY "Users can view their own trade analytics" ON public.trade_analytics FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert their own trade analytics" ON public.trade_analytics FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update their own trade analytics" ON public.trade_analytics FOR
UPDATE USING (auth.uid () = user_id);

-- Create RLS policies for risk_metrics
CREATE POLICY "Users can view their own risk metrics" ON public.risk_metrics FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert their own risk metrics" ON public.risk_metrics FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update their own risk metrics" ON public.risk_metrics FOR
UPDATE USING (auth.uid () = user_id);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_trade_analytics_updated_at 
    BEFORE UPDATE ON public.trade_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_last_updated 
    BEFORE UPDATE ON public.positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for calculating position P&L
CREATE OR REPLACE FUNCTION calculate_position_pnl(
    p_direction TEXT,
    p_entry_price DECIMAL(18, 8),
    p_current_price DECIMAL(18, 8),
    p_units DECIMAL(18, 8)
) RETURNS DECIMAL(18, 2) AS $$
BEGIN
    IF p_direction = 'buy' THEN
        RETURN (p_current_price - p_entry_price) * p_units;
    ELSE
        RETURN (p_entry_price - p_current_price) * p_units;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function for updating position P&L
CREATE OR REPLACE FUNCTION update_position_pnl()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic P&L calculation
CREATE TRIGGER calculate_position_pnl_trigger
    BEFORE UPDATE OF current_price ON public.positions
    FOR EACH ROW EXECUTE FUNCTION update_position_pnl();

-- Insert sample asset configurations (optional)
-- This helps with testing and provides reference data
INSERT INTO
    public.market_data (
        symbol,
        name,
        price,
        change_percentage,
        volume,
        market_type,
        last_price,
        high_price,
        low_price,
        open_price,
        previous_close
    )
VALUES (
        'EURUSD',
        'Euro/US Dollar',
        1.0850,
        0.25,
        '1000000',
        'FOREX',
        1.0850,
        1.0865,
        1.0820,
        1.0835,
        1.0825
    ),
    (
        'GBPUSD',
        'British Pound/US Dollar',
        1.2650,
        -0.15,
        '800000',
        'FOREX',
        1.2650,
        1.2680,
        1.2620,
        1.2665,
        1.2669
    ),
    (
        'USDJPY',
        'US Dollar/Japanese Yen',
        149.80,
        0.45,
        '1200000',
        'FOREX',
        149.80,
        150.20,
        149.45,
        149.60,
        149.13
    ),
    (
        'AAPL',
        'Apple Inc.',
        185.50,
        1.25,
        '45000000',
        'STOCKS',
        185.50,
        187.20,
        184.80,
        185.00,
        183.25
    ),
    (
        'TSLA',
        'Tesla Inc.',
        245.75,
        -2.15,
        '35000000',
        'STOCKS',
        245.75,
        252.40,
        244.60,
        251.20,
        251.60
    ),
    (
        'BTCUSD',
        'Bitcoin/US Dollar',
        42850.00,
        3.45,
        '2500000',
        'CRYPTO',
        42850.00,
        43200.00,
        41800.00,
        41950.00,
        41420.00
    ),
    (
        'ETHUSD',
        'Ethereum/US Dollar',
        2340.50,
        2.80,
        '1800000',
        'CRYPTO',
        2340.50,
        2385.00,
        2295.00,
        2310.00,
        2276.25
    ),
    (
        'SPX500',
        'S&P 500 Index',
        4785.25,
        0.85,
        '500000',
        'INDICES',
        4785.25,
        4798.50,
        4770.80,
        4775.00,
        4744.50
    ),
    (
        'GOLD',
        'Gold Spot',
        2045.80,
        -0.35,
        '150000',
        'COMMODITIES',
        2045.80,
        2055.20,
        2038.90,
        2052.40,
        2053.00
    ),
    (
        'OIL',
        'Crude Oil WTI',
        72.45,
        1.85,
        '180000',
        'COMMODITIES',
        72.45,
        73.20,
        71.80,
        71.15,
        71.14
    ) ON CONFLICT (symbol) DO
UPDATE
SET
    price = EXCLUDED.price,
    change_percentage = EXCLUDED.change_percentage,
    volume = EXCLUDED.volume,
    last_price = EXCLUDED.last_price,
    high_price = EXCLUDED.high_price,
    low_price = EXCLUDED.low_price,
    open_price = EXCLUDED.open_price,
    previous_close = EXCLUDED.previous_close,
    last_updated = NOW();

-- End of migration