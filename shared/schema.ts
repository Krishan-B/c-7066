/**
 * Shared schema definitions for both client and server
 */

import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator']);
export const assetClassEnum = pgEnum('asset_class', [
  'crypto',
  'stock',
  'forex',
  'commodity',
  'index',
]);
export const orderTypeEnum = pgEnum('order_type', ['market', 'limit', 'stop', 'stop_limit']);
export const directionEnum = pgEnum('direction', ['buy', 'sell']);
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'filled',
  'cancelled',
  'rejected',
  'partial',
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
  change: real('change'),
  changePercent: real('change_percent'),
  exchange: text('exchange'),
  isActive: boolean('is_active').default(true).notNull(),
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

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Market = typeof markets.$inferSelect;
export type NewMarket = typeof markets.$inferInsert;

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
