import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { safeFetch } from "./safeFetch";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function useOrderApi() {
  const { session } = useAuth();
  const token = session?.access_token;

  // Place market order
  const placeMarketOrder = useCallback(
    async (order) => {
      if (!token) throw new Error("Not authenticated");
      return safeFetch(`${API_URL}/orders/market`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(order),
      });
    },
    [token]
  );

  // Place entry order
  const placeEntryOrder = useCallback(
    async (order) => {
      if (!token) throw new Error("Not authenticated");
      return safeFetch(`${API_URL}/orders/entry`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(order),
      });
    },
    [token]
  );

  // Get all orders
  const getOrders = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    return safeFetch(`${API_URL}/orders`, {
      headers: authHeaders(token),
    });
  }, [token]);

  // Get pending orders
  const getPendingOrders = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    return safeFetch(`${API_URL}/orders/pending`, {
      headers: authHeaders(token),
    });
  }, [token]);

  // Modify order
  const modifyOrder = useCallback(
    async (id, updates) => {
      if (!token) throw new Error("Not authenticated");
      return safeFetch(`${API_URL}/orders/${id}`, {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(updates),
      });
    },
    [token]
  );

  // Cancel order
  const cancelOrder = useCallback(
    async (id) => {
      if (!token) throw new Error("Not authenticated");
      return safeFetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
    },
    [token]
  );

  return {
    placeMarketOrder,
    placeEntryOrder,
    getOrders,
    getPendingOrders,
    modifyOrder,
    cancelOrder,
  };
}

export function usePositionApi() {
  const { session } = useAuth();
  const token = session?.access_token;

  // Get open positions
  const getPositions = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    return safeFetch(`${API_URL}/positions`, {
      headers: authHeaders(token),
    });
  }, [token]);

  // Close position
  const closePosition = useCallback(
    async (id) => {
      if (!token) throw new Error("Not authenticated");
      return safeFetch(`${API_URL}/positions/${id}/close`, {
        method: "POST",
        headers: authHeaders(token),
      });
    },
    [token]
  );

  return {
    getPositions,
    closePosition,
  };
}
