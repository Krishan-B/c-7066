import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { EnhancedOrder, OrderGroup, StopLossTakeProfitConfig, EnhancedOrderType } from '@/types/enhanced-orders';

export const useEnhancedOrders = () => {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const enhancedOrders: EnhancedOrder[] = (data || []).map(order => ({
        ...order,
        order_type: order.order_type as EnhancedOrderType,
        order_category: (order.order_category || 'primary') as 'primary' | 'stop_loss' | 'take_profit' | 'trailing_stop',
        direction: order.direction as 'buy' | 'sell'
      }));

      setOrders(enhancedOrders);
      groupOrders(enhancedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const groupOrders = (ordersList: EnhancedOrder[]) => {
    const groups: OrderGroup[] = [];
    const primaryOrders = ordersList.filter(order => order.order_category === 'primary');
    
    primaryOrders.forEach(primaryOrder => {
      const childOrders = ordersList.filter(order => order.parent_order_id === primaryOrder.id);
      const group: OrderGroup = {
        id: primaryOrder.order_group_id || primaryOrder.id,
        primaryOrder,
        stopLossOrder: childOrders.find(o => o.order_category === 'stop_loss'),
        takeProfitOrder: childOrders.find(o => o.order_category === 'take_profit'),
        trailingStopOrder: childOrders.find(o => o.order_category === 'trailing_stop')
      };
      groups.push(group);
    });
    
    setOrderGroups(groups);
  };

  const placeEnhancedOrder = async (
    symbol: string,
    assetClass: string,
    direction: 'buy' | 'sell',
    units: number,
    price: number,
    orderType: EnhancedOrderType,
    slTpConfig?: StopLossTakeProfitConfig
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const orderGroupId = crypto.randomUUID();
      
      // Create primary order
      const primaryOrderData = {
        user_id: user.id,
        symbol,
        asset_class: assetClass,
        order_type: orderType,
        order_category: 'primary',
        direction,
        units,
        requested_price: price,
        position_value: units * price,
        margin_required: (units * price) * 0.1, // 10% margin requirement
        order_group_id: orderGroupId,
        status: 'pending'
      };

      const { data: primaryOrder, error: primaryError } = await supabase
        .from('orders')
        .insert(primaryOrderData)
        .select()
        .single();

      if (primaryError) throw primaryError;

      // Create stop-loss order if enabled
      if (slTpConfig?.enableStopLoss && slTpConfig.stopLossPrice) {
        const stopLossData = {
          user_id: user.id,
          symbol,
          asset_class: assetClass,
          order_type: 'stop_loss' as EnhancedOrderType,
          order_category: 'stop_loss',
          direction: direction === 'buy' ? 'sell' : 'buy', // Opposite direction
          units,
          requested_price: slTpConfig.stopLossPrice,
          position_value: units * slTpConfig.stopLossPrice,
          margin_required: 0,
          stop_loss_price: slTpConfig.stopLossPrice,
          order_group_id: orderGroupId,
          parent_order_id: primaryOrder.id,
          status: 'pending'
        };

        const { error: slError } = await supabase
          .from('orders')
          .insert(stopLossData);

        if (slError) throw slError;
      }

      // Create take-profit order if enabled
      if (slTpConfig?.enableTakeProfit && slTpConfig.takeProfitPrice) {
        const takeProfitData = {
          user_id: user.id,
          symbol,
          asset_class: assetClass,
          order_type: 'take_profit' as EnhancedOrderType,
          order_category: 'take_profit',
          direction: direction === 'buy' ? 'sell' : 'buy', // Opposite direction
          units,
          requested_price: slTpConfig.takeProfitPrice,
          position_value: units * slTpConfig.takeProfitPrice,
          margin_required: 0,
          take_profit_price: slTpConfig.takeProfitPrice,
          order_group_id: orderGroupId,
          parent_order_id: primaryOrder.id,
          status: 'pending'
        };

        const { error: tpError } = await supabase
          .from('orders')
          .insert(takeProfitData);

        if (tpError) throw tpError;
      }

      // Create trailing stop order if enabled
      if (slTpConfig?.enableTrailingStop && slTpConfig.trailingStopDistance) {
        const trailingStopData = {
          user_id: user.id,
          symbol,
          asset_class: assetClass,
          order_type: 'trailing_stop' as EnhancedOrderType,
          order_category: 'trailing_stop',
          direction: direction === 'buy' ? 'sell' : 'buy', // Opposite direction
          units,
          requested_price: price, // Will be adjusted dynamically
          position_value: units * price,
          margin_required: 0,
          trailing_stop_distance: slTpConfig.trailingStopDistance,
          order_group_id: orderGroupId,
          parent_order_id: primaryOrder.id,
          status: 'pending'
        };

        const { error: tsError } = await supabase
          .from('orders')
          .insert(trailingStopData);

        if (tsError) throw tsError;
      }

      toast({
        title: 'Success',
        description: 'Enhanced order placed successfully',
      });

      await fetchOrders();
      return primaryOrder;
    } catch (error) {
      console.error('Error placing enhanced order:', error);
      toast({
        title: 'Order Failed',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled', 
          cancelled_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });

      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const modifyOrder = async (
    orderId: string, 
    updates: Partial<EnhancedOrder>
  ) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order modified successfully',
      });

      await fetchOrders();
    } catch (error) {
      console.error('Error modifying order:', error);
      toast({
        title: 'Error',
        description: 'Failed to modify order',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return {
    orders,
    orderGroups,
    loading,
    fetchOrders,
    placeEnhancedOrder,
    cancelOrder,
    modifyOrder,
  };
};
