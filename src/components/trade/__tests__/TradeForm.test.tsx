
import React from 'react';
import { render, screen } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import TradeForm from '../TradeForm';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

describe('TradeForm', () => {
  const mockAsset = {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 50000,
    market_type: 'Crypto'
  };
  
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders form with correct initial values', () => {
    render(
      <TradeForm
        action="buy"
        asset={mockAsset}
        currentPrice={50000}
        isLoading={false}
        isExecuting={false}
        marketIsOpen={true}
        onSubmit={mockOnSubmit}
        availableFunds={10000}
      />
    );
    
    expect(screen.getByDisplayValue('0.1')).toBeInTheDocument(); // Default units value
    expect(screen.getByText('Market order')).toBeInTheDocument();
    expect(screen.getByText(/Crypto/)).toBeInTheDocument();
  });
  
  test('updates units input value', async () => {
    render(
      <TradeForm
        action="buy"
        asset={mockAsset}
        currentPrice={50000}
        isLoading={false}
        isExecuting={false}
        marketIsOpen={true}
        onSubmit={mockOnSubmit}
        availableFunds={10000}
      />
    );
    
    const unitsInput = screen.getByDisplayValue('0.1');
    await userEvent.clear(unitsInput);
    await userEvent.type(unitsInput, '0.5');
    
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
  });
  
  test('disables buttons when isExecuting is true', () => {
    render(
      <TradeForm
        action="buy"
        asset={mockAsset}
        currentPrice={50000}
        isLoading={false}
        isExecuting={true}
        marketIsOpen={true}
        onSubmit={mockOnSubmit}
        availableFunds={10000}
      />
    );
    
    expect(screen.getByRole('button', { name: /Buy/i })).toBeDisabled();
  });
  
  test('calls onSubmit with correct values when form is submitted', async () => {
    render(
      <TradeForm
        action="buy"
        asset={mockAsset}
        currentPrice={50000}
        isLoading={false}
        isExecuting={false}
        marketIsOpen={true}
        onSubmit={mockOnSubmit}
        availableFunds={10000}
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /Buy/i });
    await userEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('0.1', 'market', expect.any(Array));
  });
  
  test('shows stop loss settings when stop loss checkbox is checked', async () => {
    render(
      <TradeForm
        action="buy"
        asset={mockAsset}
        currentPrice={50000}
        isLoading={false}
        isExecuting={false}
        marketIsOpen={true}
        onSubmit={mockOnSubmit}
        availableFunds={10000}
      />
    );
    
    const stopLossCheckbox = screen.getByLabelText(/Stop Loss/i);
    await userEvent.click(stopLossCheckbox);
    
    // Check if stop loss settings appear in the form
    expect(screen.getByText(/Close rate/i)).toBeInTheDocument();
  });
});
