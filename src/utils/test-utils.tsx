
import React, { ReactElement } from 'react';
import { render, RenderOptions, waitFor as rtlWaitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Create a custom render method that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Explicitly export waitFor
export { rtlWaitFor as waitFor };

// Explicitly declare Jest mocking utilities for TypeScript
export const mockAuthHook = (isAuthenticated = true) => {
  jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
      user: isAuthenticated ? { id: 'test-user-id', email: 'test@example.com' } : null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    }),
  }));
};

// Helper to create mock functions with type safety
export const createMockFn = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.Mock<ReturnType<T>, Parameters<T>> => {
  return jest.fn(implementation) as jest.Mock<ReturnType<T>, Parameters<T>>;
};

// Extended renderHook function to include waitFor functionality
export const renderHook = <TResult, TProps>(hook: (props: TProps) => TResult, options?: any) => {
  let result: { current: TResult } = { current: undefined as unknown as TResult };
  
  function TestComponent(props: TProps) {
    result.current = hook(props);
    return null;
  }
  
  const utils = render(React.createElement(TestComponent, options?.initialProps));
  
  // Add waitFor functionality to the result
  return {
    ...utils,
    result,
    waitFor: async (callback: () => boolean | void) => {
      return rtlWaitFor(callback);
    },
    rerender: (newProps?: TProps) => {
      utils.rerender(React.createElement(TestComponent, newProps));
    },
  };
};
