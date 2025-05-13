
import { Button } from "@/components/ui/button";

interface TradeActionButtonProps {
  action: "buy" | "sell";
  price?: number;
  onClick: () => void;
  disabled: boolean;
  selectedAsset?: string;
  isExecuting?: boolean;
  marketIsOpen?: boolean;
  parsedUnits?: number;
  canAfford?: boolean;
  buyPrice?: number;
  sellPrice?: number;
}

export const TradeActionButton = ({
  action,
  price,
  onClick,
  disabled,
  selectedAsset = "",
  isExecuting = false,
  marketIsOpen = true,
  parsedUnits = 0,
  canAfford = true,
  buyPrice,
  sellPrice
}: TradeActionButtonProps) => {
  const buttonColor = action === "buy" ? "bg-success hover:bg-success/90" : "bg-warning hover:bg-warning/90";
  const buttonText = isExecuting ? "Processing..." : action === "buy" ? "Buy" : "Sell";
  const displayPrice = price !== undefined ? price : (action === "buy" ? buyPrice : sellPrice);
  
  return (
    <div>
      {displayPrice !== undefined && (
        <div className="mb-1">
          <span className="text-sm font-medium">{action === "buy" ? "Buy" : "Sell"} Price: </span>
          <span className="text-sm font-bold">${displayPrice?.toFixed(4)}</span>
        </div>
      )}
      <Button
        type="submit"
        className={`w-full text-white ${buttonColor}`}
        onClick={onClick}
        disabled={disabled}
      >
        {buttonText} {selectedAsset}
      </Button>
    </div>
  );
};
