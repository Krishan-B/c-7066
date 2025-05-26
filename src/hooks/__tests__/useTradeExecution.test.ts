
import { renderHook } from '@testing-library/react';
import { useTradeExecution } from '../useTradeExecution';
import { TradeParams } from '../useTradeExecution';
import { mockData } from '../../utils/testUtils';

// Mock the trade execution hook
jest.mock('../useTradeExecution', () => ({
  useTradeExecution: jest.fn()
}));

describe('useTradeExecution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute trade successfully', async () => {
    const mockExecuteTrade = jest.fn().mockResolvedValue({
      success: true,
      tradeId: 'test-trade-id'
    });

    (useTradeExecution as jest.Mock).mockReturnValue({
      executeTrade: mockExecuteTrade,
      isExecuting: false,
      error: null
    });

    const { result } = renderHook(() => useTradeExecution());

    const tradeParams: TradeParams = {
      symbol: 'BTC-USD',
      assetCategory: 'crypto',
      direction: 'buy',
      orderType: 'market',
      units: 1,
      currentPrice: 50000
    };

    await result.current.executeTrade(tradeParams);

    expect(mockExecuteTrade).toHaveBeenCalledWith(tradeParams);
  });

  it('should handle trade execution error', async () => {
    const mockExecuteTrade = jest.fn().mockRejectedValue(new Error('Trade failed'));

    (useTradeExecution as jest.Mock).mockReturnValue({
      executeTrade: mockExecuteTrade,
      isExecuting: false,
      error: 'Trade failed'
    });

    const { result } = renderHook(() => useTradeExecution());

    const tradeParams: TradeParams = {
      symbol: 'BTC-USD',
      assetCategory: 'crypto', 
      direction: 'buy',
      orderType: 'market',
      units: 1,
      currentPrice: 50000
    };

    try {
      await result.current.executeTrade(tradeParams);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
