
import { useState, useCallback, useMemo } from 'react';
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

export const useTradeCalculations = (
  unitsStr?: string,
  currentPrice?: number,
  assetClass?: string,
  availableFunds?: number
) => {
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

  // Process the input units string to a number
  const parsedUnits = useMemo(() => {
    if (!unitsStr) return 0;
    const parsed = parseFloat(unitsStr);
    return isNaN(parsed) ? 0 : parsed;
  }, [unitsStr]);

  // Calculate position value, margin required, etc. when inputs change
  const tradeValues = useMemo(() => {
    if (!currentPrice || !assetClass || parsedUnits === 0) {
      return {
        positionValue: 0,
        leverage: 1,
        marginRequired: 0,
        fee: 0,
        total: 0,
        canAfford: false
      };
    }

    const positionValue = currentPrice * parsedUnits;
    const leverage = LEVERAGE_MAP[assetClass] || 1;
    const marginRequired = positionValue / leverage;
    const fee = marginRequired * 0.001; // 0.1% fee
    const total = marginRequired + fee;
    const canAfford = availableFunds ? availableFunds >= marginRequired : false;

    return {
      positionValue,
      leverage,
      marginRequired,
      fee,
      total,
      canAfford
    };
  }, [currentPrice, assetClass, parsedUnits, availableFunds]);

  return {
    calculations,
    calculatePnL,
    calculateMargin,
    validateTradeSize,
    parsedUnits,
    leverage: tradeValues.leverage,
    requiredFunds: tradeValues.marginRequired,
    fee: tradeValues.fee,
    total: tradeValues.total,
    canAfford: tradeValues.canAfford
  };
};
