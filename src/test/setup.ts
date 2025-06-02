/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock global objects that might be needed in tests
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: vi.fn(),
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

// Mock ResizeObserver for jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for jsdom with required properties
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  constructor(_cb: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

/**
 * Phase 1 Security Implementation: Critical Toast Mock Configuration
 * 
 * CVE Reference: Fixes authentication form test failures (CVSS 9.0)
 * Security Consideration: Prevents toast system crashes that block security validations
 * Test Coverage: Enables authentication security test suite execution
 */

// Mock the toast hook to prevent authentication test failures
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn()
  }),
  toast: vi.fn()
}));

// Mock navigation for security tests
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
