import { useState } from "react";

interface OrderApiResponse {
  success: boolean;
  message: string;
}

interface OrderData {
  symbol: string;
  type: "market" | "limit";
  direction: "buy" | "sell";
  quantity: number;
  price?: number;
}

export const useOrderApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeMarketOrder = async (
    orderData: OrderData
  ): Promise<OrderApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        message: "Market order placed successfully",
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const placeEntryOrder = async (
    orderData: OrderData
  ): Promise<OrderApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        message: "Entry order placed successfully",
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    placeMarketOrder,
    placeEntryOrder,
    isLoading,
    error,
  };
};
