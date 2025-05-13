
import { supabase } from "@/integrations/supabase/client";
import { updatePortfolio } from "../portfolio";

/**
 * Close an open position
 */
export async function closePosition(
  tradeId: string,
  currentPrice: number
): Promise<{ success: boolean; message: string }> {
  try {
    // Get the trade details
    const { data: trade, error: tradeError } = await supabase
      .from("user_trades")
      .select("*")
      .eq("id", tradeId)
      .single();

    if (tradeError || !trade) {
      return { success: false, message: `Error fetching trade: ${tradeError?.message || "Trade not found"}` };
    }

    // Check if the trade is already closed
    if (trade.status !== "open") {
      return { success: false, message: `Trade is not open (current status: ${trade.status})` };
    }

    // Calculate profit/loss
    const pnl = trade.trade_type === "buy"
      ? (currentPrice - trade.price_per_unit) * trade.units
      : (trade.price_per_unit - currentPrice) * trade.units;

    // Update the trade status
    const { error: updateError } = await supabase
      .from("user_trades")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        pnl: pnl,
        current_price: currentPrice
      })
      .eq("id", tradeId);

    if (updateError) {
      return { success: false, message: `Error updating trade: ${updateError.message}` };
    }

    // Update the user's portfolio
    const portfolioUpdateResult = await updatePortfolio(
      trade.user_id,
      trade.asset_symbol,
      trade.market_type,
      currentPrice,
      pnl,
      false
    );

    if (!portfolioUpdateResult.success) {
      return { success: false, message: portfolioUpdateResult.message };
    }

    return {
      success: true,
      message: `Position closed successfully with ${pnl > 0 ? "profit" : "loss"} of $${Math.abs(pnl).toFixed(2)}`
    };
  } catch (error) {
    console.error("Error closing position:", error);
    return { success: false, message: `An unexpected error occurred: ${error}` };
  }
}

/**
 * Cancel a pending order
 */
export async function cancelPendingOrder(
  tradeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get the trade details
    const { data: trade, error: tradeError } = await supabase
      .from("user_trades")
      .select("*")
      .eq("id", tradeId)
      .single();

    if (tradeError || !trade) {
      return { success: false, message: `Error fetching trade: ${tradeError?.message || "Trade not found"}` };
    }

    // Check if the trade is pending
    if (trade.status !== "pending") {
      return { success: false, message: `Trade is not pending (current status: ${trade.status})` };
    }

    // Update the trade status
    const { error: updateError } = await supabase
      .from("user_trades")
      .update({
        status: "cancelled",
        closed_at: new Date().toISOString()
      })
      .eq("id", tradeId);

    if (updateError) {
      return { success: false, message: `Error cancelling order: ${updateError.message}` };
    }

    // Release the funds back to the user account
    const { error: accountError } = await supabase
      .from("user_account")
      .update({
        available_funds: supabase.rpc("calculate_available_funds_increase", {
          amount: trade.total_amount
        })
      })
      .eq("id", trade.user_id);

    if (accountError) {
      console.error("Error updating account funds:", accountError);
      // Still consider it successful since the order was cancelled
    }

    return {
      success: true,
      message: `Order cancelled successfully`
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, message: `An unexpected error occurred: ${error}` };
  }
}
