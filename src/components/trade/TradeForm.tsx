
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTypeSelector } from "@/components/trade";
import { TradeSummary } from "@/components/trade"; 
import { formatLeverageRatio } from "@/utils/leverageUtils";

interface TradeFormProps {
  action: "buy" | "sell";
  asset: {
    name: string;
    symbol: string;
    price: number;
    market_type: string;
  };
  currentPrice: number;
  isLoading: boolean;
  isExecuting: boolean;
  marketIsOpen: boolean;
  fixedLeverage?: number;
  onSubmit: (amount: string, orderType: string, leverage?: number[]) => void;
}

const TradeForm = ({
  action,
  asset,
  currentPrice,
  isLoading,
  isExecuting,
  marketIsOpen,
  fixedLeverage = 1, // Default to 1:1 (no leverage) if not provided
  onSubmit,
}: TradeFormProps) => {
  const [amount, setAmount] = useState("100");
  const [orderType, setOrderType] = useState("market");
  
  // Calculate total based on amount
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * 0.001; // 0.1% fee
  const total = parsedAmount + fee;
  
  // Calculate estimated quantity
  const estimatedQuantity = currentPrice > 0 ? parsedAmount / currentPrice : 0;
  
  // Calculate required margin based on fixed leverage
  const marginRequirement = parsedAmount / fixedLeverage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(amount, orderType, [fixedLeverage]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div>
        <label htmlFor="amount" className="text-sm font-medium block mb-1">
          Amount (USD)
        </label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full"
          disabled={isExecuting}
        />
        <div className="flex justify-between mt-1">
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setAmount("100")}
          >
            $100
          </button>
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setAmount("500")}
          >
            $500
          </button>
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setAmount("1000")}
          >
            $1,000
          </button>
          <button
            type="button"
            className="text-xs text-primary"
            onClick={() => setAmount("5000")}
          >
            $5,000
          </button>
        </div>
      </div>
      
      <OrderTypeSelector
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        disabled={isExecuting}
      />
      
      {/* Display leverage info */}
      <div className="flex justify-between items-center p-2 bg-primary/10 rounded-md">
        <span className="text-xs">Fixed Leverage</span>
        <span className="text-xs font-medium">{formatLeverageRatio(fixedLeverage)}</span>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Est. Quantity</span>
          <span className="text-xs">
            {isLoading ? "Loading..." : estimatedQuantity.toFixed(6)} {asset.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Required Margin</span>
          <span className="text-xs">${marginRequirement.toFixed(2)}</span>
        </div>
      </div>
      
      <TradeSummary
        currentPrice={currentPrice}
        parsedAmount={parsedAmount}
        fee={fee}
        total={total}
        isLoading={isLoading}
      />
      
      <Button
        type="submit"
        className={`w-full ${
          action === "buy"
            ? "bg-success hover:bg-success/90"
            : "bg-warning hover:bg-warning/90"
        } text-white`}
        disabled={isExecuting || !marketIsOpen || parsedAmount <= 0}
      >
        {isExecuting
          ? "Processing..."
          : `${action === "buy" ? "Buy" : "Sell"} ${asset.symbol}`}
      </Button>
    </form>
  );
};

export default TradeForm;
