import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isMarketOpen } from "@/utils/marketHours";
import { TradeActionButton } from "./TradeActionButton";
import { usePriceMovement } from "@/hooks/usePriceMovement";
import { UnitsInput } from "./UnitsInput";
import { StopLossCheckbox } from "./StopLossCheckbox";
import { TakeProfitCheckbox } from "./TakeProfitCheckbox";
import { MarketStatusAlert } from "./MarketStatusAlert";
import { TradeSummary } from "./TradeSummary";
import { getLeverageForAssetType } from "@/utils/leverageUtils";
import { mockAccountMetrics } from "@/utils/metricUtils";
import { useTradeCalculations } from "@/hooks/useTradeCalculations";

export interface QuickTradePanelProps {
  symbol: string;
  name: string;
  price: number;
  marketType: string;
}

export default function QuickTradePanel({ symbol, name, price, marketType }: QuickTradePanelProps) {
  const { toast } = useToast();
  const [units, setUnits] = useState("0.01");
  const [hasStopLoss, setHasStopLoss] = useState(false);
  const [hasTakeProfit, setHasTakeProfit] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Get dynamic prices with small movement simulation
  const { buyPrice, sellPrice } = usePriceMovement(price);
  
  // Check if market is open for the selected asset
  const marketIsOpen = isMarketOpen(marketType);
  
  // Get the fixed leverage for the selected asset type
  const fixedLeverage = getLeverageForAssetType(marketType);
  
  // Get user's available funds
  const availableFunds = mockAccountMetrics.availableFunds;
  
  // Use the trade calculations hook
  const {
    parsedUnits,
    requiredFunds,
    fee,
    total,
    canAfford
  } = useTradeCalculations(
    units,
    price,
    marketType,
    availableFunds
  );
  
  const handleExecuteTrade = async (action: "buy" | "sell") => {
    if (!marketIsOpen) {
      toast({
        title: "Market Closed",
        description: "The market is currently closed. Please try again during market hours.",
        variant: "destructive",
      });
      return;
    }
    
    if (!canAfford && action === "buy") {
      toast({
        title: "Insufficient Funds",
        description: "You do not have enough funds to execute this trade.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExecuting(true);
    
    try {
      // Simulate network delay for trade execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: `Order Executed: ${action.toUpperCase()} ${symbol}`,
        description: `${action === "buy" ? "Bought" : "Sold"} ${parsedUnits} units at $${(action === "buy" ? buyPrice : sellPrice).toFixed(2)}`,
        variant: action === "buy" ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "There was an error executing your trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Quick Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Status Alert */}
        <MarketStatusAlert marketType={marketType} isOpen={marketIsOpen} />
        
        {/* Asset Information */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{name}</h3>
            <span className="text-lg font-bold">${price.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{symbol}</span>
            <span>Leverage: {fixedLeverage}x</span>
          </div>
        </div>
        
        {/* Trade Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <TradeActionButton 
            action="buy" 
            price={buyPrice} 
            onClick={() => handleExecuteTrade("buy")}
            disabled={isExecuting || !canAfford}
            selectedAsset={symbol}
            marketIsOpen={marketIsOpen}
            parsedUnits={parsedUnits}
            canAfford={canAfford}
          />
          <TradeActionButton 
            action="sell" 
            price={sellPrice} 
            onClick={() => handleExecuteTrade("sell")}
            disabled={isExecuting}
            selectedAsset={symbol}
            marketIsOpen={marketIsOpen}
            parsedUnits={parsedUnits}
          />
        </div>
        
        {/* Units Input */}
        <UnitsInput 
          units={units}
          setUnits={setUnits}
          isExecuting={isExecuting}
          value={units}
          onChange={setUnits}
          disabled={isExecuting}
          requiredFunds={requiredFunds}
          canAfford={canAfford}
          availableFunds={availableFunds}
        />
        
        {/* Stop Loss Checkbox */}
        <StopLossCheckbox
          hasStopLoss={hasStopLoss}
          setHasStopLoss={setHasStopLoss}
          isExecuting={isExecuting}
          checked={hasStopLoss}
          onCheckedChange={setHasStopLoss}
          disabled={isExecuting}
        />
        
        {/* Take Profit Checkbox */}
        <TakeProfitCheckbox
          hasTakeProfit={hasTakeProfit}
          setHasTakeProfit={setHasTakeProfit}
          isExecuting={isExecuting}
          checked={hasTakeProfit}
          onCheckedChange={setHasTakeProfit}
          disabled={isExecuting}
        />
        
        {/* Trade Summary */}
        <TradeSummary
          currentPrice={price}
          parsedAmount={parsedUnits * price}
          fee={fee}
          total={total}
          positionValue={parsedUnits * price}
          marginRequirement={requiredFunds}
          totalCost={total}
        />
      </CardContent>
    </Card>
  );
}
