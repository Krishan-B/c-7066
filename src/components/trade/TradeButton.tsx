
import { Button } from "@/components/ui/button";
import { TradePanelContext } from "./trade-panel-utils";
import { useContext } from "react";

export interface TradeButtonProps {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "destructive" | "secondary";
  label?: string;
  className?: string;
  onOpen?: () => void;
}

export const TradeButton = ({
  size = "default",
  variant = "default",
  label = "Trade",
  className = "",
  onOpen
}: TradeButtonProps) => {
  const { setOpen } = useContext(TradePanelContext);

  const handleClick = () => {
    setOpen(true);
    if (onOpen) {
      onOpen();
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      className={className}
    >
      {label}
    </Button>
  );
};

export default TradeButton;
