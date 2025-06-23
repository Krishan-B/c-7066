import { ReactNode, useState } from "react";
import { TradeSlidePanel } from "./TradeSlidePanel";
import { TradePanelContext } from "./tradePanelContext";

export function TradePanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openTradePanel = () => {
    setOpen(true);
  };

  const closeTradePanel = () => {
    setOpen(false);
  };

  return (
    <TradePanelContext.Provider
      value={{ open, openTradePanel, closeTradePanel }}
    >
      {children}
      <TradeSlidePanel open={open} onOpenChange={setOpen} />
    </TradePanelContext.Provider>
  );
}
