
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Trade, TradeManagement } from './trades/types';
import { fetchTradesByStatus, closeTradePosition, cancelTradeOrder } from './trades/tradeAPI';
import { useTradeSubscription } from './trades/useTradeSubscription';

/**
 * Hook for managing user trade operations
 */
export const useTradeManagement = (): TradeManagement => {
  const [openPositions, setOpenPositions] = useState<Trade[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<{
    open: boolean;
    pending: boolean;
    closed: boolean;
  }>({
    open: true,
    pending: true,
    closed: true,
  });
  
  const { user } = useAuth();

  const fetchOpenPositions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, open: true }));
      const trades = await fetchTradesByStatus('open');
      setOpenPositions(trades);
    } finally {
      setLoading(prev => ({ ...prev, open: false }));
    }
  }, [user]);

  const fetchPendingOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, pending: true }));
      const trades = await fetchTradesByStatus('pending');
      setPendingOrders(trades);
    } finally {
      setLoading(prev => ({ ...prev, pending: false }));
    }
  }, [user]);

  const fetchClosedTrades = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, closed: true }));
      const trades = await fetchTradesByStatus(['closed', 'cancelled']);
      setClosedTrades(trades);
    } finally {
      setLoading(prev => ({ ...prev, closed: false }));
    }
  }, [user]);

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

// Re-export the Trade type for backwards compatibility
export type { Trade } from './trades/types';
