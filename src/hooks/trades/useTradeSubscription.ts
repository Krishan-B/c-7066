import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle Supabase real-time subscription for trade updates
 */
export const useTradeSubscription = (
  userId: string | undefined,
  onTradeUpdate: (status: string) => void
) => {
  useEffect(() => {
    if (!userId) return;
    
    const tradesChannel = supabase
      .channel('user_trades_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_trades' },
        payload => {
          // Refresh relevant data based on the updated record's status
          const record = payload.new as unknown;
          if (record && typeof record === 'object' && 'status' in record && typeof (record as { status: unknown }).status === 'string') {
            onTradeUpdate((record as { status: string }).status);
          }
        })
      .subscribe();
    
    // Cleanup subscription
    return () => {
      tradesChannel.unsubscribe();
    };
  }, [userId, onTradeUpdate]);
};
