import { useState, type ReactNode } from 'react';
import { TradeSlidePanel } from './TradeSlidePanel';
import { TradePanelContext } from './trade-panel-utils';

interface TradePanelProviderProps {
  children: ReactNode;
}

export function TradePanelProviderContent({ children }: TradePanelProviderProps) {
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
