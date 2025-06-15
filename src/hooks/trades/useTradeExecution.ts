import { useState } from 'react';
import { executeMarketOrder } from '@/services/trades/orders/marketOrders';
import { placeEntryOrder } from '@/services/trades/orders/entryOrders';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';
import type { TradeDirection } from './types';

export interface TradeParams {
  symbol: string;
  direction: TradeDirection;
  units: number;
  orderType: 'market' | 'entry';
  assetCategory: string;
  currentPrice: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: string;
}

export function useTradeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const { user } = useAuth();

  const executeTrade = async (params: TradeParams) => {
    if (!user) {
      toast.error('Please log in to execute trades');
      return { success: false, message: 'Not authenticated' };
    }

    try {
      setIsExecuting(true);

      if (params.orderType === 'market') {
        return await executeMarketOrder({
          userId: user.id,
          symbol: params.symbol,
          direction: params.direction,
          units: params.units,
          currentPrice: params.currentPrice,
          stopLoss: params.stopLoss,
          takeProfit: params.takeProfit,
          assetCategory: params.assetCategory,
        });
      } else {
        // For entry orders, we need the entryPrice
        if (!params.entryPrice) {
          throw new Error('Entry price is required for entry orders');
        }

        return await placeEntryOrder({
          userId: user.id,
          symbol: params.symbol,
          direction: params.direction,
          units: params.units,
          currentPrice: params.currentPrice,
          entryPrice: params.entryPrice,
          stopLoss: params.stopLoss,
          takeProfit: params.takeProfit,
          assetCategory: params.assetCategory,
          expiration: params.expiration,
        });
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeTrade,
    isExecuting,
  };
}
