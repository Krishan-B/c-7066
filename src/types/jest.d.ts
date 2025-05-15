
// Import testing-library types
import '@testing-library/jest-dom';

// Extending Jest's matchers with testing-library matchers
declare namespace jest {
  interface Matchers<R, T> {
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
}

// Extend expect interface
declare global {
  namespace jest {
    interface JestMatchers<R = void, T = any> {
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
  }
}
