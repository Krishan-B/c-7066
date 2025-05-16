
import { useState } from "react";
import { executeMarketOrder } from "@/services/trades/orders/marketOrders";
import { placeEntryOrder } from "@/services/trades/orders/entryOrders";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { calculateMarginRequired } from "@/services/trades/accountService";

export type TradeDirection = "buy" | "sell";
export type OrderType = "market" | "entry";

interface TradeParams {
  symbol: string;
  assetCategory: string;
  direction: TradeDirection;
  orderType: OrderType;
  units: number;
  currentPrice: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: string;
  isPaperTrade?: boolean;
}

interface TradeResult {
  success: boolean;
  message: string;
  tradeId?: string;
}

export function useTradeExecution(isPaperTrading: boolean = false) {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { user } = useAuth();

  const executeTrade = async (params: TradeParams): Promise<TradeResult> => {
    if (!user) {
      toast.error("You must be signed in to execute trades");
      return { success: false, message: "Authentication required" };
    }

    if (params.units <= 0) {
      toast.error("Trade units must be greater than zero");
      return { success: false, message: "Invalid units amount" };
    }

    setIsExecuting(true);

    try {
      // Calculate the total amount and required margin
      const totalAmount = params.units * (
        params.orderType === "market" 
          ? params.currentPrice 
          : params.entryPrice || params.currentPrice
      );
      
      const marginRequired = calculateMarginRequired(params.assetCategory, totalAmount);
      
      console.log(`Trade execution: ${params.direction} ${params.units} ${params.symbol} at ${params.currentPrice}, margin required: ${marginRequired}`);
      
      let result;

      if (params.orderType === "market") {
        result = await executeMarketOrder({
          symbol: params.symbol,
          assetCategory: params.assetCategory,
          direction: params.direction,
          units: params.units,
          currentPrice: params.currentPrice,
          stopLoss: params.stopLoss,
          takeProfit: params.takeProfit,
          userId: user.id
        });
      } else {
        if (!params.entryPrice) {
          throw new Error("Entry price is required for entry orders");
        }

        result = await placeEntryOrder({
          symbol: params.symbol,
          assetCategory: params.assetCategory,
          direction: params.direction,
          units: params.units,
          currentPrice: params.currentPrice,
          entryPrice: params.entryPrice,
          stopLoss: params.stopLoss,
          takeProfit: params.takeProfit,
          expiration: params.expiration,
          userId: user.id
        });
      }

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Trade execution failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error('Trade execution error:', error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeTrade,
    isExecuting
  };
}
