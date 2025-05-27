
import { createContext, useState, useContext, type ReactNode } from 'react';
import { TradeSlidePanel } from './TradeSlidePanel';

interface TradePanelContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  openTradePanel: () => void;
  closeTradePanel: () => void;
}

export const TradePanelContext = createContext<TradePanelContextType>({
  open: false,
  setOpen: () => {},
  openTradePanel: () => {},
  closeTradePanel: () => {},
});

export function useTradePanelContext() {
  const context = useContext(TradePanelContext);
  if (!context) {
    throw new Error('useTradePanelContext must be used within a TradePanelProvider');
  }
  return context;
}

export function TradePanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openTradePanel = () => {
    setOpen(true);
  };

  const closeTradePanel = () => {
    setOpen(false);
  };

  return (
    <TradePanelContext.Provider value={{ open, setOpen, openTradePanel, closeTradePanel }}>
      {children}
      <TradeSlidePanel 
        open={open}
        onOpenChange={setOpen}
      />
    </TradePanelContext.Provider>
  );
}
