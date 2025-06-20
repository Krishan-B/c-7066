
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TradingEngineService } from '@/services/tradingEngineService';
import type { TradingOrder, TradingPosition, AccountMetrics } from '@/types/trading-engine';
import { useAuth } from '@/hooks/useAuth';

export const useTradingEngine = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Account metrics query
  const { data: accountMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['account-metrics', user?.id],
    queryFn: TradingEngineService.getAccountMetrics,
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute
  });

  // Open positions query
  const { data: openPositions = [], isLoading: positionsLoading } = useQuery({
    queryKey: ['open-positions', user?.id],
    queryFn: TradingEngineService.getOpenPositions,
    enabled: !!user,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000 // 30 seconds
  });

  // Pending orders query
  const { data: pendingOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['pending-orders', user?.id],
    queryFn: TradingEngineService.getPendingOrders,
    enabled: !!user,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000 // 30 seconds
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('trading-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trading_positions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['open-positions'] });
          queryClient.invalidateQueries({ queryKey: ['account-metrics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trading_orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
          queryClient.invalidateQueries({ queryKey: ['account-metrics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'account_metrics',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['account-metrics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['account-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['open-positions'] });
    queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
  };

  return {
    accountMetrics,
    openPositions,
    pendingOrders,
    isLoading: metricsLoading || positionsLoading || ordersLoading,
    refreshData
  };
};
