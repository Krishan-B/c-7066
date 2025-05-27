
import { useState } from 'react';
import { type Trade, type TradeManagementState } from './types';

/**
 * Custom hook for managing trade state
 * This hook extracts state management logic from the main trade management hook
 * 
 * @returns Trade state and setter functions
 */
export const useTradeState = (): TradeManagementState & {
  setOpenPositions: (positions: Trade[]) => void;
  setPendingOrders: (orders: Trade[]) => void;
  setClosedTrades: (trades: Trade[]) => void;
  setLoading: (loadingState: Partial<{ open: boolean; pending: boolean; closed: boolean }>) => void;
} => {
  const [openPositions, setOpenPositions] = useState<Trade[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [loading, setLoadingState] = useState<{
    open: boolean;
    pending: boolean;
    closed: boolean;
  }>({
    open: true,
    pending: true,
    closed: true,
  });

  // Wrapper function to allow for partial updates to loading state
  const setLoading = (loadingState: Partial<{ open: boolean; pending: boolean; closed: boolean }>) => {
    setLoadingState(prev => ({ ...prev, ...loadingState }));
  };

  return {
    openPositions,
    pendingOrders,
    closedTrades,
    loading,
    setOpenPositions,
    setPendingOrders,
    setClosedTrades,
    setLoading,
  };
};
