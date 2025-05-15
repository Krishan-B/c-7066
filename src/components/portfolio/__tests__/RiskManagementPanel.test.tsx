
import React from 'react';
import { render, screen } from '@/utils/test-utils';
import RiskManagementPanel from '../RiskManagementPanel';
import { jest, expect, describe, test } from '@jest/globals';

describe('RiskManagementPanel', () => {
  test('renders with safe status', () => {
    render(
      <RiskManagementPanel 
        marginLevel={150} 
        equity={10000} 
        usedMargin={6000} 
        marginStatus="safe" 
      />
    );
    
    expect(screen.getByText('Risk Management')).toBeInTheDocument();
    expect(screen.getByText('Margin Level: 150.00%')).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    expect(screen.getByText('$6,000.00')).toBeInTheDocument();
    expect(screen.getByText(/Your account has a healthy margin level/)).toBeInTheDocument();
  });

  test('renders with warning status', () => {
    render(
      <RiskManagementPanel 
        marginLevel={100} 
        equity={10000} 
        usedMargin={10000} 
        marginStatus="warning" 
      />
    );
    
    expect(screen.getByText('CAUTION:')).toBeInTheDocument();
  });

  test('renders with danger status', () => {
    render(
      <RiskManagementPanel 
        marginLevel={60} 
        equity={6000} 
        usedMargin={10000} 
        marginStatus="danger" 
      />
    );
    
    expect(screen.getByText('MARGIN CALL:')).toBeInTheDocument();
  });

  test('renders with critical status', () => {
    render(
      <RiskManagementPanel 
        marginLevel={30} 
        equity={3000} 
        usedMargin={10000} 
        marginStatus="critical" 
      />
    );
    
    expect(screen.getByText('IMMEDIATE ACTION REQUIRED:')).toBeInTheDocument();
  });

  test('tooltip appears with correct content', async () => {
    render(
      <RiskManagementPanel 
        marginLevel={150} 
        equity={10000} 
        usedMargin={6000} 
        marginStatus="safe" 
      />
    );
    
    // Check that the tooltip trigger has the right class
    expect(screen.getByText('150.00%')).toHaveClass('underline');
  });
});
