/**
 * Core trade types and interfaces for the trading system
 */

// Asset categories supported by the platform
export type AssetCategory = 'Crypto' | 'Forex' | 'Stocks' | 'Commodities';

// Trade direction types
export type TradeDirection = 'buy' | 'sell';

// Order types supported by the platform
export type OrderType = 'market' | 'entry';

// Trade status types
export type TradeStatus = 'open' | 'pending' | 'closed' | 'cancelled' | 'failed';

// Risk validation error types
export enum TradeValidationErrorType {
  AUTHENTICATION = 'authentication',
  INPUT = 'input',
  FUNDS = 'funds',
  MARKET = 'market',
  RISK = 'risk'
}

// Base trade interface with common properties
export interface TradeBase {
  symbol: string;
  assetCategory: AssetCategory;
  direction: TradeDirection;
  units: number;
  currentPrice: number;
  userId: string;
}

// Risk parameters for trade validation
export interface RiskParameters {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxLeverage: number;
  marginRequirement: number;
}

// Trade validation result
export interface TradeValidationResult {
  valid: boolean;
  errorType?: TradeValidationErrorType;
  message?: string;
}

// Market order parameters
export interface MarketOrderParams extends TradeBase {
  stopLoss?: number;
  takeProfit?: number;
}

// Entry order parameters
export interface EntryOrderParams extends TradeBase {
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: string;
}