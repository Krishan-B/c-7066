
import '@testing-library/jest-dom';

// Explicitly extend the Jest matchers to include testing-library matchers
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
    }
  }

  // Extend the matchers with testing-library matchers
  namespace jest {
    interface InverseAsymmetricMatchers {}
    interface AsymmetricMatchers {}
  }
}

// Augment the built-in expect interface
declare namespace jest {
  interface Expect {
    toBeInTheDocument: () => any;
    toBeEmptyDOMElement: () => any;
    toHaveClass: (className: string) => any;
    toBeDisabled: () => any;
    toBeChecked: () => any;
    toBeVisible: () => any;
    toBeRequired: () => any;
    toHaveAttribute: (attr: string, value?: string) => any;
    toHaveTextContent: (content: string | RegExp) => any;
  }
  interface InverseAsymmetricMatchers {}
  interface AsymmetricMatchers {}
}

// Augment ElementHandle with matchers
declare global {
  namespace jest {
    interface JestMatchers<R> {
      toBeInTheDocument(): R;
      toBeEmptyDOMElement(): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toBeChecked(): R;
      toBeVisible(): R;
      toBeRequired(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(content: string | RegExp): R;
    }
  }
}
