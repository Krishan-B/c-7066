import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { enhancedOrdersService } from "@/services/enhancedOrdersService";
import type {
  EnhancedOrder,
  EnhancedOrderType,
  OrderGroup,
  StopLossTakeProfitConfig,
} from "@/types/enhanced-orders";
import { groupOrders } from "@/utils/orderGroupUtils";
import { useCallback, useEffect, useState } from "react";

export const useEnhancedOrders = () => {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const enhancedOrders = await enhancedOrdersService.fetchOrders(user.id);
      setOrders(enhancedOrders);
      setOrderGroups(groupOrders(enhancedOrders));
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const placeEnhancedOrder = async (
    symbol: string,
    assetClass: string,
    direction: "buy" | "sell",
    units: number,
    price: number,
    orderType: EnhancedOrderType,
    slTpConfig?: StopLossTakeProfitConfig
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const primaryOrder = await enhancedOrdersService.placeEnhancedOrder(
        user.id,
        symbol,
        assetClass,
        direction,
        units,
        price,
        orderType,
        slTpConfig
      );

      toast({
        title: "Success",
        description: "Enhanced order placed successfully",
      });

      await fetchOrders();
      return primaryOrder;
    } catch (error) {
      console.error("Error placing enhanced order:", error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await enhancedOrdersService.cancelOrder(orderId);

      toast({
        title: "Success",
        description: "Order cancelled successfully",
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const modifyOrder = async (
    orderId: string,
    updates: Partial<EnhancedOrder>
  ) => {
    try {
      await enhancedOrdersService.modifyOrder(orderId, updates);

      toast({
        title: "Success",
        description: "Order modified successfully",
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error modifying order:", error);
      toast({
        title: "Error",
        description: "Failed to modify order",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

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
