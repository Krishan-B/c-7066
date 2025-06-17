import { useContext } from 'react';
import { render, screen } from '@testing-library/react';

import { ThemeContext } from '../../../src/components/theme/theme-utils';
import { ThemeProviderContent } from '../../../src/components/theme/ThemeProviderContent';

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    function (query: string): MediaQueryList {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      } as MediaQueryList;
    };
});

describe('ThemeProviderContent', () => {
  it('provides default theme and toggleTheme', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contextValue: any = null;
    function Consumer() {
      contextValue = useContext(ThemeContext);
      return <span>Theme: {contextValue.theme}</span>;
    }
    render(
      <ThemeProviderContent>
        <Consumer />
      </ThemeProviderContent>
    );
    expect(screen.getByText(/Theme:/)).toBeInTheDocument();
    expect(contextValue).toHaveProperty('theme');
    expect(contextValue).toHaveProperty('toggleTheme');
    expect(typeof contextValue.toggleTheme).toBe('function');
  });
});
