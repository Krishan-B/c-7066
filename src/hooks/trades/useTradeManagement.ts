import { useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import type { TradeManagement } from './types';
import { fetchTradesByStatus, closeTradePosition, cancelTradeOrder } from './tradeAPI';
import { useTradeSubscription } from './useTradeSubscription';
import { useTradeState } from './useTradeState';

/**
 * Hook for managing user trade operations
 */
export const useTradeManagement = (): TradeManagement => {
  const { 
    openPositions, 
    pendingOrders, 
    closedTrades, 
    loading,
    setOpenPositions,
    setPendingOrders,
    setClosedTrades,
    setLoading
  } = useTradeState();
  
  const { user } = useAuth();

  const fetchOpenPositions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading({ open: true });
      const trades = await fetchTradesByStatus('open');
      setOpenPositions(trades);
    } finally {
      setLoading({ open: false });
    }
  }, [user, setOpenPositions, setLoading]);

  const fetchPendingOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading({ pending: true });
      const trades = await fetchTradesByStatus('pending');
      setPendingOrders(trades);
    } finally {
      setLoading({ pending: false });
    }
  }, [user, setPendingOrders, setLoading]);

  const fetchClosedTrades = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading({ closed: true });
      const trades = await fetchTradesByStatus(['closed', 'cancelled']);
      setClosedTrades(trades);
    } finally {
      setLoading({ closed: false });
    }
  }, [user, setClosedTrades, setLoading]);

  const handleTradeUpdate = useCallback((status: string) => {
    // Refresh relevant data based on the status
    if (status === 'open') {
      fetchOpenPositions();
    } else if (status === 'pending') {
      fetchPendingOrders();
    } else {
      fetchClosedTrades();
    }
  }, [fetchOpenPositions, fetchPendingOrders, fetchClosedTrades]);

  // Set up real-time subscription for trade updates
  useTradeSubscription(user?.id, handleTradeUpdate);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchOpenPositions();
      fetchPendingOrders();
      fetchClosedTrades();
    }
  }, [user, fetchOpenPositions, fetchPendingOrders, fetchClosedTrades]);

  // Handle closing a position
  const closePosition = useCallback(async (
    tradeId: string,
    currentPrice: number
  ) => {
    const result = await closeTradePosition(tradeId, currentPrice);
    
    if (result.success) {
      fetchOpenPositions();
      fetchClosedTrades();
    }
    
    return result;
  }, [fetchOpenPositions, fetchClosedTrades]);

  // Handle canceling an order
  const cancelOrder = useCallback(async (tradeId: string) => {
    const result = await cancelTradeOrder(tradeId);
    
    if (result.success) {
      fetchPendingOrders();
      fetchClosedTrades();
    }
    
    return result;
  }, [fetchPendingOrders, fetchClosedTrades]);

  return {
    openPositions,
    pendingOrders,
    closedTrades,
    loading,
    fetchOpenPositions,
    fetchPendingOrders,
    fetchClosedTrades,
    closePosition,
    cancelOrder
  };
};