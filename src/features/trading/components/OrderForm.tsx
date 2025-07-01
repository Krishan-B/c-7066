import React, { useState } from "react";
import { useOrderApi } from "@/services/tradingApi";
import { useKYC } from "@/hooks/useKYC";
import { ErrorHandler } from "@/services/errorHandling";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { withErrorBoundary } from "@/components/hoc/withErrorBoundary";

const assetClasses = ["STOCKS", "FOREX", "CRYPTO", "INDICES", "COMMODITIES"];
const directions = ["buy", "sell"];

/**
 * Order Form Component
 * Used for placing new orders in the trading system
 */
export const OrderForm = () => {
  const { placeMarketOrder, placeEntryOrder } = useOrderApi();
  const kyc = useKYC();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    symbol: "",
    asset_class: "STOCKS",
    direction: "buy",
    quantity: 1,
    price: "",
    stop_loss_price: "",
    take_profit_price: "",
    order_type: "market",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle order submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for KYC verification before placing order
    if (!kyc.isVerified) {
      setError("You need to complete KYC verification to place orders.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Validate form inputs
      if (!form.symbol.trim()) {
        throw new Error("Symbol is required");
      }

      if (form.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      // Place the appropriate order type
      if (form.order_type === "market") {
        await placeMarketOrder({
          symbol: form.symbol,
          asset_class: form.asset_class as
            | "STOCKS"
            | "FOREX"
            | "CRYPTO"
            | "INDICES"
            | "COMMODITIES",
          direction: form.direction as "buy" | "sell",
          quantity: form.quantity,
          stop_loss_price: form.stop_loss_price
            ? parseFloat(form.stop_loss_price)
            : undefined,
          take_profit_price: form.take_profit_price
            ? parseFloat(form.take_profit_price)
            : undefined,
        });
      } else {
        if (!form.price) {
          throw new Error("Price is required for limit and stop orders");
        }

        await placeEntryOrder({
          symbol: form.symbol,
          asset_class: form.asset_class as
            | "STOCKS"
            | "FOREX"
            | "CRYPTO"
            | "INDICES"
            | "COMMODITIES",
          direction: form.direction as "buy" | "sell",
          quantity: form.quantity,
          price: parseFloat(form.price),
          order_type: form.order_type as "limit" | "stop",
          stop_loss_price: form.stop_loss_price
            ? parseFloat(form.stop_loss_price)
            : undefined,
          take_profit_price: form.take_profit_price
            ? parseFloat(form.take_profit_price)
            : undefined,
        });
      }

      // Reset form after successful submission
      setForm({
        symbol: "",
        asset_class: "STOCKS",
        direction: "buy",
        quantity: 1,
        price: "",
        stop_loss_price: "",
        take_profit_price: "",
        order_type: "market",
      });

      ErrorHandler.showSuccess("Order placed successfully", {
        description: "Your order has been received and is being processed.",
      });
    } catch (err) {
      ErrorHandler.handleError(err);
      setError(ErrorHandler.getMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Render KYC verification alert if not verified
  const renderKYCAlert = () => {
    if (!kyc.isVerified) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>Complete KYC verification to place orders</span>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/profile?tab=verification")}
            >
              Verify Now
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Place Order</h2>

      {renderKYCAlert()}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            name="symbol"
            value={form.symbol}
            onChange={handleChange}
            placeholder="e.g. AAPL"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Asset Class</label>
          <select
            name="asset_class"
            value={form.asset_class}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {assetClasses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Direction</label>
          <select
            name="direction"
            value={form.direction}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {directions.map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            min="0.00000001"
            step="any"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order Type</label>
          <select
            name="order_type"
            value={form.order_type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
          </select>
        </div>

        {form.order_type !== "market" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              {form.order_type === "limit" ? "Limit Price" : "Stop Price"}
            </label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              step="any"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Stop Loss (optional)
          </label>
          <input
            name="stop_loss_price"
            type="number"
            value={form.stop_loss_price}
            onChange={handleChange}
            step="any"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Take Profit (optional)
          </label>
          <input
            name="take_profit_price"
            type="number"
            value={form.take_profit_price}
            onChange={handleChange}
            step="any"
            className="w-full p-2 border rounded"
          />
        </div>

        <Button
          type="submit"
          className={`w-full ${form.direction === "buy" ? "bg-green-600" : "bg-red-600"}`}
          disabled={loading || !kyc.isVerified}
        >
          {loading
            ? "Processing..."
            : `${form.direction === "buy" ? "Buy" : "Sell"} ${form.symbol || "Asset"}`}
        </Button>
      </form>
    </div>
  );
};

// Export with error boundary wrapper
const OrderFormWithErrorBoundary = withErrorBoundary(OrderForm);
export default OrderFormWithErrorBoundary;
