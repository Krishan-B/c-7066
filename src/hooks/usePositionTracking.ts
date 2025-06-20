
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { positionTrackingService, type Position, type PositionUpdate } from '@/services/positionTrackingService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const usePositionTracking = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionUpdates, setPositionUpdates] = useState<Record<string, PositionUpdate[]>>({});
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const fetchedPositions = await positionTrackingService.fetchPositions(user.id);
      setPositions(fetchedPositions);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load positions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updatePositionPrice = useCallback(async (positionId: string, newPrice: number) => {
    try {
      await positionTrackingService.updatePositionPrice(positionId, newPrice);
    } catch (error) {
      console.error('Error updating position price:', error);
      toast({
        title: 'Error',
        description: 'Failed to update position price',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const calculatePnL = useCallback(async (positionId: string, newPrice: number) => {
    try {
      return await positionTrackingService.calculateRealtimePnL(positionId, newPrice);
    } catch (error) {
      console.error('Error calculating P&L:', error);
      return null;
    }
  }, []);

  const startRealTimeTracking = useCallback(() => {
    if (!user || realTimeEnabled) return;

    const channel = positionTrackingService.subscribeToPositionUpdates(
      user.id,
      (updatedPosition) => {
        setPositions(prev => 
          prev.map(pos => pos.id === updatedPosition.id ? updatedPosition : pos)
        );
      },
      (update) => {
        setPositionUpdates(prev => ({
          ...prev,
          [update.position_id]: [
            update,
            ...(prev[update.position_id] || []).slice(0, 49) // Keep last 50 updates
          ]
        }));
      }
    );

    channelRef.current = channel;
    setRealTimeEnabled(true);

    toast({
      title: 'Real-time Tracking Enabled',
      description: 'Position updates will be tracked in real-time',
    });
  }, [user, realTimeEnabled, toast]);

  const stopRealTimeTracking = useCallback(() => {
    if (channelRef.current) {
      positionTrackingService.unsubscribeFromPositionUpdates(channelRef.current);
      channelRef.current = null;
    }
    setRealTimeEnabled(false);

    toast({
      title: 'Real-time Tracking Disabled',
      description: 'Position tracking has been stopped',
    });
  }, [toast]);

  const getPositionUpdates = useCallback(async (positionId: string) => {
    try {
      const updates = await positionTrackingService.getPositionUpdates(positionId);
      setPositionUpdates(prev => ({
        ...prev,
        [positionId]: updates
      }));
      return updates;
    } catch (error) {
      console.error('Error fetching position updates:', error);
      return [];
    }
  }, []);

  // Auto-fetch positions when user changes
  useEffect(() => {
    if (user) {
      fetchPositions();
    }
  }, [user, fetchPositions]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        positionTrackingService.unsubscribeFromPositionUpdates(channelRef.current);
      }
    };
  }, []);

  // Calculate totals
  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0);
  const totalDailyPnL = positions.reduce((sum, pos) => sum + (pos.daily_pnl || 0), 0);
  const totalMarginUsed = positions.reduce((sum, pos) => sum + pos.margin_used, 0);
  const totalPositionValue = positions.reduce((sum, pos) => sum + pos.position_value, 0);

  return {
    positions,
    positionUpdates,
    loading,
    realTimeEnabled,
    totals: {
      unrealizedPnL: totalUnrealizedPnL,
      dailyPnL: totalDailyPnL,
      marginUsed: totalMarginUsed,
      positionValue: totalPositionValue
    },
    fetchPositions,
    updatePositionPrice,
    calculatePnL,
    startRealTimeTracking,
    stopRealTimeTracking,
    getPositionUpdates
  };
};
