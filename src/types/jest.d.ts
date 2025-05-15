
// Import testing-library types
import '@testing-library/jest-dom';

// Make TypeScript recognize the custom matchers
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
  }
}

// Add support for Jest's expect interface
interface CustomMatchers<R = unknown> {
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

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface JestMatchers<T> extends CustomMatchers {}
    interface AsymmetricMatchers extends CustomMatchers {}
  }
}

// This export is needed to make this file a module
export {};
