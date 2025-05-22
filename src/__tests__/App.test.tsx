
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Expect the app to be in the document
    expect(document.body).toBeInTheDocument();
  });
});
