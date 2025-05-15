
import { renderHook, act, waitFor } from '@/utils/test-utils';
import { useTradeManagement } from '../useTradeManagement';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user' }
  }))
}));

jest.mock('@/hooks/trades/tradeAPI', () => ({
  fetchTradesByStatus: jest.fn().mockImplementation((status) => {
    if (status === 'open') return Promise.resolve([{ id: 'open-1' }, { id: 'open-2' }]);
    if (status === 'pending') return Promise.resolve([{ id: 'pending-1' }]);
    if (Array.isArray(status) && status.includes('closed')) return Promise.resolve([{ id: 'closed-1' }]);
    return Promise.resolve([]);
  }),
  closeTradePosition: jest.fn().mockResolvedValue({ success: true }),
  cancelTradeOrder: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('@/hooks/trades/useTradeSubscription', () => ({
  useTradeSubscription: jest.fn()
}));

describe('useTradeManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should fetch trades on mount', async () => {
    const { result } = renderHook(() => useTradeManagement());
    
    // Initial state should be empty
    expect(result.current.openPositions).toEqual([]);
    
    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(result.current.openPositions.length).toBe(2);
      expect(result.current.pendingOrders.length).toBe(1);
      expect(result.current.closedTrades.length).toBe(1);
    });
  });
  
  test('should close a position', async () => {
    const { result } = renderHook(() => useTradeManagement());
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.openPositions.length).toBe(2);
    });
    
    // Call closePosition
    await act(async () => {
      await result.current.closePosition('open-1', 50000);
    });
    
    // Verify the mocked function was called
    const { closeTradePosition } = require('@/hooks/trades/tradeAPI');
    expect(closeTradePosition).toHaveBeenCalledWith('open-1', 50000);
  });
  
  test('should cancel an order', async () => {
    const { result } = renderHook(() => useTradeManagement());
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.pendingOrders.length).toBe(1);
    });
    
    // Call cancelOrder
    await act(async () => {
      await result.current.cancelOrder('pending-1');
    });
    
    // Verify the mocked function was called
    const { cancelTradeOrder } = require('@/hooks/trades/tradeAPI');
    expect(cancelTradeOrder).toHaveBeenCalledWith('pending-1');
  });
});
