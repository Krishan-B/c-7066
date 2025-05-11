
import { Button } from "@/components/ui/button";

interface TradeActionButtonProps {
  action: "buy" | "sell";
  selectedAsset: string;
  isExecuting: boolean;
  marketIsOpen: boolean;
  parsedUnits: number;
  canAfford: boolean;
}

export const TradeActionButton = ({
  action,
  selectedAsset,
  isExecuting,
  marketIsOpen,
  parsedUnits,
  canAfford,
}: TradeActionButtonProps) => {
  return (
    <Button
      type="submit"
      className={`w-full ${
        action === "buy"
          ? "bg-success hover:bg-success/90"
          : "bg-warning hover:bg-warning/90"
      } text-white`}
      disabled={isExecuting || !marketIsOpen || parsedUnits <= 0 || !canAfford}
    >
      {isExecuting
        ? "Processing..."
        : `${action === "buy" ? "Buy" : "Sell"} ${selectedAsset}`}
    </Button>
  );
};
