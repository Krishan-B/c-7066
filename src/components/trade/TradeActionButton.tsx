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
  canAfford
}: TradeActionButtonProps) => {
  return;
};