/**
 * Constants and type exports from the database schema
 */
import {
  assetClassEnum,
  directionEnum,
  orderStatusEnum,
  orderTypeEnum,
  timeframeEnum,
  userRoleEnum,
} from '../../shared/schema';

// Type exports
export type OrderTypeEnum = typeof orderTypeEnum._type;
export type AssetClassEnum = typeof assetClassEnum._type;
export type DirectionEnum = typeof directionEnum._type;
export type OrderStatusEnum = typeof orderStatusEnum._type;
export type TimeframeEnum = typeof timeframeEnum._type;
export type UserRoleEnum = typeof userRoleEnum._type;

// Constants for frequently used values
export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
  TRAILING_STOP: 'trailing_stop',
  TAKE_PROFIT: 'take_profit',
  FILL_OR_KILL: 'fill_or_kill',
  IMMEDIATE_OR_CANCEL: 'immediate_or_cancel',
  // Legacy value mapping
  ENTRY: 'limit',
} as const;
