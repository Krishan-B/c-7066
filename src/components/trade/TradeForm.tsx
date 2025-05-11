
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { OrderTypeSelector } from '@/components/trade';
import { LeverageSlider } from '@/components/trade';
import { TradeSummary } from '@/components/trade';

interface TradeFormProps {
  action: "buy" | "sell";
  asset: {
    name: string;
    symbol: string;
    price: number;
    change_percentage?: number;
    market_type: string;
  };
  currentPrice: number;
  isLoading: boolean;
  isExecuting: boolean;
  marketIsOpen: boolean;
  onSubmit: (amount: string, orderType: string, leverage: number[]) => void;
}

const TradeForm = ({
  action,
  asset,
  currentPrice,
  isLoading,
  isExecuting,
  marketIsOpen,
  onSubmit
}: TradeFormProps) => {
  const [amount, setAmount] = useState("100");
  const [orderType, setOrderType] = useState("market");
  const [leverage, setLeverage] = useState([1]);
  
  // Calculate estimated values
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * 0.001;
  const total = parsedAmount + fee;

  const handleSubmit = () => {
    onSubmit(amount, orderType, leverage);
  };

  return (
    <div className="mt-4">
      <OrderTypeSelector 
        orderType={orderType} 
        onOrderTypeChange={setOrderType} 
      />
      
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">Amount (USD)</label>
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-secondary/40"
        />
      </div>
      
      <LeverageSlider 
        leverage={leverage} 
        onLeverageChange={setLeverage} 
      />
      
      <div className="mb-4 text-xs bg-secondary/40 p-3 rounded-md border border-secondary/60">
        <div className="flex items-start gap-2">
          <Info className="min-w-4 w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-muted-foreground">
            Trading with leverage increases both potential profits and losses. Make sure you understand the risks before placing an order.
          </p>
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
        type="button" 
        className={`w-full ${action === "buy" ? "bg-success hover:bg-success/80" : "bg-warning hover:bg-warning/80"}`}
        onClick={handleSubmit}
        disabled={!marketIsOpen || isExecuting || isLoading}
      >
        {isExecuting ? "Processing..." : `${action === "buy" ? "Buy" : "Sell"} ${asset.symbol}`}
      </Button>
    </div>
  );
};

export default TradeForm;
