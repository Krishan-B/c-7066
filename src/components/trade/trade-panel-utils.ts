import { createContext } from 'react';

// Trade Panel Context types
export interface TradePanelContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  openTradePanel: () => void;
  closeTradePanel: () => void;
}

// Create the context with default values
export const TradePanelContext = createContext<TradePanelContextType>({
  open: false,
  setOpen: () => {},
  openTradePanel: () => {},
  closeTradePanel: () => {},
});
