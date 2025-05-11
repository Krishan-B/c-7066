
import { Button } from "@/components/ui/button";

interface TradeSlidePanelPriceActionsProps {
  buyPrice: number;
  sellPrice: number;
  onExecuteTrade: (action: "buy" | "sell") => void;
  isExecuting: boolean;
  tradeAction: "buy" | "sell";
  marketIsOpen: boolean;
  orderType: string;
  canAfford: boolean;
  parsedUnits: number;
}

export const TradeSlidePanelPriceActions = ({
  buyPrice,
  sellPrice,
  onExecuteTrade,
  isExecuting,
  tradeAction,
  marketIsOpen,
  orderType,
  canAfford,
  parsedUnits,
}: TradeSlidePanelPriceActionsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Buy Price</div>
        <div className="text-lg font-medium">${buyPrice.toFixed(4)}</div>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={() => onExecuteTrade("buy")}
          disabled={isExecuting || (orderType === "market" && !marketIsOpen) || !canAfford}
        >
          {isExecuting && tradeAction === "buy" ? "Processing..." : "Buy"}
        </Button>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Sell Price</div>
        <div className="text-lg font-medium">${sellPrice.toFixed(4)}</div>
        <Button 
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          onClick={() => onExecuteTrade("sell")}
          disabled={isExecuting || (orderType === "market" && !marketIsOpen) || parsedUnits <= 0}
        >
          {isExecuting && tradeAction === "sell" ? "Processing..." : "Sell"}
        </Button>
      </div>
    </div>
  );
};
