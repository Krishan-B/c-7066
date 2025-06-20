
import type { EnhancedOrder, OrderGroup } from '@/types/enhanced-orders';

export const groupOrders = (ordersList: EnhancedOrder[]): OrderGroup[] => {
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
  
  return groups;
};
