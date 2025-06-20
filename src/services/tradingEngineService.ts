
import { supabase } from '@/integrations/supabase/client';
import type { 
  TradingOrder, 
  TradingPosition, 
  AccountMetrics, 
  PlaceOrderRequest,
  OrderHistory
} from '@/types/trading-engine';
import { ASSET_LEVERAGE_CONFIG } from '@/types/trading-engine';
import { ErrorHandler } from '@/services/errorHandling';
import { isMarketOpen } from '@/utils/marketHours';

export class TradingEngineService {
  // Place a new order
  static async placeOrder(orderData: PlaceOrderRequest): Promise<TradingOrder | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Validate market hours
      if (!isMarketOpen(orderData.asset_class)) {
        throw new Error(`${orderData.asset_class} market is currently closed`);
      }

      // Calculate leverage and margin
      const assetConfig = ASSET_LEVERAGE_CONFIG[orderData.asset_class as keyof typeof ASSET_LEVERAGE_CONFIG];
      const leverage = assetConfig?.leverage || 10;
      const positionValue = orderData.units * orderData.requested_price;
      const marginRequired = positionValue / leverage;

      // Check available funds for market orders
      if (orderData.order_type === 'market') {
        const metrics = await this.getAccountMetrics();
        if (metrics && marginRequired > metrics.available_funds) {
          throw new Error('Insufficient funds for this trade');
        }
      }

      const { data, error } = await supabase
        .from('trading_orders')
        .insert({
          user_id: user.user.id,
          symbol: orderData.symbol,
          asset_class: orderData.asset_class,
          order_type: orderData.order_type,
          direction: orderData.direction,
          units: orderData.units,
          requested_price: orderData.requested_price,
          position_value: positionValue,
          margin_required: marginRequired,
          leverage_ratio: leverage,
          stop_loss_price: orderData.stop_loss_price,
          take_profit_price: orderData.take_profit_price,
          expiration_date: orderData.expiration_date,
          fees: positionValue * 0.001, // 0.1% fee
          slippage: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-execute market orders
      if (orderData.order_type === 'market' && data) {
        await this.executeMarketOrder(data.id, orderData.requested_price);
      }

      // Cast to proper type
      return data as TradingOrder;
    } catch (error) {
      ErrorHandler.show(error, 'place order');
      return null;
    }
  }

  // Execute market order
  static async executeMarketOrder(orderId: string, executionPrice: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('execute_market_order', {
        p_order_id: orderId,
        p_execution_price: executionPrice
      });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorHandler.show(error, 'execute market order');
      return false;
    }
  }

  // Get account metrics
  static async getAccountMetrics(): Promise<AccountMetrics | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('account_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) throw error;

      // Initialize account if not exists
      if (!data) {
        const { data: newAccount, error: insertError } = await supabase
          .from('account_metrics')
          .insert({
            user_id: user.user.id,
            balance: 10000.00,
            bonus: 0.00,
            equity: 10000.00,
            used_margin: 0.00,
            available_funds: 10000.00,
            unrealized_pnl: 0.00,
            realized_pnl: 0.00,
            total_exposure: 0.00,
            margin_level: 0.00,
            open_positions_count: 0,
            pending_orders_count: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newAccount as AccountMetrics;
      }

      return data as AccountMetrics;
    } catch (error) {
      ErrorHandler.show(error, 'get account metrics');
      return null;
    }
  }

  // Get open positions
  static async getOpenPositions(): Promise<TradingPosition[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('trading_positions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'open')
        .order('opened_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TradingPosition[];
    } catch (error) {
      ErrorHandler.show(error, 'get open positions');
      return [];
    }
  }

  // Get pending orders
  static async getPendingOrders(): Promise<TradingOrder[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('trading_orders')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TradingOrder[];
    } catch (error) {
      ErrorHandler.show(error, 'get pending orders');
      return [];
    }
  }

  // Close position
  static async closePosition(positionId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      // Get position details
      const { data: position, error: positionError } = await supabase
        .from('trading_positions')
        .select('*')
        .eq('id', positionId)
        .eq('user_id', user.user.id)
        .single();

      if (positionError || !position) throw new Error('Position not found');

      // Update position status
      const { error } = await supabase
        .from('trading_positions')
        .update({ status: 'closed' })
        .eq('id', positionId);

      if (error) throw error;

      // Update account metrics
      await supabase.rpc('update_account_metrics', { p_user_id: user.user.id });

      ErrorHandler.showSuccess('Position closed successfully');
      return true;
    } catch (error) {
      ErrorHandler.show(error, 'close position');
      return false;
    }
  }

  // Cancel pending order
  static async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { error } = await supabase
        .from('trading_orders')
        .update({ 
          status: 'cancelled', 
          cancelled_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .eq('user_id', user.user.id);

      if (error) throw error;

      ErrorHandler.showSuccess('Order cancelled successfully');
      return true;
    } catch (error) {
      ErrorHandler.show(error, 'cancel order');
      return false;
    }
  }

  // Update position prices (for real-time P&L)
  static async updatePositionPrice(positionId: string, newPrice: number): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_position_realtime', {
        p_position_id: positionId,
        p_new_price: newPrice
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating position price:', error);
      return false;
    }
  }

  // Get order history
  static async getOrderHistory(): Promise<OrderHistory[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('order_history')
        .select('*')
        .eq('user_id', user.user.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as OrderHistory[];
    } catch (error) {
      ErrorHandler.show(error, 'get order history');
      return [];
    }
  }
}
