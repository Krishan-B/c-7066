
import React from 'react';
import { render, screen } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import QuickTradePanel from '../QuickTradePanel';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn()
  }))
}));

jest.mock('@/utils/marketHours', () => ({
  isMarketOpen: jest.fn((marketType) => marketType === 'Crypto')
}));

jest.mock('@/hooks/usePriceMovement', () => ({
  usePriceMovement: jest.fn((price) => ({
    buyPrice: price * 1.001,
    sellPrice: price * 0.999
  }))
}));

jest.mock('@/utils/leverageUtils', () => ({
  getLeverageForAssetType: jest.fn(() => 50)
}));

jest.mock('@/utils/metricUtils', () => ({
  mockAccountMetrics: { availableFunds: 10000 }
}));

jest.mock('@/hooks/useTradeCalculations', () => ({
  useTradeCalculations: jest.fn(() => ({
    parsedUnits: 0.01,
    requiredFunds: 100,
    fee: 2,
    total: 102,
    canAfford: true,
    leverage: 50
  }))
}));

describe('QuickTradePanel', () => {
  const mockProps = {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 50000,
    marketType: 'Crypto'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders with correct initial values', () => {
    render(<QuickTradePanel {...mockProps} />);
    
    expect(screen.getByText('Quick Trade')).toBeInTheDocument();
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.getByText('$50000.00')).toBeInTheDocument();
    expect(screen.getByText('Leverage: 50x')).toBeInTheDocument();
  });
  
  test('displays market status alert for closed markets', () => {
    const closedMarketProps = { ...mockProps, marketType: 'Stocks' };
    render(<QuickTradePanel {...closedMarketProps} />);
    
    expect(screen.getByText(/Market is currently closed/i)).toBeInTheDocument();
  });
  
  test('enables buy and sell buttons for open markets', () => {
    render(<QuickTradePanel {...mockProps} />);
    
    const buyButton = screen.getByRole('button', { name: /Buy/i });
    const sellButton = screen.getByRole('button', { name: /Sell/i });
    
    expect(buyButton).not.toBeDisabled();
    expect(sellButton).not.toBeDisabled();
  });
  
  test('shows stop loss inputs when stop loss is checked', async () => {
    render(<QuickTradePanel {...mockProps} />);
    
    const stopLossCheckbox = screen.getByRole('checkbox', { name: /Stop Loss/i });
    await userEvent.click(stopLossCheckbox);
    
    // This test would need to be expanded based on the actual UI implementation
    expect(stopLossCheckbox).toBeChecked();
  });
  
  test('shows take profit inputs when take profit is checked', async () => {
    render(<QuickTradePanel {...mockProps} />);
    
    const takeProfitCheckbox = screen.getByRole('checkbox', { name: /Take Profit/i });
    await userEvent.click(takeProfitCheckbox);
    
    // This test would need to be expanded based on the actual UI implementation
    expect(takeProfitCheckbox).toBeChecked();
  });
});
