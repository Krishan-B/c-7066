
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface TradeActionButtonProps {
  action: "buy" | "sell";
  price: number;  // Required price prop
  onClick: () => void;
  disabled?: boolean;
  selectedAsset: string;
  marketIsOpen: boolean;
  parsedUnits: number;
  canAfford?: boolean;
  buyPrice?: number;
  sellPrice?: number;
  isExecuting?: boolean;
  className?: string;
}

export const TradeActionButton: React.FC<TradeActionButtonProps> = ({
  action,
  price,
  onClick,
  disabled = false,
  selectedAsset,
  marketIsOpen,
  parsedUnits,
  canAfford = true,
  buyPrice,
  sellPrice,
  isExecuting = false,
  className
}) => {
  // Use provided price or fall back to action-specific price
  const displayPrice = action === "buy" 
    ? (buyPrice ?? price)
    : (sellPrice ?? price);
  
  const isBuyDisabled = disabled || !marketIsOpen || !canAfford || parsedUnits <= 0 || isExecuting;
  const isSellDisabled = disabled || !marketIsOpen || parsedUnits <= 0 || isExecuting;
  
  return (
    <Button
      className={`w-full ${
        action === "buy" 
          ? "bg-success text-white hover:bg-success/90" 
          : "bg-warning text-white hover:bg-warning/90"
      } ${className || ''}`}
      onClick={onClick}
      disabled={action === "buy" ? isBuyDisabled : isSellDisabled}
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center gap-1">
          {action === "buy" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span className="font-medium">
            {action === "buy" ? "Buy" : "Sell"} {selectedAsset}
          </span>
        </div>
        <div className="text-sm mt-1">${displayPrice.toFixed(2)}</div>
      </div>
    </Button>
  );
};
