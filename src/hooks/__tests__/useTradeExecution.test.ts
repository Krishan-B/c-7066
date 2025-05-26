
/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useTradeExecution, TradeParams } from '../useTradeExecution';

// Mock the dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/services/trades/orders/marketOrders');
jest.mock('@/services/trades/orders/entryOrders');
jest.mock('@/services/trades/accountService');
jest.mock('sonner');

describe('useTradeExecution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
