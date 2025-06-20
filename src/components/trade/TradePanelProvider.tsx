
import { createContext, useState, useContext, ReactNode } from 'react';
import { TradeSlidePanel } from './TradeSlidePanel';

interface TradePanelContextType {
  open: boolean;
  openTradePanel: () => void;
  closeTradePanel: () => void;
}

const TradePanelContext = createContext<TradePanelContextType | undefined>(undefined);

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
    <TradePanelContext.Provider value={{ open, openTradePanel, closeTradePanel }}>
      {children}
      <TradeSlidePanel 
        open={open}
        onOpenChange={setOpen}
      />
    </TradePanelContext.Provider>
  );
}
