
import { render, screen } from '@/utils/test-utils';
import MarketOrderForm from '../MarketOrderForm';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@/hooks/useMarketData', () => ({
  useMarketData: jest.fn(() => ({
    marketData: [],
    isLoading: false,
    error: null
  }))
}));

jest.mock('@/hooks/useCombinedMarketData', () => ({
  useCombinedMarketData: jest.fn(() => ({
    marketData: [],
    isLoading: false
  }))
}));

jest.mock('@/hooks/useAccountMetrics', () => ({
  useAccountMetrics: jest.fn(() => ({
    metrics: { availableFunds: 10000 },
    refreshMetrics: jest.fn()
  }))
}));

jest.mock('@/hooks/useTradeExecution', () => ({
  useTradeExecution: jest.fn(() => ({
    executeTrade: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
    isExecuting: false
  }))
}));

jest.mock('@/utils/marketHours', () => ({
  isMarketOpen: jest.fn(() => true)
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user' }
  }))
}));

jest.mock('@/services/trades/validation/tradeValidation', () => ({
  validateTradeWithErrorHandling: jest.fn(() => true)
}));

describe('MarketOrderForm', () => {
  const mockSelectedAsset = {
    name: 'Bitcoin',
    symbol: 'BTCUSD',
    price: 50000,
    market_type: 'Crypto',
    change_percentage: 1.5,
    volume: "$1.2B"
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the component with the correct title', () => {
    render(<MarketOrderForm selectedAsset={mockSelectedAsset} />);
    
    // Get the element and assert it exists
    expect(screen.getByText(`Trade ${mockSelectedAsset.name}`)).toBeInTheDocument();
  });
  
  test('updates asset category when selected asset changes', () => {
    const { rerender } = render(<MarketOrderForm selectedAsset={mockSelectedAsset} />);
    
    // Rerender with different asset type
    const newAsset = { 
      ...mockSelectedAsset, 
      market_type: 'Forex', 
      name: 'EUR/USD',
      change_percentage: 0.5,
      volume: "$500M"
    };
    rerender(<MarketOrderForm selectedAsset={newAsset} />);
    
    // Expect component to reflect the change
    expect(screen.getByText(`Trade ${newAsset.name}`)).toBeInTheDocument();
  });
});
