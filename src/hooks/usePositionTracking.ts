import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  positionTrackingService,
  type Position,
  type PositionUpdate,
} from "@/services/positionTrackingService";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ErrorHandler } from "@/services/errorHandling";

export const usePositionTracking = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionUpdates, setPositionUpdates] = useState<
    Record<string, PositionUpdate[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const fetchedPositions = await positionTrackingService.fetchPositions(
        user.id
      );
      setPositions(fetchedPositions);
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "data_fetch_error",
          message: "Failed to load positions",
          details: error,
          retryable: true,
        }),
        {
          description: "Unable to load your positions. Please try again.",
          retryFn: () => fetchPositions(),
        }
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updatePositionPrice = useCallback(
    async (positionId: string, newPrice: number) => {
      try {
        await positionTrackingService.updatePositionPrice(positionId, newPrice);
      } catch (error) {
        ErrorHandler.handleError(
          ErrorHandler.createError({
            code: "position_update_error",
            message: "Failed to update position price",
            details: error,
            retryable: true,
          }),
          {
            description: "Unable to update position price. Please try again.",
            retryFn: async () => {
              await updatePositionPrice(positionId, newPrice);
            },
          }
        );
      }
    },
    []
  );

  const calculatePnL = useCallback(
    async (positionId: string, newPrice: number) => {
      try {
        return await positionTrackingService.calculateRealtimePnL(
          positionId,
          newPrice
        );
      } catch (error) {
        ErrorHandler.handleError(
          ErrorHandler.createError({
            code: "pnl_calculation_error",
            message: "Failed to calculate P&L",
            details: error,
          })
        );
        return null;
      }
    },
    []
  );

  const startRealTimeTracking = useCallback(async () => {
    if (!user || realTimeEnabled) return;

    try {
      const channel = positionTrackingService.subscribeToPositionUpdates(
        user.id,
        (updatedPosition) => {
          setPositions((prev) =>
            prev.map((pos) =>
              pos.id === updatedPosition.id ? updatedPosition : pos
            )
          );
        },
        (update) => {
          setPositionUpdates((prev) => ({
            ...prev,
            [update.position_id]: [
              update,
              ...(prev[update.position_id] || []).slice(0, 49), // Keep last 50 updates
            ],
          }));
        }
      );

      channelRef.current = channel;
      setRealTimeEnabled(true);

      ErrorHandler.handleSuccess("Real-time position tracking is now active", {
        description: "You'll receive instant updates for your positions",
      });
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "realtime_subscription_error",
          message: "Failed to start real-time tracking",
          details: error,
          retryable: true,
        }),
        {
          description: "Unable to enable real-time tracking. Please try again.",
          retryFn: async () => {
            await startRealTimeTracking();
          },
        }
      );
    }
  }, [user, realTimeEnabled]);

  const stopRealTimeTracking = useCallback(async () => {
    try {
      if (channelRef.current) {
        positionTrackingService.unsubscribeFromPositionUpdates(
          channelRef.current
        );
        channelRef.current = null;
      }
      setRealTimeEnabled(false);

      ErrorHandler.handleSuccess("Real-time tracking stopped", {
        description: "Position updates will no longer be received in real-time",
      });
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "realtime_unsubscribe_error",
          message: "Failed to stop real-time tracking",
          details: error,
        })
      );
    }
  }, []);

  // Start tracking when component mounts and stop when it unmounts
  useEffect(() => {
    fetchPositions();
    startRealTimeTracking();

    return () => {
      stopRealTimeTracking().catch(console.error);
    };
  }, [fetchPositions, startRealTimeTracking, stopRealTimeTracking]);

  return {
    positions,
    positionUpdates,
    loading,
    realTimeEnabled,
    fetchPositions,
    updatePositionPrice,
    calculatePnL,
    startRealTimeTracking,
    stopRealTimeTracking,
  };
};
