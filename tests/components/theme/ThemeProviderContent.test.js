import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { ThemeProviderContent } from '../../../src/components/theme/ThemeProviderContent';
import { useContext } from 'react';
import { ThemeContext } from '../../../src/components/theme/theme-utils';
beforeAll(() => {
    window.matchMedia = window.matchMedia || function (query) {
        return {
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => { },
            removeEventListener: () => { },
            addListener: () => { },
            removeListener: () => { },
            dispatchEvent: () => false,
        };
    };
});
describe('ThemeProviderContent', () => {
    it('provides default theme and toggleTheme', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let contextValue = null;
        function Consumer() {
            contextValue = useContext(ThemeContext);
            return _jsxs("span", { children: ["Theme: ", contextValue.theme] });
        }
        render(_jsx(ThemeProviderContent, { children: _jsx(Consumer, {}) }));
        expect(screen.getByText(/Theme:/)).toBeInTheDocument();
        expect(contextValue).toHaveProperty('theme');
        expect(contextValue).toHaveProperty('toggleTheme');
        expect(typeof contextValue.toggleTheme).toBe('function');
    });
});
