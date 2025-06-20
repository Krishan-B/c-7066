
import { Button } from "@/components/ui/button";

interface TradeActionButtonProps {
  action: "buy" | "sell";
  selectedAsset: string;
  isExecuting: boolean;
  marketIsOpen: boolean;
  parsedUnits: number;
  canAfford: boolean;
  buyPrice?: number;
  sellPrice?: number;
}

export const TradeActionButton = ({
  action,
  selectedAsset,
  isExecuting,
  marketIsOpen,
  parsedUnits,
  canAfford,
  buyPrice,
  sellPrice
}: TradeActionButtonProps) => {
  const buttonColor = action === "buy" ? "bg-success hover:bg-success/90" : "bg-warning hover:bg-warning/90";
  const buttonText = isExecuting ? "Processing..." : action === "buy" ? "Buy" : "Sell";
  const price = action === "buy" ? buyPrice : sellPrice;
  
  return (
    <div>
      {price !== undefined && (
        <div className="mb-1">
          <span className="text-sm font-medium">{action === "buy" ? "Buy" : "Sell"} Price: </span>
          <span className="text-sm font-bold">${price?.toFixed(4)}</span>
        </div>
      )}
      <Button
        type="submit"
        className={`w-full text-white ${buttonColor}`}
        disabled={
          isExecuting || 
          (action === "buy" && (!marketIsOpen || !canAfford || parsedUnits <= 0)) ||
          (action === "sell" && (!marketIsOpen || parsedUnits <= 0))
        }
      >
        {buttonText} {selectedAsset}
      </Button>
    </div>
  );
};
