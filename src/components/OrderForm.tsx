import React, { useState } from "react";
import { useOrderApi } from "../services/tradingApi";
import { useKYC } from "@/hooks/useKYC";
import { ErrorHandler } from "@/services/errorHandling";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { withErrorBoundary } from "./hoc/withErrorBoundary";

const assetClasses = ["STOCKS", "FOREX", "CRYPTO", "INDICES", "COMMODITIES"];
const directions = ["buy", "sell"];

const OrderForm = () => {
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

  // You may need to adjust this logic based on your actual KYC verification status implementation
  const [kycComplete, setKycComplete] = useState(false);

  React.useEffect(() => {
    // Example: get verification status and set kycComplete accordingly
    kyc.getKYCStatus().then((status: { verified?: boolean } | string) => {
      // Adjust the condition below based on your actual status structure
      setKycComplete(
        status === "VERIFIED" ||
          (typeof status === "object" && status?.verified === true)
      );
    });
  }, [kyc]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, order_type: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check KYC status before allowing trading
    if (!kycComplete) {
      setError(
        "KYC verification required. Please complete KYC verification before trading."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (form.order_type === "entry") {
        await placeEntryOrder({
          ...form,
          direction: form.direction as "buy" | "sell",
          price: parseFloat(form.price),
          // Remove stop_loss_price and take_profit_price if not in OrderRequest type
        });

        ErrorHandler.handleSuccess("Entry order placed successfully", {
          description: `${form.quantity} × ${form.symbol} at ${form.price}`,
        });
      } else {
        await placeMarketOrder({
          symbol: form.symbol,
          direction: form.direction as "buy" | "sell",
          quantity: Number(form.quantity),
          price: form.price ? parseFloat(form.price) : undefined,
        });

        ErrorHandler.handleSuccess("Market order placed successfully", {
          description: `${form.quantity} × ${form.symbol} at market price`,
        });
      }

      // Reset form
      setForm((f) => ({
        ...f,
        symbol: "",
        quantity: 1,
        price: "",
        stop_loss_price: "",
        take_profit_price: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "order_placement_error",
          message:
            err instanceof Error ? err.message : "Order placement failed",
          details: err,
          retryable: true,
        }),
        {
          description: `Failed to place ${form.order_type} order for ${form.symbol}`,
          retryFn: async () => {
            handleSubmit(e);
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-4 border rounded bg-white dark:bg-gray-900"
    >
      <h2 className="text-lg font-bold mb-2">Place Order</h2>

      {/* KYC Warning */}
      {!kycComplete && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between text-orange-800">
            <span>Complete KYC verification to start trading</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/kyc")}
              className="ml-4"
            >
              Verify KYC
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <label className="block mb-1">Order Type</label>
        <select
          name="order_type"
          value={form.order_type}
          onChange={handleTypeChange}
          className="w-full p-2 border rounded"
        >
          <option value="market">Market</option>
          <option value="entry">Entry (Limit)</option>
        </select>
      </div>
      <div>
        <label className="block mb-1">Symbol</label>
        <input
          name="symbol"
          value={form.symbol}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Asset Class</label>
        <select
          name="asset_class"
          value={form.asset_class}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          {assetClasses.map((ac) => (
            <option key={ac} value={ac}>
              {ac}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Direction</label>
        <select
          name="direction"
          value={form.direction}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          {directions.map((d) => (
            <option key={d} value={d}>
              {d.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Quantity</label>
        <input
          name="quantity"
          type="number"
          min="1"
          value={form.quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      {form.order_type === "entry" && (
        <div>
          <label className="block mb-1">Entry Price</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required={form.order_type === "entry"}
          />
        </div>
      )}
      <div>
        <label className="block mb-1">Stop Loss Price</label>
        <input
          name="stop_loss_price"
          type="number"
          value={form.stop_loss_price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Take Profit Price</label>
        <input
          name="take_profit_price"
          type="number"
          value={form.take_profit_price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        disabled={loading || !kycComplete}
      >
        {loading ? "Placing..." : kycComplete ? "Place Order" : "KYC Required"}
      </button>
    </form>
  );
};

const OrderFormWrapped = withErrorBoundary(OrderForm, "order_form");
export { OrderFormWrapped as OrderForm };
export default OrderFormWrapped;
