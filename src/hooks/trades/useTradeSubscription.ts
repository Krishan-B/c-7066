
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

/**
 * Hook to subscribe to real-time trade updates from Supabase
 * @param userId User ID to filter trade updates
 * @param onUpdate Callback function to handle trade updates
 */
export const useTradeSubscription = (
  userId?: string,
  onUpdate?: (status: string) => void
) => {
  useEffect(() => {
    if (!userId) return;
    
    const tradeChannel = supabase
      .channel('trade-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_trades',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as Record<string, any>;
            const status = newData.status as string;
            const symbol = newData.asset_symbol as string;
            
            // Handle different status updates
            if (status) {
              if (status === 'executed') {
                toast.success(`Trade for ${symbol} executed successfully`);
              } else if (status === 'closed') {
                toast.info(`Position for ${symbol} has been closed`);
              } else if (status === 'cancelled') {
                toast.info(`Order for ${symbol} has been cancelled`);
              } else if (status === 'liquidated') {
                toast.error(`Position for ${symbol} has been liquidated`);
              }
              
              // Call the update handler if provided
              if (onUpdate) {
                onUpdate(status);
              }
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to trade updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to trade updates');
        }
      });
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(tradeChannel);
    };
  }, [userId, onUpdate]);
};
