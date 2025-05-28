import { render, screen } from '@testing-library/react';
import { TradePanelProviderContent } from '../TradePanelProviderContent';
import { useContext } from 'react';
import { TradePanelContext } from '../trade-panel-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('TradePanelProviderContent', () => {
  it('provides trade panel context values', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contextValue: any = null;
    function Consumer() {
      contextValue = useContext(TradePanelContext);
      return <span>Open: {contextValue.open ? 'yes' : 'no'}</span>;
    }
    render(
      <QueryClientProvider client={queryClient}>
        <TradePanelProviderContent>
          <Consumer />
        </TradePanelProviderContent>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Open:/)).toBeInTheDocument();
    expect(contextValue).toHaveProperty('open');
    expect(contextValue).toHaveProperty('setOpen');
    expect(typeof contextValue.setOpen).toBe('function');
    expect(contextValue).toHaveProperty('openTradePanel');
    expect(typeof contextValue.openTradePanel).toBe('function');
    expect(contextValue).toHaveProperty('closeTradePanel');
    expect(typeof contextValue.closeTradePanel).toBe('function');
  });
});
