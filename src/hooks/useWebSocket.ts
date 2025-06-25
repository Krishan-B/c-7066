import { useState, useEffect } from "react";
import { websocketService } from "../services/websocketService";
import type { Account } from "@/types/account";
import type { Order } from "../types/order";
import type { Position } from "@/types/position";

export function useWebSocket() {
  const [accountMetrics, setAccountMetrics] = useState<Account | null>(null);
  const [orderUpdates, setOrderUpdates] = useState<Order | null>(null);
  const [positionUpdates, setPositionUpdates] = useState<Position | null>(null);

  useEffect(() => {
    websocketService.connect();

    const handleAccountUpdate = (data: Account) => setAccountMetrics(data);
    const handleOrderUpdate = (data: Order) => setOrderUpdates(data);
    const handlePositionUpdate = (data: Position) => setPositionUpdates(data);

    websocketService.on("ACCOUNT_METRICS_UPDATE", handleAccountUpdate);
    websocketService.on("ORDER_FILLED", handleOrderUpdate);
    websocketService.on("ORDER_PENDING", handleOrderUpdate);
    websocketService.on("ORDER_CANCELLED", handleOrderUpdate);
    websocketService.on("POSITION_CLOSED", handlePositionUpdate);

    return () => {
      websocketService.off("ACCOUNT_METRICS_UPDATE", handleAccountUpdate);
      websocketService.off("ORDER_FILLED", handleOrderUpdate);
      websocketService.off("ORDER_PENDING", handleOrderUpdate);
      websocketService.off("ORDER_CANCELLED", handleOrderUpdate);
      websocketService.off("POSITION_CLOSED", handlePositionUpdate);
      websocketService.disconnect();
    };
  }, []);

  return { accountMetrics, orderUpdates, positionUpdates };
}
