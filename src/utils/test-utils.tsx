
import React, { ReactElement } from 'react';
import { render, RenderOptions, waitFor as rtlWaitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// Explicitly export waitFor
export { rtlWaitFor as waitFor };

// Export the custom render method
export { customRender as render };

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
): jest.MockedFunction<T> => {
  // Use type casting to resolve the type issue
  return jest.fn(implementation) as unknown as jest.MockedFunction<T>;
};

// Extended renderHook function to include waitFor functionality
export const renderHook: any = (hook: any, options?: any) => {
  let result: any = { current: undefined };
  
  function TestComponent() {
    result.current = hook();
    return null;
  }
  
  const utils = render(<TestComponent />, options);
  
  // Add waitFor functionality to the result
  return {
    ...utils,
    result,
    waitFor: async (callback: () => boolean | void) => {
      return rtlWaitFor(callback);
    },
    rerender: () => {
      utils.rerender(<TestComponent />);
    },
  };
};
