
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { type AccountMetrics } from "@/types/account";

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
      
      // Check if the user has an account record
      const { data, error } = await supabase
        .from('user_account')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // If the account doesn't exist yet, create one with default values
        if (error.code === 'PGRST116') {
          console.log('Account not found, creating default account for user', user.id);
          
          const defaultAccount = {
            id: user.id,
            cash_balance: 10000, // Default starting balance
            equity: 10000,
            used_margin: 0,
            available_funds: 10000,
            unrealized_pnl: 0,
            realized_pnl: 0,
            last_updated: new Date().toISOString()
          };
          
          const { error: createError } = await supabase
            .from('user_account')
            .insert(defaultAccount);
            
          if (createError) {
            throw createError;
          }
          
          // Set the metrics based on the default account
          setMetrics({
            balance: defaultAccount.cash_balance,
            equity: defaultAccount.equity,
            unrealizedPL: defaultAccount.unrealized_pnl,
            marginLevel: 0,
            usedMargin: defaultAccount.used_margin,
            realizedPL: defaultAccount.realized_pnl,
            availableFunds: defaultAccount.available_funds,
            exposure: 0,
            bonus: 0,
            buyingPower: defaultAccount.available_funds * 20, // Default leverage
            openPositions: 0,
            profitLoss: defaultAccount.unrealized_pnl
          });
          
          setLoading(false);
          return;
        }
        
        throw error;
      }
      
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
          bonus: 0, // Not implemented yet
          buyingPower: (data.available_funds || 0) * 20, // Default to stocks leverage (20x)
          openPositions: 0, // Will be calculated elsewhere
          profitLoss: data.unrealized_pnl || 0 // Alias for unrealizedPL
        };
        
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
