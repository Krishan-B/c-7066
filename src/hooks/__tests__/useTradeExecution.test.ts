
import { renderHook } from '@/utils/test-utils';
import { useTradeExecution } from '../useTradeExecution';
import { act } from 'react-dom/test-utils';

// Mock dependencies
jest.mock('@/services/trades/orders/marketOrders', () => ({
  executeMarketOrder: jest.fn().mockResolvedValue({
    success: true,
    message: 'Trade executed successfully',
    tradeId: 'mock-trade-id'
  })
}));

jest.mock('@/services/trades/orders/entryOrders', () => ({
  placeEntryOrder: jest.fn().mockResolvedValue({
    success: true,
    message: 'Entry order placed successfully',
    tradeId: 'mock-entry-order-id'
  })
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user' }
  }))
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/services/trades/accountService', () => ({
  calculateMarginRequired: jest.fn((assetCategory, totalAmount) => totalAmount / 50)
}));

describe('useTradeExecution', () => {
  const mockTradeParams = {
    symbol: 'BTCUSD',
    assetCategory: 'Crypto',
    direction: 'buy' as const,
    orderType: 'market' as const,
    units: 0.1,
    currentPrice: 50000
  };
  
  const mockEntryParams = {
    ...mockTradeParams,
    orderType: 'entry' as const,
    entryPrice: 48000
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should execute market order successfully', async () => {
    const { result } = renderHook(() => useTradeExecution());
    
    let tradeResult;
    await act(async () => {
      tradeResult = await result.current.executeTrade(mockTradeParams);
    });
    
    // Check if the mock was called
    const { executeMarketOrder } = require('@/services/trades/orders/marketOrders');
    expect(executeMarketOrder).toHaveBeenCalledWith(expect.objectContaining({
      symbol: 'BTCUSD',
      direction: 'buy',
      units: 0.1,
      currentPrice: 50000,
      userId: 'test-user'
    }));
    
    // Check return value
    expect(tradeResult).toEqual({
      success: true,
      message: 'Trade executed successfully',
      tradeId: 'mock-trade-id'
    });
    
    // Check toast was called
    const { toast } = require('sonner');
    expect(toast.success).toHaveBeenCalledWith('Trade executed successfully');
  });
  
  test('should place entry order successfully', async () => {
    const { result } = renderHook(() => useTradeExecution());
    
    let tradeResult;
    await act(async () => {
      tradeResult = await result.current.executeTrade(mockEntryParams);
    });
    
    // Check if the mock was called
    const { placeEntryOrder } = require('@/services/trades/orders/entryOrders');
    expect(placeEntryOrder).toHaveBeenCalledWith(expect.objectContaining({
      symbol: 'BTCUSD',
      direction: 'buy',
      units: 0.1,
      currentPrice: 50000,
      entryPrice: 48000,
      userId: 'test-user'
    }));
    
    // Check return value
    expect(tradeResult).toEqual({
      success: true,
      message: 'Entry order placed successfully',
      tradeId: 'mock-entry-order-id'
    });
  });
  
  test('should handle validation error when units is zero', async () => {
    const { result } = renderHook(() => useTradeExecution());
    
    let tradeResult;
    await act(async () => {
      tradeResult = await result.current.executeTrade({ ...mockTradeParams, units: 0 });
    });
    
    // Check return value
    expect(tradeResult).toEqual({
      success: false,
      message: 'Trade units must be greater than zero'
    });
    
    // Check toast was called
    const { toast } = require('sonner');
    expect(toast.error).toHaveBeenCalledWith('Trade units must be greater than zero');
  });
  
  test('should handle authentication error when user is not signed in', async () => {
    // Mock the user to be null
    require('@/hooks/useAuth').useAuth.mockReturnValueOnce({ user: null });
    
    const { result } = renderHook(() => useTradeExecution());
    
    let tradeResult;
    await act(async () => {
      tradeResult = await result.current.executeTrade(mockTradeParams);
    });
    
    // Check return value
    expect(tradeResult).toEqual({
      success: false,
      message: 'Authentication required'
    });
    
    // Check toast was called
    const { toast } = require('sonner');
    expect(toast.error).toHaveBeenCalledWith('You must be signed in to execute trades');
  });
});
