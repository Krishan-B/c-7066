
// Test utilities for mocking and testing

// Global jest mock setup
declare global {
  var jest: any;
}

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
  executeTradeAPI: global.jest?.fn() || (() => {}),
  getAccountMetrics: global.jest?.fn() || (() => {}),
  getUserTrades: global.jest?.fn() || (() => {})
};

// Helper function to create jest mocks safely
export const createMockFn = () => {
  if (typeof global.jest !== 'undefined') {
    return global.jest.fn();
  }
  return () => {};
};
