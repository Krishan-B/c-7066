
// Import testing-library types
import '@testing-library/jest-dom';

// Make sure TypeScript recognizes the extended matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeEmptyDOMElement(): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toBeChecked(): R;
      toBeVisible(): R;
      toBeRequired(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(content: string | RegExp): R;
      toHaveValue(value?: string | string[] | number | null): R;
    }
    
    // For query methods that return Promise
    interface AsymmetricMatchers {
      toBeInTheDocument(): void;
      toBeEmptyDOMElement(): void;
      toHaveClass(className: string): void;
      toBeDisabled(): void;
      toBeChecked(): void;
      toBeVisible(): void;
      toBeRequired(): void;
      toHaveAttribute(attr: string, value?: string): void;
      toHaveTextContent(content: string | RegExp): void;
      toHaveValue(value?: string | string[] | number | null): void;
    }
  }
}

// Add support for asymmetric matchers
declare namespace jest {
  interface Expect {
    toBeInTheDocument(): any;
    toBeEmptyDOMElement(): any;
    toHaveClass(className: string): any;
    toBeDisabled(): any;
    toBeChecked(): any;
    toBeVisible(): any;
    toBeRequired(): any;
    toHaveAttribute(attr: string, value?: string): any;
    toHaveTextContent(content: string | RegExp): any;
    toHaveValue(value?: string | string[] | number | null): any;
  }
}
