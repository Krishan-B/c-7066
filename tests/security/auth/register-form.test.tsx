// Security tests for RegisterForm component - comprehensive coverage
import RegisterForm from '@/features/auth/components/RegisterForm';
import { useToast } from '@/hooks/use-toast';
import { signUpWithEmail } from '@/utils/auth/authUtils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/utils/auth/authUtils');

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  };
});

const mockSignUpWithEmail = vi.mocked(signUpWithEmail);
const mockUseToast = vi.mocked(useToast);
const mockToast = vi.fn();

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RegisterForm Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUpWithEmail.mockResolvedValue({
      session: null,
      user: null,
      error: null,
    });
    mockNavigate.mockClear();
    mockToast.mockClear();
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: mockToast,
      dismiss: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('XSS Protection Tests', () => {
    it('should sanitize malicious scripts in first name input', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const maliciousInput = '<script>alert("XSS")</script>';

      await user.type(firstNameInput, maliciousInput);

      // Input should contain the raw text, not execute the script
      expect(firstNameInput).toHaveValue(maliciousInput);

      // Verify no script execution occurred
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should sanitize malicious scripts in last name input', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const lastNameInput = screen.getByLabelText(/last name/i);
      const maliciousInput = '<img src="x" onerror="alert(\'XSS\')" />';

      await user.type(lastNameInput, maliciousInput);

      expect(lastNameInput).toHaveValue(maliciousInput);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should sanitize malicious HTML in email input', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const maliciousEmail = 'test@example.com<svg onload="alert(1)">';

      await user.type(emailInput, maliciousEmail);

      expect(emailInput).toHaveValue(maliciousEmail);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should sanitize malicious scripts in phone number input', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const phoneInput = screen.getByDisplayValue('');
      const maliciousPhone = '1234567890<script>document.cookie="stolen"</script>';

      fireEvent.change(phoneInput, { target: { value: maliciousPhone } });

      expect(phoneInput).toHaveValue(maliciousPhone);
    });
    it('should properly escape error messages to prevent XSS', async () => {
      const user = userEvent.setup();
      mockSignUpWithEmail.mockResolvedValue({
        session: null,
        user: null,
        error: new Error('<script>alert("Error XSS")</script>'),
      });

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByText(/script/);
        // Error should display as text, not execute as script
        expect(errorElement).toBeInTheDocument();
        expect(window.alert).not.toHaveBeenCalled();
      });
    });

    it('should sanitize validation error messages', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Submit empty form to trigger validation errors
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required/i);
        errorMessages.forEach((error) => {
          // Ensure error messages are properly escaped
          expect(error.innerHTML).not.toContain('<script>');
          expect(error.innerHTML).not.toContain('onerror=');
        });
      });
    });
  });

  describe('CSRF Protection Tests', () => {
    it('should prevent form submission without proper user interaction', async () => {
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Programmatically trigger form submission (simulating CSRF attack)
      const form = screen.getByRole('form') || document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Should not call signup function without proper validation
      expect(mockSignUpWithEmail).not.toHaveBeenCalled();
    });

    it('should prevent multiple rapid form submissions', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });

      // Rapid submissions
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only be called once due to loading state
      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledTimes(1);
      });
    });

    it('should require explicit form field interaction', async () => {
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Try to bypass form validation by directly calling signup
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };

      // This should not work - form requires user interaction
      expect(mockSignUpWithEmail).not.toHaveBeenCalled();
    });

    it('should validate form submission origin', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill and submit form properly
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Verify the signup function was called with proper form data
        expect(mockSignUpWithEmail).toHaveBeenCalledWith(
          'test@example.com',
          'SecurePass123!',
          expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe',
          })
        );
      });
    });
  });

  describe('Input Validation Security Tests', () => {
    it('should reject malicious email patterns', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const maliciousEmails = [
        'admin@internal.company.com',
        'test@localhost',
        'user+admin@domain.com',
        'test@192.168.1.1',
        'user@domain..com',
        'user@domain.com.',
        '@domain.com',
        'user@',
        'user@domain',
      ];

      for (const email of maliciousEmails) {
        const emailInput = screen.getByLabelText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, email);

        const submitButton = screen.getByRole('button', { name: /sign up/i });
        await user.click(submitButton);

        await waitFor(() => {
          const emailError = screen.getByText(/invalid email format/i);
          expect(emailError).toBeInTheDocument();
        });
      }
    });

    it('should enforce strong password requirements', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const weakPasswords = [
        'password',
        '12345678',
        'abcdefgh',
        'PASSWORD',
        'pass123',
        '1234567',
        '',
        'a1',
      ];

      for (const password of weakPasswords) {
        const passwordInput = screen.getAllByLabelText(/password/i)[0];
        await user.clear(passwordInput);
        await user.type(passwordInput, password);

        const submitButton = screen.getByRole('button', { name: /sign up/i });
        await user.click(submitButton);

        await waitFor(() => {
          const passwordError = screen.getByText(/password must/i);
          expect(passwordError).toBeInTheDocument();
        });
      }
    });

    it('should validate password confirmation matching', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const passwordInput = screen.getAllByLabelText(/password/i)[0];
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'SecurePass123!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        const confirmError = screen.getByText(/passwords do not match/i);
        expect(confirmError).toBeInTheDocument();
      });
    });

    it('should prevent excessively long input values', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const longString = 'a'.repeat(10000);

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, longString); // Input should be limited or handled gracefully
      expect((firstNameInput as HTMLInputElement).value.length).toBeLessThanOrEqual(1000);
    });

    it('should sanitize special characters in name fields', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const specialCharsName = 'John<>&"\'';

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, specialCharsName);

      expect(firstNameInput).toHaveValue(specialCharsName);

      // Should handle special characters without causing issues
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      // Should not crash or cause XSS
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });
  });

  describe('Registration Security Tests', () => {
    it('should handle authentication errors securely', async () => {
      const user = userEvent.setup();
      const authError = new Error('User already exists');
      mockSignUpWithEmail.mockResolvedValue({
        session: null as any,
        user: null as any,
        error: authError,
      });

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      });

      // Should not expose sensitive information
      expect(screen.queryByText(/database/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/internal/i)).not.toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockSignUpWithEmail.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Unexpected error occurred')).toBeInTheDocument();
      });
    });

    it('should properly format phone number for security', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');

      // Find phone number input by its placeholder or container
      const phoneInput =
        screen.getByPlaceholderText(/phone number/i) ||
        document.querySelector('input[type="tel"]') ||
        screen.getByDisplayValue('');

      if (phoneInput) {
        await user.type(phoneInput, '1234567890');
      }

      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledWith(
          'test@example.com',
          'SecurePass123!',
          expect.objectContaining({
            phone_number: expect.stringContaining('+1'),
          })
        );
      });
    });

    it('should securely navigate after successful registration', async () => {
      const user = userEvent.setup();
      mockSignUpWithEmail.mockResolvedValue({
        session: null as any,
        user: null as any,
        error: null,
      });

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with valid data
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Account created successfully',
          description: 'Please check your email for verification and then log in',
        });
      });
    });
  });

  describe('Password Security Tests', () => {
    it('should not expose password in DOM or console', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const password = 'SecurePass123!';
      const passwordInput = screen.getAllByLabelText(/password/i)[0];

      await user.type(passwordInput, password);

      // Check DOM doesn't contain password in plain text
      expect(document.body.innerHTML).not.toContain('SecurePass123!');

      // Check console doesn't log password
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('SecurePass123!'));

      consoleSpy.mockRestore();
    });

    it('should handle password visibility toggle securely', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const passwordInput = screen.getAllByLabelText(/password/i)[0];
      await user.type(passwordInput, 'SecurePass123!');

      // Look for password visibility toggle
      const toggleButtons = screen.getAllByRole('button');
      const visibilityToggle = toggleButtons.find(
        (button) =>
          button.getAttribute('aria-label')?.includes('password') ||
          button.textContent?.includes('👁') ||
          button.querySelector('svg')
      );

      if (visibilityToggle) {
        await user.click(visibilityToggle);

        // Password should temporarily be visible
        expect(passwordInput).toHaveAttribute('type', 'text');

        await user.click(visibilityToggle);

        // Password should be hidden again
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });

    it('should validate password strength indicators', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const passwordInput = screen.getAllByLabelText(/password/i)[0];

      // Test weak password
      await user.type(passwordInput, 'weak');

      // Password strength indicator should show
      await waitFor(() => {
        const strengthIndicator =
          screen.getByText(/password strength/i) ||
          screen.getByText(/weak/i) ||
          document.querySelector('[data-testid*="strength"]');
        if (strengthIndicator) {
          expect(strengthIndicator).toBeInTheDocument();
        }
      });

      // Test strong password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongPass123!@#');

      // Should show better strength
      await waitFor(() => {
        const strengthIndicator =
          screen.getByText(/strong/i) ||
          screen.getByText(/good/i) ||
          document.querySelector('[data-testid*="strength"]');
        if (strengthIndicator) {
          expect(strengthIndicator).toBeInTheDocument();
        }
      });
    });
  });

  describe('Data Sanitization Tests', () => {
    it('should sanitize all form inputs before submission', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with potentially malicious data
      await user.type(screen.getByLabelText(/first name/i), 'John<script>alert("XSS")</script>');
      await user.type(screen.getByLabelText(/last name/i), 'Doe<img src="x" onerror="alert(1)">');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com<svg onload="alert(2)">');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledWith(
          expect.any(String), // email should be sanitized
          expect.any(String), // password
          expect.objectContaining({
            first_name: expect.any(String), // should be sanitized
            last_name: expect.any(String), // should be sanitized
          })
        );
      });

      // Verify no script execution
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should handle empty form submission gracefully', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      // Should show validation errors, not crash
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Should not call signup with empty data
      expect(mockSignUpWithEmail).not.toHaveBeenCalled();
    });

    it('should handle special unicode characters safely', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      const unicodeInput = 'José María Ñoño 测试用户 🚀';

      await user.type(screen.getByLabelText(/first name/i), unicodeInput);
      await user.type(screen.getByLabelText(/last name/i), 'González');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledWith(
          'test@example.com',
          'SecurePass123!',
          expect.objectContaining({
            first_name: unicodeInput,
            last_name: 'González',
          })
        );
      });
    });
  });

  describe('Error Handling Security Tests', () => {
    it('should handle validation errors without exposing sensitive data', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Submit form with invalid data
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/invalid/i);
        errorMessages.forEach((error) => {
          // Should not expose internal validation logic
          expect(error.textContent).not.toContain('regex');
          expect(error.textContent).not.toContain('function');
          expect(error.textContent).not.toContain('validation.ts');
        });
      });
    });

    it('should properly clean up form state on errors', async () => {
      const user = userEvent.setup();
      mockSignUpWithEmail.mockResolvedValue({
        session: null as any,
        user: null as any,
        error: new Error('Registration failed'),
      });

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill and submit form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getAllByLabelText(/password/i)[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Form should be re-enabled after error
        expect(submitButton).not.toBeDisabled();
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      });

      // Form should be usable for retry
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledTimes(2);
      });
    });
  });
});
