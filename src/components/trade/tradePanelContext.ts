import { createContext, useContext } from "react";

interface TradePanelContextType {
  open: boolean;
  openTradePanel: () => void;
  closeTradePanel: () => void;
}

export const TradePanelContext = createContext<
  TradePanelContextType | undefined
>(undefined);

export function useTradePanelContext() {
  const context = useContext(TradePanelContext);
  if (!context) {
    throw new Error(
      "useTradePanelContext must be used within a TradePanelProvider"
    );
  }
  return context;
}
