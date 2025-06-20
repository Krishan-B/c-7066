import { describe, it, expect } from 'vitest';
import { type Trade } from '../../../client/src/hooks/trades/types';
import { ORDER_TYPES } from '../../../client/src/types/schema';

describe('Trade Types', () => {
  it('should allow creating a properly typed trade object', () => {
    const trade: Trade = {
      id: '123',
      asset_symbol: 'BTC',
      asset_name: 'Bitcoin',
      market_type: 'crypto',
      units: 1,
      price_per_unit: 50000,
      total_amount: 50000,
      trade_type: 'buy',
      order_type: ORDER_TYPES.MARKET,
      status: 'open',
      stop_loss: 49000,
      take_profit: 51000,
      expiration_date: null,
      created_at: '2025-06-18T00:00:00.000Z',
      executed_at: '2025-06-18T00:00:00.000Z',
      closed_at: null,
      pnl: null
    };
    
    expect(trade.market_type).toBe('crypto');
    expect(trade.order_type).toBe('market');
  });
});
