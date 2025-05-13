
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTradePanelContext } from "./TradePanelProvider";

interface TradeButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TradeButton({ variant = "default", size = "default" }: TradeButtonProps) {
  const { openTradePanel } = useTradePanelContext();
  
  return (
    <Button
      onClick={openTradePanel}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      <span>New Trade</span>
    </Button>
  );
}
