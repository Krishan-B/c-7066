/**
 * @jest-environment jsdom
 */
/// <reference types="jest" />

import { renderHook } from '@testing-library/react';
import { useTradeExecution, type TradeParams } from '../useTradeExecution';
import { describe, it, beforeEach, expect, vi } from 'vitest';

// Mock the dependencies using Vitest's vi.mock
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'test-user' } }) }));
vi.mock('@/services/trades/orders/marketOrders', () => ({ executeMarketOrder: vi.fn() }));
vi.mock('@/services/trades/orders/entryOrders', () => ({ placeEntryOrder: vi.fn() }));
vi.mock('@/services/trades/accountService', () => ({ calculateMarginRequired: vi.fn(() => 100) }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

describe('useTradeExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide executeTrade function and isExecuting state', () => {
    const { result } = renderHook(() => useTradeExecution());

    expect(result.current.executeTrade).toBeDefined();
    expect(result.current.isExecuting).toBe(false);
  });

  it('should handle trade parameters correctly', async () => {
    const { result } = renderHook(() => useTradeExecution());

    const tradeParams: TradeParams = {
      symbol: 'BTC-USD',
      assetCategory: 'crypto',
      direction: 'buy',
      orderType: 'market',
      units: 1,
      currentPrice: 50000
    };

    // Test that the function can be called with valid parameters
    expect(() => result.current.executeTrade(tradeParams)).not.toThrow();
  });
});
