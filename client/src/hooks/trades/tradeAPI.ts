import { supabase } from '@/integrations/supabase/client';
import {
  cancelPendingOrder,
  closePosition as closePositionService,
} from '@/services/trades/orderService';
import { toast } from 'sonner';

import { type DirectionEnum, type OrderTypeEnum } from '@/types/schema';

import { type MarketType } from '../market/types';
import { type Trade } from './types';

export const fetchTradesByStatus = async (status: string | string[]): Promise<Trade[]> => {
  try {
    const statusCondition = Array.isArray(status) ? { status: { in: status } } : { status };

    const { data, error } = await supabase
      .from('user_trades')
      .select('*')
      .match(statusCondition)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type coercion for database results
    return (
      data?.map((item) => ({
        ...item,
        created_at: item.created_at ?? '',
        trade_type: item.trade_type as 'buy' | 'sell',
        order_type: item.order_type as 'market' | 'entry',
        status: item.status as 'open' | 'pending' | 'closed' | 'cancelled',
      })) || []
    );
  } catch {
    toast.error(`Failed to load trades with status ${status}`);
    return [];
  }
};

export const closeTradePosition = async (
  tradeId: string,
  currentPrice: number
): Promise<{ success: boolean; message: string }> => {
  const result = await closePositionService(tradeId, currentPrice);

  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }

  return result;
};

export const cancelTradeOrder = async (
  tradeId: string
): Promise<{ success: boolean; message: string }> => {
  const result = await cancelPendingOrder(tradeId);

  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }

  return result;
};

export const executeTradeAPI = async ({
  symbol,
  assetCategory,
  direction,
  orderType,
  units,
  currentPrice,
  entryPrice,
  stopLoss,
  takeProfit,
  expiration,
}: {
  symbol: string;
  assetCategory: MarketType;
  direction: DirectionEnum;
  orderType: OrderTypeEnum;
  units: number;
  currentPrice: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: string;
}): Promise<{ success: boolean; message: string; tradeId?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_trades')
      .insert({
        asset_symbol: symbol,
        asset_name: symbol, // Using symbol as name if not provided
        market_type: assetCategory,
        units,
        price_per_unit: orderType === 'market' ? currentPrice : entryPrice,
        total_amount: units * (orderType === 'market' ? currentPrice : entryPrice || 0),
        trade_type: direction,
        order_type: orderType,
        status: orderType === 'market' ? 'open' : 'pending',
        stop_loss: stopLoss || null,
        take_profit: takeProfit || null,
        expiration_date: expiration || null,
        created_at: new Date().toISOString(),
        executed_at: orderType === 'market' ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error executing trade:', error);
      return {
        success: false,
        message: `Failed to execute trade: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully ${orderType === 'market' ? 'executed' : 'placed'} ${direction} order`,
      tradeId: data?.id,
    };
  } catch (error) {
    console.error('Error executing trade:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error executing trade',
    };
  }
};
