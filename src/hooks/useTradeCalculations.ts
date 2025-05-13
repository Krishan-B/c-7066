
import { useState, useCallback } from 'react';
import { calculateMarginRequired, LEVERAGE_MAP } from '@/utils/leverageUtils';
import { formatCurrency } from '@/utils/formatUtils';

export type TradeDirection = 'buy' | 'sell';

export interface TradeCalculationParams {
  assetClass: string;
  currentPrice: number;
  direction: TradeDirection;
  units: number;
}

export interface PnLResult {
  pnl: number;
  pnlPercentage: number;
  formattedPnl: string;
  formattedPnlPercentage: string;
  isProfit: boolean;
}

export const useTradeCalculations = () => {
  const [calculations, setCalculations] = useState<{
    marginRequired: number;
    leverage: number;
    positionValue: number;
  }>({
    marginRequired: 0,
    leverage: 1,
    positionValue: 0,
  });

  /**
   * Calculate P&L for a position
   */
  const calculatePnL = useCallback((
    entryPrice: number,
    currentPrice: number,
    direction: TradeDirection,
    units: number
  ): PnLResult => {
    let pnl = 0;
    
    if (direction === 'buy') {
      pnl = units * (currentPrice - entryPrice);
    } else {
      pnl = units * (entryPrice - currentPrice);
    }
    
    const pnlPercentage = entryPrice !== 0
      ? (pnl / (units * entryPrice)) * 100
      : 0;
    
    return {
      pnl,
      pnlPercentage,
      formattedPnl: formatCurrency(pnl),
      formattedPnlPercentage: `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%`,
      isProfit: pnl >= 0,
    };
  }, []);

  /**
   * Calculate margin requirements and position value
   */
  const calculateMargin = useCallback(({
    assetClass,
    currentPrice,
    units,
  }: Omit<TradeCalculationParams, 'direction'>) => {
    const positionValue = currentPrice * units;
    const leverage = LEVERAGE_MAP[assetClass] || 1;
    const marginRequired = calculateMarginRequired(assetClass, positionValue);
    
    setCalculations({
      marginRequired,
      leverage,
      positionValue,
    });
    
    return {
      marginRequired,
      leverage,
      positionValue,
    };
  }, []);

  /**
   * Check if user has sufficient funds for the trade
   */
  const validateTradeSize = useCallback((availableFunds: number, marginRequired: number): boolean => {
    return availableFunds >= marginRequired;
  }, []);

  return {
    calculations,
    calculatePnL,
    calculateMargin,
    validateTradeSize,
  };
};
