import { useContext } from 'react';
import { TradePanelContext } from './trade-panel-utils';

export function useTradePanelContext() {
  const context = useContext(TradePanelContext);
  if (!context) {
    throw new Error('useTradePanelContext must be used within a TradePanelProvider');
  }
  return context;
}
