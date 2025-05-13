
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { AccountMetrics } from "@/types/account";

export const useAccountMetrics = () => {
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccountMetrics = useCallback(async () => {
    if (!user) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_account')
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Map database fields to our AccountMetrics type
        const accountMetrics: AccountMetrics = {
          balance: data.cash_balance || 0,
          equity: data.equity || 0,
          unrealizedPL: data.unrealized_pnl || 0,
          marginLevel: data.used_margin > 0 ? (data.equity / data.used_margin) * 100 : 0,
          usedMargin: data.used_margin || 0,
          realizedPL: data.realized_pnl || 0,
          availableFunds: data.available_funds || 0,
          exposure: 0, // This we'll need to calculate from positions
          bonus: 0 // Not implemented yet
        };
        
        // Calculate buying power based on leverages
        accountMetrics.buyingPower = accountMetrics.availableFunds * 20; // Default to stocks leverage
        
        setMetrics(accountMetrics);
      }
    } catch (error) {
      console.error('Error fetching account metrics:', error);
      toast.error('Failed to load account metrics');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccountMetrics();
    
    // Set up real-time subscription for account updates
    if (user) {
      const accountChannel = supabase
        .channel('user_account_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'user_account', filter: `id=eq.${user.id}` },
          () => {
            fetchAccountMetrics();
          })
        .subscribe();
        
      return () => {
        accountChannel.unsubscribe();
      };
    }
  }, [user, fetchAccountMetrics]);

  return {
    metrics,
    loading,
    refreshMetrics: fetchAccountMetrics
  };
};
