import '@testing-library/jest-dom';

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

// You can add more global setup here if needed for your tests.
