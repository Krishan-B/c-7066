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
import { ErrorHandler } from "@/services/errorHandling";

export const useEnhancedOrders = () => {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const enhancedOrders = await enhancedOrdersService.fetchOrders(user.id);
      setOrders(enhancedOrders);
      setOrderGroups(groupOrders(enhancedOrders));
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "data_fetch_error",
          message: "Failed to fetch enhanced orders",
          details: error,
          retryable: true,
        }),
        {
          description: "Unable to load your orders. Please try again.",
          retryFn: async () => await fetchOrders(),
        }
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const placeEnhancedOrder = async (
    symbol: string,
    assetClass: string,
    direction: "buy" | "sell",
    units: number,
    price: number,
    orderType: EnhancedOrderType,
    slTpConfig?: StopLossTakeProfitConfig
  ) => {
    if (!user) {
      throw ErrorHandler.createError({
        code: "authentication_error",
        message: "User not authenticated",
        details: { requiresAuth: true },
      });
    }

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

      ErrorHandler.handleSuccess("Order placed successfully", {
        description: `${direction.toUpperCase()} ${units} ${symbol} at ${price}`,
      });

      await fetchOrders();
      return primaryOrder;
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "order_placement_error",
          message: "Failed to place enhanced order",
          details: {
            error,
            orderDetails: { symbol, direction, units, price, orderType },
          },
          retryable: true,
        }),
        {
          description: `Unable to place ${direction} order for ${symbol}. Please try again.`,
          retryFn: async () => {
            return await placeEnhancedOrder(
              symbol,
              assetClass,
              direction,
              units,
              price,
              orderType,
              slTpConfig
            );
          },
          actionLabel: "Retry",
        }
      );
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await enhancedOrdersService.cancelOrder(orderId);

      ErrorHandler.handleSuccess("Order cancelled", {
        description: "Your order has been cancelled successfully",
      });

      await fetchOrders();
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "order_cancellation_error",
          message: "Failed to cancel order",
          details: { error, orderId },
          retryable: true,
        }),
        {
          description: "Unable to cancel your order. Please try again.",
          retryFn: async () => {
            await cancelOrder(orderId);
          },
        }
      );
    }
  };

  const modifyOrder = async (
    orderId: string,
    updates: Partial<EnhancedOrder>
  ) => {
    try {
      await enhancedOrdersService.modifyOrder(orderId, updates);

      ErrorHandler.handleSuccess("Order modified", {
        description: "Your order has been updated successfully",
      });

      await fetchOrders();
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "order_modification_error",
          message: "Failed to modify order",
          details: { error, orderId, updates },
          retryable: true,
        }),
        {
          description: "Unable to update your order. Please try again.",
          retryFn: async () => {
            await modifyOrder(orderId, updates);
          },
        }
      );
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
