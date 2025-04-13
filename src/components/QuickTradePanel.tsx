
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Info, AlertCircle } from "lucide-react";

interface QuickTradePanelProps {
  asset: {
    name: string;
    symbol: string;
    price: number;
    change: number;
  };
}

const QuickTradePanel = ({ asset }: QuickTradePanelProps) => {
  const [amount, setAmount] = useState("100");
  const [orderType, setOrderType] = useState("market");
  const [leverage, setLeverage] = useState([1]);
  const { toast } = useToast();

  const handleSubmit = (action: "buy" | "sell") => {
    toast({
      title: `Order Placed: ${action.toUpperCase()} ${asset.name}`,
      description: `${action.toUpperCase()} order for $${amount} of ${asset.symbol} at ${leverage[0]}x leverage`,
      variant: action === "buy" ? "default" : "destructive",
    });
  };

  return (
    <div className="glass-card rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Quick Trade</h2>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-muted-foreground">Asset</span>
          <span className="text-sm font-medium">{asset.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Current Price</span>
          <span className="text-sm font-medium">${asset.price.toLocaleString()}</span>
        </div>
      </div>
      
      <Tabs defaultValue="buy" className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-1 block">Order Type</label>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant={orderType === "market" ? "default" : "outline"} 
                className="flex-1 text-xs" 
                onClick={() => setOrderType("market")}
              >
                Market
              </Button>
              <Button 
                type="button" 
                variant={orderType === "limit" ? "default" : "outline"} 
                className="flex-1 text-xs" 
                onClick={() => setOrderType("limit")}
              >
                Limit
              </Button>
              <Button 
                type="button" 
                variant={orderType === "stop" ? "default" : "outline"} 
                className="flex-1 text-xs" 
                onClick={() => setOrderType("stop")}
              >
                Stop
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-1 block">Amount (USD)</label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/40"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-sm text-muted-foreground">Leverage</label>
              <span className="text-sm font-medium">{leverage[0]}x</span>
            </div>
            <Slider
              defaultValue={[1]}
              max={25}
              min={1}
              step={1}
              value={leverage}
              onValueChange={setLeverage}
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>1x</span>
              <span>10x</span>
              <span>25x</span>
            </div>
          </div>
          
          <div className="mb-4 text-xs bg-secondary/40 p-3 rounded-md border border-secondary/60">
            <div className="flex items-start gap-2">
              <Info className="min-w-4 w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground">
                Trading with leverage increases both potential profits and losses. Make sure you understand the risks before placing an order.
              </p>
            </div>
          </div>
          
          <div className="mb-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Est. Price</span>
              <span className="text-xs">${asset.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Amount</span>
              <span className="text-xs">${amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Fee (0.1%)</span>
              <span className="text-xs">${(parseFloat(amount) * 0.001).toFixed(2)}</span>
            </div>
            <div className="border-t border-secondary/40 my-1 pt-1"></div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-xs font-medium">${(parseFloat(amount) * 1.001).toFixed(2)}</span>
            </div>
          </div>
          
          <TabsContent value="buy" className="mt-0">
            <Button type="button" className="w-full bg-success hover:bg-success/80" onClick={() => handleSubmit("buy")}>
              Buy {asset.symbol}
            </Button>
          </TabsContent>
          <TabsContent value="sell" className="mt-0">
            <Button type="button" className="w-full bg-warning hover:bg-warning/80" onClick={() => handleSubmit("sell")}>
              Sell {asset.symbol}
            </Button>
          </TabsContent>
        </div>
      </Tabs>
      
      <Button variant="outline" className="w-full flex gap-2 mt-2">
        <CreditCard className="w-4 h-4" />
        <span>Deposit Funds</span>
      </Button>
    </div>
  );
};

export default QuickTradePanel;
