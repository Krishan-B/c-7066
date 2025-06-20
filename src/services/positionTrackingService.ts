
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the database types directly to ensure compatibility
type DatabasePosition = Database['public']['Tables']['positions']['Row'];
type DatabasePositionUpdate = Database['public']['Tables']['position_updates']['Row'];

export interface Position extends DatabasePosition {
  // All properties are inherited from DatabasePosition which matches Supabase exactly
}

export interface PositionUpdate extends DatabasePositionUpdate {
  // All properties are inherited from DatabasePositionUpdate which matches Supabase exactly
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
    return (data || []) as Position[];
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
    return (data || []) as PositionUpdate[];
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
