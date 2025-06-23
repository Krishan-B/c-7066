import { Button, ButtonProps } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTradePanelContext } from "./tradePanelContext";

interface TradeButtonProps extends ButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  showIcon?: boolean;
  label?: string;
}

export function TradeButton({
  variant = "default",
  size,
  showIcon = true,
  label = "New Trade",
  className,
  ...props
}: TradeButtonProps) {
  const { openTradePanel } = useTradePanelContext();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={openTradePanel}
      className={className}
      {...props}
    >
      {showIcon && <Plus className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}
