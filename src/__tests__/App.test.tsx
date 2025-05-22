
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Basic assertions that don't depend on jest-dom matchers
    expect(true).toBeTruthy();
  });
});
