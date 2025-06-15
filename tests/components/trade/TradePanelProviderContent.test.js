import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { TradePanelProviderContent } from '../../../src/components/trade/TradePanelProviderContent';
import { useContext } from 'react';
import { TradePanelContext } from '../../../src/components/trade/trade-panel-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
describe('TradePanelProviderContent', () => {
    it('provides trade panel context values', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let contextValue = null;
        function Consumer() {
            contextValue = useContext(TradePanelContext);
            return _jsxs("span", { children: ["Open: ", contextValue.open ? 'yes' : 'no'] });
        }
        render(_jsx(QueryClientProvider, { client: queryClient, children: _jsx(TradePanelProviderContent, { children: _jsx(Consumer, {}) }) }));
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
