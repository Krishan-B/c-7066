import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

describe('Sanity', () => {
  it('renders a simple element', () => {
    render(<div>Hello Test</div>);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});
