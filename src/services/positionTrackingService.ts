
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  asset_class: string;
  direction: 'buy' | 'sell';
  units: number;
  entry_price: number;
  current_price: number;
  position_value: number;
  margin_used: number;
  unrealized_pnl: number;
  daily_pnl: number;
  session_pnl: number;
  total_fees: number;
  swap_charges: number;
  pip_value: number;
  pip_difference: number;
  stop_loss: number | null;
  take_profit: number | null;
  status: string;
  opened_at: string;
  last_updated: string;
}

export interface PositionUpdate {
  id: string;
  position_id: string;
  user_id: string;
  price_update: number;
  pnl_change: number;
  unrealized_pnl: number;
  timestamp: string;
  market_session: string;
}

export const positionTrackingService = {
  async fetchPositions(userId: string): Promise<Position[]> {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updatePositionPrice(positionId: string, newPrice: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('update_position_realtime', {
      p_position_id: positionId,
      p_new_price: newPrice
    });

    if (error) throw error;
    return data;
  },

  async calculateRealtimePnL(positionId: string, newPrice: number) {
    const { data, error } = await supabase.rpc('calculate_realtime_pnl', {
      p_position_id: positionId,
      p_new_price: newPrice
    });

    if (error) throw error;
    return data?.[0] || null;
  },

  async getPositionUpdates(positionId: string, limit: number = 50): Promise<PositionUpdate[]> {
    const { data, error } = await supabase
      .from('position_updates')
      .select('*')
      .eq('position_id', positionId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  subscribeToPositionUpdates(
    userId: string,
    onPositionUpdate: (position: Position) => void,
    onPositionUpdateEvent: (update: PositionUpdate) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('position-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'positions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onPositionUpdate(payload.new as Position);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'position_updates',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onPositionUpdateEvent(payload.new as PositionUpdate);
        }
      )
      .subscribe();

    return channel;
  },

  unsubscribeFromPositionUpdates(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  }
};
