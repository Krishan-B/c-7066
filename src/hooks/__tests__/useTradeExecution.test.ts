
import { renderHook, act, waitFor } from '@/utils/test-utils';
import { useTradeExecution } from '../useTradeExecution';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('@/services/trades/orders/marketOrders', () => ({
  executeMarketOrder: jest.fn().mockImplementation(() => Promise.resolve({
    success: true,
    message: 'Trade executed successfully',
    tradeId: 'mock-trade-id'
  }))
}));

jest.mock('@/services/trades/orders/entryOrders', () => ({
  placeEntryOrder: jest.fn().mockImplementation(() => Promise.resolve({
    success: true,
    message: 'Entry order placed successfully',
    tradeId: 'mock-entry-order-id'
  }))
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

describe('useTradeExecution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should execute market order', async () => {
    const { result } = renderHook(() => useTradeExecution());

    let tradeResult;
    await act(async () => {
      tradeResult = await result.current.executeTrade({
        symbol: 'BTCUSD',
        direction: 'buy',
        orderType: 'market',
        units: 1,
        currentPrice: 50000,
        assetCategory: 'Crypto'
      });
    });

    const { executeMarketOrder } = require('@/services/trades/orders/marketOrders');
    expect(executeMarketOrder).toHaveBeenCalledTimes(1);
    expect(tradeResult?.success).toBe(true);
  });
  
  test('should place entry order', async () => {
    const { result } = renderHook(() => useTradeExecution());

    let tradeResult;
    await act(async () => {
      tradeResult = await result.current.executeTrade({
        symbol: 'BTCUSD',
        direction: 'buy',
        orderType: 'entry',
        units: 1,
        currentPrice: 50000,
        entryPrice: 49000,
        assetCategory: 'Crypto'
      });
    });

    const { placeEntryOrder } = require('@/services/trades/orders/entryOrders');
    expect(placeEntryOrder).toHaveBeenCalledTimes(1);
    expect(tradeResult?.success).toBe(true);
  });
});
