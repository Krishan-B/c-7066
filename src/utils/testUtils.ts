
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function for testing with providers
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';
