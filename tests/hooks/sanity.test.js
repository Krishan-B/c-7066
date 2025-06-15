import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
describe('Sanity', () => {
    it('renders a simple element', () => {
        render(_jsx("div", { children: "Hello Test" }));
        expect(screen.getByText('Hello Test')).toBeInTheDocument();
    });
});
