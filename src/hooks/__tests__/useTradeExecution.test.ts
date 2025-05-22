
import { renderHook, act } from '@testing-library/react';
import { useTradeExecution } from '../useTradeExecution';
import * as mockData from '../../utils/testUtils';

// Mock API calls
jest.mock('../../services/tradeService', () => ({
  executeTrade: jest.fn().mockImplementation(() => Promise.resolve({
    success: true,
    tradeId: 'mock-trade-id',
    message: 'Trade executed successfully'
  })),
  cancelTrade: jest.fn().mockImplementation(() => Promise.resolve({
    success: true,
    message: 'Trade cancelled successfully'
  }))
}));

describe('useTradeExecution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should execute a trade successfully', async () => {
    const { result } = renderHook(() => useTradeExecution());
    
    const mockTradeParams = {
      symbol: 'BTCUSD',
      direction: 'buy',
      units: 0.1,
      price: 50000
    };
    
    await act(async () => {
      await result.current.executeTrade(mockTradeParams);
    });
    
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.lastTrade).toEqual({
      success: true,
      tradeId: 'mock-trade-id',
      message: 'Trade executed successfully'
    });
    expect(result.current.error).toBeNull();
  });

  test('should handle trade execution error', async () => {
    const mockError = new Error('Trade execution failed');
    
    // Type assertion to access the mocked module
    const tradeService = require('../../services/tradeService') as jest.Mocked<typeof import('../../services/tradeService')>;
    tradeService.executeTrade.mockRejectedValueOnce(mockError);
    
    const { result } = renderHook(() => useTradeExecution());
    
    await act(async () => {
      await result.current.executeTrade({
        symbol: 'BTCUSD',
        direction: 'buy',
        units: 0.1,
        price: 50000
      });
    });
    
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toEqual('Trade execution failed');
  });
});
