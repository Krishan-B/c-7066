
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { type Trade } from './types';
import { closePosition as closePositionService, cancelPendingOrder } from '@/services/trades/orderService';

export const fetchTradesByStatus = async (status: string | string[]): Promise<Trade[]> => {
  try {
    const statusCondition = Array.isArray(status) 
      ? { status: { in: status } } 
      : { status };
    
    const { data, error } = await supabase
      .from('user_trades')
      .select('*')
      .match(statusCondition)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Type coercion for database results
    return data?.map(item => ({
      ...item,
      trade_type: item.trade_type as 'buy' | 'sell',
      order_type: item.order_type as 'market' | 'entry',
      status: item.status as 'open' | 'pending' | 'closed' | 'cancelled'
    })) || [];
    
  } catch (error) {
    console.error(`Error fetching trades with status ${status}:`, error);
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
