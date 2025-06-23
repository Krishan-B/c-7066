# Trading Engine Feature Build Request

## Overview

Build a comprehensive simulated trading (paper trading) engine with real-time position management,
order execution, and account metrics tracking.

## Core Requirements

### 1. Order Management System

- **Order Types**: Market Orders (immediate execution) and Entry Orders (pending with target price)
- **Order States**: Route Market Orders → Open Positions, Entry Orders → Pending Orders
- **Order Processing**: Real-time validation, execution simulation, and state management
- **Order History**: Complete audit trail with timestamps and status changes

### 2. Position Management with Asset-Specific Leverage

Implement fixed leverage ratios by asset class:

- **Stocks**: 20:1 leverage (5% margin requirement)
- **Indices**: 50:1 leverage (2% margin requirement)
- **Commodities**: 50:1 leverage (2% margin requirement)
- **Forex**: 100:1 leverage (1% margin requirement)
- **Crypto**: 50:1 leverage (2% margin requirement)

### 3. Real-Time Financial Metrics Dashboard

Calculate and display these metrics in real-time:

- **Unrealized P&L**: Live calculation across all open positions
- **Margin Level**: Equity/Used Margin × 100 (trigger alerts at <1%)
- **Account Balance**: Deposits + Realized P&L
- **Available Funds**: Balance + Bonus - Used Margin
- **Used Margin**: Total margin locked in positions
- **Exposure**: Total market value of open positions
- **Account Equity**: Balance + Unrealized P&L

### 4. Trading Panel UI Components

- **Left-side sliding panel** triggered from:
  - "Trade" button on watchlist assets
  - "New Trade" button on dashboard
- **Panel Features**:
  - Asset selection with auto-leverage application
  - Real-time buy/sell price display
  - Order type selection (Market/Entry)
  - Take Profit/Stop Loss inputs with real-time calculations
  - Trade direction buttons (Buy/Sell)
  - Order size validation against available funds

### 5. Position Management Interface

Create tabbed interface with:

- **Open Positions**: Real-time P&L, TP/SL levels, Close buttons
- **Pending Orders**: Entry orders with expiration tracking
- **Order History**: Completed trades with P&L records

### 6. Market Hours Enforcement

Implement asset-specific trading hours:

- **Stocks**: 9:30 AM - 4:00 PM ET (weekdays only)
- **Forex**: 24/5 (Sunday 5 PM - Friday 5 PM ET)
- **Crypto**: 24/7
- Disable trading outside market hours with status indicators

## Technical Implementation Details

### API Endpoints Required

```
POST /api/orders/market - Place market order
POST /api/orders/entry - Place entry order
DELETE /api/orders/{id} - Cancel pending order
POST /api/positions/{id}/close - Close position
GET /api/account/metrics - Get financial metrics
GET /api/orders/open - List open positions
GET /api/orders/pending - List pending orders
```

### WebSocket Events

- Position P&L updates
- Account metrics changes
- Order status changes
- TP/SL triggers
- Market hours notifications

### P&L Calculation Logic

```javascript
// Buy positions: (Current Price - Entry Price) × Size
// Sell positions: (Entry Price - Current Price) × Size
// Real-time updates based on live price feeds
```

### Default TP/SL Calculations

- **Stocks**: TP +5%, SL -3%
- **Indices**: TP +3%, SL -2%
- **Commodities**: TP +4%, SL -3%
- **Forex**: TP +2%, SL -1%
- **Crypto**: TP +8%, SL -5%

## UI/UX Requirements

### Visual Indicators

- **Green/Red P&L** with real-time color changes
- **Margin Level warnings** when approaching 1%
- **Market status indicators** (Open/Closed)
- **Loading states** for order execution

### Performance Optimizations

- **Optimistic UI updates** before server confirmation
- **Throttled price updates** to balance performance
- **WebSocket reconnection** strategies
- **Incremental metrics calculation**

## Validation & Risk Management

- **Pre-trade validation**: Check available funds before execution
- **Position size limits**: Prevent over-leveraging
- **Margin call alerts**: Notify at <1% margin level (no auto-liquidation)
- **Order expiration**: Automatic cancellation of expired entry orders

## Data Models Required

- **Position**: symbol, direction, size, entryPrice, marginRequired, tp, sl
- **Order**: type, status, symbol, size, targetPrice, expiration
- **Account**: balance, bonus, realizedPnL, positions[]

## Recommendations

1. **Use React Query** for efficient data fetching and caching
2. **Implement WebSocket** with automatic reconnection
3. **Add confirmation modals** for position closures
4. **Include trade simulation mode** for testing
5. **Add export functionality** for trade history
6. **Implement responsive design** for mobile trading
7. **Add sound notifications** for TP/SL triggers
8. **Include position sizing calculator** in trading panel

Build this as a complete, production-ready trading simulation engine with emphasis on real-time
updates, accurate financial calculations, and intuitive user experience.
