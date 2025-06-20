/**
 * Shared schema definitions for both client and server
 * Updated for Database Schema Alignment - Phase 0
 * Date: June 19, 2025
 */

import {
  boolean,
  decimal,
  integer,
  bigint,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
  date,
  jsonb,
} from 'drizzle-orm/pg-core';

// ============================================================================
// Enums - Updated to match new database schema
// ============================================================================
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator']);

export const assetClassEnum = pgEnum('asset_class', [
  'FOREX',
  'STOCKS',
  'INDICES',
  'COMMODITIES',
  'CRYPTO',
]);

export const orderTypeEnum = pgEnum('order_type', ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT']);

export const directionEnum = pgEnum('direction', ['BUY', 'SELL']);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'FILLED',
  'PARTIALLY_FILLED',
  'CANCELLED',
  'REJECTED',
  'EXPIRED',
]);

export const positionSideEnum = pgEnum('position_side', ['LONG', 'SHORT']);

export const experienceLevelEnum = pgEnum('experience_level', [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
]);

export const riskToleranceEnum = pgEnum('risk_tolerance', ['LOW', 'MEDIUM', 'HIGH']);

export const kycStatusEnum = pgEnum('kyc_status', [
  'not_started',
  'pending',
  'approved',
  'rejected',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'not_uploaded',
  'pending',
  'approved',
  'rejected',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'ID_PASSPORT',
  'ID_FRONT',
  'ID_BACK',
  'DRIVERS_LICENSE',
  'OTHER_ID',
  'UTILITY_BILL',
  'BANK_STATEMENT',
  'CREDIT_CARD_STATEMENT',
  'TAX_BILL',
  'OTHER_ADDRESS',
  'OTHER_DOC',
]);

export const documentCategoryEnum = pgEnum('document_category', [
  'ID_VERIFICATION',
  'ADDRESS_VERIFICATION',
  'OTHER_DOCUMENTATION',
]);

export const timeInForceEnum = pgEnum('time_in_force', [
  'GTC', // Good Till Cancelled
  'GTD', // Good Till Date
  'IOC', // Immediate or Cancel
  'FOK', // Fill or Kill
]);

export const timeframeEnum = pgEnum('timeframe', [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1d',
  '1w',
  '1M',
]);
export const transactionTypeEnum = pgEnum('transaction_type', [
  'deposit',
  'withdrawal',
  'transfer',
  'fee',
  'interest',
  'dividend',
  'bonus',
]);
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'completed',
  'failed',
  'cancelled',
]);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: userRoleEnum('role').default('user').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const markets = pgTable('markets', {
  id: uuid('id').primaryKey().defaultRandom(),
  symbol: text('symbol').notNull().unique(),
  name: text('name').notNull(),
  assetClass: assetClassEnum('asset_class').notNull(),
  currentPrice: real('current_price').notNull(),
  previousClose: real('previous_close'),
  open: real('open'),
  high: real('high'),
  low: real('low'),
  volume: real('volume'),
  change: real('change'),
  changePercent: real('change_percent'),
  exchange: text('exchange'),
  currency: text('currency').default('USD').notNull(),
  marketCap: real('market_cap'),
  peRatio: real('pe_ratio'),
  dividend: real('dividend'),
  dividendYield: real('dividend_yield'),
  beta: real('beta'),
  isActive: boolean('is_active').default(true).notNull(),
  tradingHours: text('trading_hours'),
  dataSource: text('data_source'),
  lastUpdated: timestamp('last_updated'),
});

export const positions = pgTable('positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  marketId: uuid('market_id')
    .references(() => markets.id)
    .notNull(),
  direction: directionEnum('direction').notNull(),
  entryPrice: real('entry_price').notNull(),
  currentPrice: real('current_price').notNull(),
  quantity: real('quantity').notNull(),
  leverage: integer('leverage').default(1).notNull(),
  unrealizedPnl: real('unrealized_pnl'),
  realizedPnl: real('realized_pnl').default(0).notNull(),
  stopLoss: real('stop_loss'),
  takeProfit: real('take_profit'),
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  marketId: uuid('market_id')
    .references(() => markets.id)
    .notNull(),
  positionId: uuid('position_id').references(() => positions.id),
  direction: directionEnum('direction').notNull(),
  orderType: orderTypeEnum('order_type').notNull(),
  price: real('price'),
  quantity: real('quantity').notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  executionPrice: real('execution_price'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  executedAt: timestamp('executed_at'),
});

export const financialProfiles = pgTable('financial_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  incomeRange: text('income_range'),
  netWorth: text('net_worth'),
  riskTolerance: text('risk_tolerance'),
  investmentExperience: text('investment_experience'),
  taxResidency: text('tax_residency'),
  sourceOfFunds: text('source_of_funds'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  currency: text('currency').notNull(),
  balance: real('balance').default(0).notNull(),
  lockedAmount: real('locked_amount').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// New Database Tables - Phase 0 Schema Alignment
// ============================================================================

// KYC Documents Table
export const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  documentType: documentTypeEnum('document_type').notNull(),
  category: documentCategoryEnum('category').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: bigint('file_size', { mode: 'number' }),
  mimeType: varchar('mime_type', { length: 100 }),
  status: documentStatusEnum('status').default('pending').notNull(),
  comments: text('comments'),
  rejectionReason: text('rejection_reason'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// KYC Status Table
export const kycStatus = pgTable('kyc_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  overallStatus: kycStatusEnum('overall_status').default('not_started').notNull(),
  idVerificationStatus: documentStatusEnum('id_verification_status')
    .default('not_uploaded')
    .notNull(),
  addressVerificationStatus: documentStatusEnum('address_verification_status')
    .default('not_uploaded')
    .notNull(),
  otherDocumentsStatus: documentStatusEnum('other_documents_status')
    .default('not_uploaded')
    .notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Assets Master Table
export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  symbol: varchar('symbol', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  assetClass: assetClassEnum('asset_class').notNull(),
  baseCurrency: varchar('base_currency', { length: 3 }),
  quoteCurrency: varchar('quote_currency', { length: 3 }),
  isActive: boolean('is_active').default(true).notNull(),
  leverageMax: integer('leverage_max').default(1).notNull(),
  minTradeSize: decimal('min_trade_size', { precision: 18, scale: 8 }).default('0.01').notNull(),
  maxTradeSize: decimal('max_trade_size', { precision: 18, scale: 8 }).default('1000000').notNull(),
  spreadBase: decimal('spread_base', { precision: 8, scale: 5 }).default('0.00001').notNull(),
  contractSize: decimal('contract_size', { precision: 15, scale: 2 }).default('1.00').notNull(),
  tradingHours: jsonb('trading_hours'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Market Data Table
export const marketData = pgTable('market_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id')
    .references(() => assets.id)
    .notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  price: decimal('price', { precision: 18, scale: 8 }).notNull(),
  bidPrice: decimal('bid_price', { precision: 18, scale: 8 }),
  askPrice: decimal('ask_price', { precision: 18, scale: 8 }),
  volume: decimal('volume', { precision: 18, scale: 8 }),
  high24h: decimal('high_24h', { precision: 18, scale: 8 }),
  low24h: decimal('low_24h', { precision: 18, scale: 8 }),
  change24h: decimal('change_24h', { precision: 18, scale: 8 }),
  changePercentage24h: decimal('change_percentage_24h', { precision: 8, scale: 4 }),
  marketCap: decimal('market_cap', { precision: 20, scale: 2 }),
  dataSource: varchar('data_source', { length: 50 }).default('yahoo_finance').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Enhanced User Profiles Table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  country: varchar('country', { length: 100 }),
  city: varchar('city', { length: 100 }),
  address: text('address'),
  postalCode: varchar('postal_code', { length: 20 }),
  experienceLevel: experienceLevelEnum('experience_level').default('BEGINNER').notNull(),
  riskTolerance: riskToleranceEnum('risk_tolerance').default('MEDIUM').notNull(),
  preferredAssetClasses: text('preferred_asset_classes').array(),
  tradingGoals: text('trading_goals'),
  incomeRange: text('income_range'),
  netWorth: text('net_worth'),
  investmentExperience: text('investment_experience'),
  taxResidency: varchar('tax_residency', { length: 100 }),
  sourceOfFunds: text('source_of_funds'),
  notificationPreferences: jsonb('notification_preferences').default('{}'),
  preferredCurrency: varchar('preferred_currency', { length: 3 }).default('USD'),
  timezone: varchar('timezone', { length: 50 }),
  language: varchar('language', { length: 10 }).default('en'),
  marketingConsent: boolean('marketing_consent').default(false),
  dataProcessingConsent: boolean('data_processing_consent').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Enhanced Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  assetId: uuid('asset_id')
    .references(() => assets.id)
    .notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  orderType: orderTypeEnum('order_type').notNull(),
  side: directionEnum('side').notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 8 }).notNull(),
  price: decimal('price', { precision: 18, scale: 8 }),
  stopPrice: decimal('stop_price', { precision: 18, scale: 8 }),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  filledQuantity: decimal('filled_quantity', { precision: 18, scale: 8 }).default('0').notNull(),
  avgFillPrice: decimal('avg_fill_price', { precision: 18, scale: 8 }),
  commission: decimal('commission', { precision: 18, scale: 8 }).default('0').notNull(),
  leverage: integer('leverage').default(1).notNull(),
  marginRequired: decimal('margin_required', { precision: 18, scale: 8 }),
  takeProfit: decimal('take_profit', { precision: 18, scale: 8 }),
  stopLoss: decimal('stop_loss', { precision: 18, scale: 8 }),
  timeInForce: timeInForceEnum('time_in_force').default('GTC').notNull(),
  expiresAt: timestamp('expires_at'),
  filledAt: timestamp('filled_at'),
  cancelledAt: timestamp('cancelled_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Enhanced Positions Table
export const enhancedPositions = pgTable('positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  assetId: uuid('asset_id')
    .references(() => assets.id)
    .notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  side: positionSideEnum('side').notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 8 }).notNull(),
  entryPrice: decimal('entry_price', { precision: 18, scale: 8 }).notNull(),
  currentPrice: decimal('current_price', { precision: 18, scale: 8 }),
  leverage: integer('leverage').default(1).notNull(),
  marginRequired: decimal('margin_required', { precision: 18, scale: 8 }),
  unrealizedPnl: decimal('unrealized_pnl', { precision: 18, scale: 8 }).default('0').notNull(),
  realizedPnl: decimal('realized_pnl', { precision: 18, scale: 8 }).default('0').notNull(),
  rolloverCharges: decimal('rollover_charges', { precision: 18, scale: 8 }).default('0').notNull(),
  commission: decimal('commission', { precision: 18, scale: 8 }).default('0').notNull(),
  takeProfit: decimal('take_profit', { precision: 18, scale: 8 }),
  stopLoss: decimal('stop_loss', { precision: 18, scale: 8 }),
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trading Sessions Table
export const tradingSessions = pgTable('trading_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  sessionStart: timestamp('session_start').defaultNow().notNull(),
  sessionEnd: timestamp('session_end'),
  tradesCount: integer('trades_count').default(0).notNull(),
  totalVolume: decimal('total_volume', { precision: 18, scale: 8 }).default('0').notNull(),
  totalPnl: decimal('total_pnl', { precision: 18, scale: 8 }).default('0').notNull(),
  sessionDurationMinutes: integer('session_duration_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Legacy table references (keeping for compatibility)
// ============================================================================

export const legacyUsers = users;
export const legacyMarkets = markets;
export const legacyPositions = positions;
export const legacyOrders = orders;
export const legacyFinancialProfiles = financialProfiles;
export const legacyWallets = wallets;
export const legacyMarketData = marketData;
export const legacyTransactions = transactions;

// Composite types for related data
export type UserWithProfile = User & { profile?: FinancialProfile };
export type MarketWithData = Market & { historicalData?: MarketDataPoint[] };
export type PositionWithMarket = Position & { market: Market };

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
};

// Form Data Types
export type UserRegistrationForm = Omit<
  NewUser,
  'id' | 'passwordHash' | 'role' | 'isVerified' | 'createdAt' | 'updatedAt'
> & {
  password: string;
  confirmPassword: string;
};

export type OrderForm = Omit<
  NewOrder,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'executedAt' | 'executionPrice'
>;

export type MarketFilter = {
  assetClass?: (typeof assetClassEnum.enumValues)[number];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
};
