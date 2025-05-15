
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Explicitly extend the Jest matchers to include testing-library matchers
declare global {
  const describe: typeof jest.describe;
  const test: typeof jest.test;
  const it: typeof jest.it;
  const expect: typeof jest.expect;
  const beforeAll: typeof jest.beforeAll;
  const afterAll: typeof jest.afterAll;
  const beforeEach: typeof jest.beforeEach;
  const afterEach: typeof jest.afterEach;
  const jest: typeof jest;
  
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeEmptyDOMElement(): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toBeChecked(): R;
      toBeVisible(): R;
    }
  }
}

// Augment the built-in expect interface
declare namespace jest {
  interface Expect extends global.Expect {}
  interface InverseAsymmetricMatchers extends global.InverseAsymmetricMatchers {}
  interface Matchers<R> extends global.Matchers<R> {}
}

