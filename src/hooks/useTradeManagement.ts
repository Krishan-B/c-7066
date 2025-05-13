
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { closePosition, cancelPendingOrder } from '@/services/tradeService';
import { toast } from "sonner";

export interface Trade {
  id: string;
  asset_symbol: string;
  asset_name: string;
  market_type: string;
  units: number;
  price_per_unit: number;
  total_amount: number;
  trade_type: 'buy' | 'sell';
  order_type: 'market' | 'entry';
  status: 'open' | 'pending' | 'closed' | 'cancelled';
  stop_loss: number | null;
  take_profit: number | null;
  expiration_date: string | null;
  created_at: string;
  executed_at: string | null;
  closed_at: string | null;
  pnl: number | null;
  current_price?: number;
  current_pnl?: number;
}

export const useTradeManagement = () => {
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
      
      const { data, error } = await supabase
        .from('user_trades')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Type coercion for database results
      const typedData = data?.map(item => ({
        ...item,
        trade_type: item.trade_type as 'buy' | 'sell',
        order_type: item.order_type as 'market' | 'entry',
        status: item.status as 'open' | 'pending' | 'closed' | 'cancelled'
      })) || [];
      
      setOpenPositions(typedData);
    } catch (error) {
      console.error('Error fetching open positions:', error);
      toast.error('Failed to load open positions');
    } finally {
      setLoading(prev => ({ ...prev, open: false }));
    }
  }, [user]);

  const fetchPendingOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, pending: true }));
      
      const { data, error } = await supabase
        .from('user_trades')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Type coercion for database results
      const typedData = data?.map(item => ({
        ...item,
        trade_type: item.trade_type as 'buy' | 'sell',
        order_type: item.order_type as 'market' | 'entry',
        status: item.status as 'open' | 'pending' | 'closed' | 'cancelled'
      })) || [];
      
      setPendingOrders(typedData);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('Failed to load pending orders');
    } finally {
      setLoading(prev => ({ ...prev, pending: false }));
    }
  }, [user]);

  const fetchClosedTrades = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, closed: true }));
      
      const { data, error } = await supabase
        .from('user_trades')
        .select('*')
        .in('status', ['closed', 'cancelled'])
        .order('closed_at', { ascending: false });
      
      if (error) throw error;
      
      // Type coercion for database results
      const typedData = data?.map(item => ({
        ...item,
        trade_type: item.trade_type as 'buy' | 'sell',
        order_type: item.order_type as 'market' | 'entry',
        status: item.status as 'open' | 'pending' | 'closed' | 'cancelled'
      })) || [];
      
      setClosedTrades(typedData);
    } catch (error) {
      console.error('Error fetching closed trades:', error);
      toast.error('Failed to load trade history');
    } finally {
      setLoading(prev => ({ ...prev, closed: false }));
    }
  }, [user]);

  const handleClosePosition = useCallback(async (
    tradeId: string,
    currentPrice: number
  ) => {
    const result = await closePosition(tradeId, currentPrice);
    
    if (result.success) {
      toast.success(result.message);
      fetchOpenPositions();
      fetchClosedTrades();
    } else {
      toast.error(result.message);
    }
    
    return result;
  }, [fetchOpenPositions, fetchClosedTrades]);

  const handleCancelOrder = useCallback(async (tradeId: string) => {
    const result = await cancelPendingOrder(tradeId);
    
    if (result.success) {
      toast.success(result.message);
      fetchPendingOrders();
      fetchClosedTrades();
    } else {
      toast.error(result.message);
    }
    
    return result;
  }, [fetchPendingOrders, fetchClosedTrades]);

  // Set up listeners for real-time updates
  useEffect(() => {
    if (!user) return;
    
    const tradesChannel = supabase
      .channel('user_trades_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_trades' },
        payload => {
          // Refresh relevant data based on the updated record
          const record = payload.new as any;
          
          if (record.status === 'open') {
            fetchOpenPositions();
          } else if (record.status === 'pending') {
            fetchPendingOrders();
          } else {
            fetchClosedTrades();
          }
        })
      .subscribe();
    
    // Initial data fetch
    fetchOpenPositions();
    fetchPendingOrders();
    fetchClosedTrades();
    
    // Cleanup subscription
    return () => {
      tradesChannel.unsubscribe();
    };
  }, [user, fetchOpenPositions, fetchPendingOrders, fetchClosedTrades]);

  return {
    openPositions,
    pendingOrders,
    closedTrades,
    loading,
    fetchOpenPositions,
    fetchPendingOrders,
    fetchClosedTrades,
    closePosition: handleClosePosition,
    cancelOrder: handleCancelOrder
  };
};
