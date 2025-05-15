
import React from 'react';
import { render, screen } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import MarginCallAlert from '../MarginCallAlert';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

describe('MarginCallAlert', () => {
  const mockDismiss = jest.fn();
  const mockAddFunds = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when risk status is safe', () => {
    const { container } = render(
      <MarginCallAlert 
        marginLevel={150} 
        riskStatus="safe" 
        onDismiss={mockDismiss} 
        onAddFunds={mockAddFunds}
      />
    );
    
    expect(container).toBeEmptyDOMElement();
  });

  test('renders warning alert when risk status is warning', () => {
    render(
      <MarginCallAlert 
        marginLevel={100} 
        riskStatus="warning" 
        onDismiss={mockDismiss} 
        onAddFunds={mockAddFunds}
      />
    );
    
    expect(screen.getByText('Low Margin Level')).toBeInTheDocument();
    expect(screen.getByText(/100.00%/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Funds' })).toBeInTheDocument();
  });

  test('renders danger alert when risk status is danger', () => {
    render(
      <MarginCallAlert 
        marginLevel={60} 
        riskStatus="danger" 
        onDismiss={mockDismiss} 
        onAddFunds={mockAddFunds}
      />
    );
    
    expect(screen.getByText('Margin Call Warning')).toBeInTheDocument();
    expect(screen.getByText(/60.00%/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Funds' })).toBeInTheDocument();
  });

  test('renders critical alert when risk status is critical', () => {
    render(
      <MarginCallAlert 
        marginLevel={30} 
        riskStatus="critical" 
        onDismiss={mockDismiss} 
        onAddFunds={mockAddFunds}
      />
    );
    
    expect(screen.getByText('Critical Margin Level')).toBeInTheDocument();
    expect(screen.getByText(/30.00%/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Funds Now' })).toBeInTheDocument();
  });

  test('calls onDismiss when dismiss button is clicked', async () => {
    render(
      <MarginCallAlert 
        marginLevel={100} 
        riskStatus="warning" 
        onDismiss={mockDismiss} 
        onAddFunds={mockAddFunds}
      />
    );
    
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  test('calls onAddFunds when Add Funds button is clicked', async () => {
    render(
      <MarginCallAlert 
        marginLevel={100} 
        riskStatus="warning" 
        onDismiss={mockDismiss} 
        onAddFunds={mockAddFunds}
      />
    );
    
    await userEvent.click(screen.getByRole('button', { name: 'Add Funds' }));
    expect(mockAddFunds).toHaveBeenCalledTimes(1);
  });

  test('does not render buttons when handlers are not provided', () => {
    render(
      <MarginCallAlert 
        marginLevel={100} 
        riskStatus="warning"
      />
    );
    
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Funds' })).not.toBeInTheDocument();
  });
});
