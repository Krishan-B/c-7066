// Test utilities for mocking and testing

export const mockData = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com'
  },
  asset: {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    price: 50000,
    market_type: 'crypto'
  },
  trade: {
    id: 'test-trade-id',
    symbol: 'BTC-USD',
    direction: 'buy',
    units: 1,
    price: 50000,
    status: 'open'
  }
};

// Mock functions for testing
export const mockFunctions = {
  executeTradeAPI: typeof global.jest === 'object' && global.jest && 'fn' in global.jest ? (global.jest as { fn: () => unknown }).fn() : (() => {}),
  getAccountMetrics: typeof global.jest === 'object' && global.jest && 'fn' in global.jest ? (global.jest as { fn: () => unknown }).fn() : (() => {}),
  getUserTrades: typeof global.jest === 'object' && global.jest && 'fn' in global.jest ? (global.jest as { fn: () => unknown }).fn() : (() => {})
};

// Helper function to create jest mocks safely
export const createMockFn = () => {
  if (typeof global.jest === 'object' && global.jest && 'fn' in global.jest) {
    return (global.jest as { fn: () => unknown }).fn();
  }
  return () => {};
};
