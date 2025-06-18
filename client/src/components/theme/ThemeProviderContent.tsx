import { useEffect, useState } from 'react';

import { applyThemeToDOM, getInitialTheme, ThemeContext } from './theme-utils';
import type { Theme } from './theme-utils';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProviderContent({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme class to document
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
