import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { usePortfolioAPI } from '@/hooks/portfolio/usePortfolioAPI';
import { getRiskLevel } from '@/utils/riskManagementUtils';

export function useRealTimePortfolio(initialTimeframe: string = '1m') {
  const [timeframe, setTimeframe] = useState<string>(initialTimeframe);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [marginLevelStatus, setMarginLevelStatus] = useState<string>('safe');
  const { user } = useAuth();

  const { data: portfolioData, isLoading, error, refetch } = usePortfolioAPI(timeframe);

  // Set up real-time subscription to portfolio changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to portfolio changes
    const portfolioChannel = supabase
      .channel('portfolio_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_portfolio',
          filter: `user_id=eq.${user.id}`,
        },
        (_payload) => {
          refetch();
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');

        if (status === 'SUBSCRIBED') {
          toast.success('Real-time portfolio updates activated');
        } else if (status === 'CHANNEL_ERROR') {
          toast.error('Error subscribing to real-time portfolio updates');
        }
      });

    // Subscribe to trades changes that affect portfolio
    const tradesChannel = supabase
      .channel('trades_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_trades',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Only refetch on meaningful status changes
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            const newStatus = payload.new.status;
            if (['executed', 'closed', 'cancelled', 'liquidated'].includes(newStatus)) {
              refetch();
            }
          }
        }
      )
      .subscribe();

    // Subscribe to account changes that affect portfolio metrics
    const accountChannel = supabase
      .channel('account_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_account',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            // Check if payload has the properties we need
            const newData = payload.new as Record<string, unknown>;
            if (
              'equity' in newData &&
              typeof newData.equity === 'number' &&
              'used_margin' in newData &&
              typeof newData.used_margin === 'number'
            ) {
              // Check margin level and update status
              const marginLevel = (newData.equity / (newData.used_margin || 1)) * 100;
              const newRiskLevel = getRiskLevel(marginLevel);
              if (newRiskLevel !== marginLevelStatus) {
                setMarginLevelStatus(newRiskLevel);
                // Show appropriate notifications based on risk level
                if (newRiskLevel === 'warning') {
                  toast.warning('Margin level warning: approaching margin call threshold');
                } else if (newRiskLevel === 'danger') {
                  toast.error('Margin call alert: add funds to avoid liquidation');
                } else if (newRiskLevel === 'critical') {
                  toast.error('Critical alert: positions at risk of immediate liquidation', {
                    duration: 10000,
                  });
                }
              }
              refetch();
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(portfolioChannel);
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(accountChannel);
    };
  }, [user, refetch, marginLevelStatus]);

  // Force refetch portfolio data
  const refreshPortfolio = useCallback(() => {
    refetch();
    toast.info('Refreshing portfolio data...');
  }, [refetch]);

  return {
    portfolioData,
    timeframe,
    setTimeframe,
    isLoading,
    error,
    isSubscribed,
    refreshPortfolio,
    marginLevelStatus,
  };
}
