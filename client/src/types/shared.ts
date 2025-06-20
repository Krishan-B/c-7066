/**
 * Re-exports of database schema enums as TypeScript types for frontend use
 */

// Import from shared schema or recreate for frontend use
export type UserRoleEnum = 'user' | 'admin' | 'moderator';
export type AssetClassEnum =
  | 'crypto'
  | 'stock'
  | 'forex'
  | 'commodity'
  | 'index'
  | 'etf'
  | 'bond'
  | 'futures'
  | 'option';
export type OrderTypeEnum =
  | 'market'
  | 'limit'
  | 'stop'
  | 'stop_limit'
  | 'trailing_stop'
  | 'take_profit'
  | 'fill_or_kill'
  | 'immediate_or_cancel';
export type DirectionEnum = 'buy' | 'sell';
export type OrderStatusEnum =
  | 'pending'
  | 'filled'
  | 'cancelled'
  | 'rejected'
  | 'partial'
  | 'expired'
  | 'triggered'
  | 'suspended';
export type TimeframeEnum = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
export type TransactionTypeEnum =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'fee'
  | 'interest'
  | 'dividend'
  | 'bonus';
export type TransactionStatusEnum = 'pending' | 'completed' | 'failed' | 'cancelled';

// Additional simplified types for component props
export type ChartTimeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
export type TradeSide = 'buy' | 'sell';
export type TradeSize = 'sm' | 'md' | 'lg';
export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type NotificationType = 'transaction' | 'trade' | 'system' | 'news' | 'price';
