import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateSignIn } from '../utils/validation';
import { signInWithEmail } from '@/utils/auth';
import PasswordResetDialog from './PasswordResetDialog';

// Import our components
import EmailField from './login/EmailField';
import PasswordField from './login/PasswordField';
import RememberMeCheckbox from './login/RememberMeCheckbox';
import LoginButton from './login/LoginButton';
import ErrorAlert from './login/ErrorAlert';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const errors = validateSignIn(email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const { session, error } = await signInWithEmail(email, password);

      if (error) {
        setFormError(isErrorWithMessage(error) ? error.message : 'Login failed');
        return;
      }

      if (session) {
        // Navigate programmatically instead of forcing a page reload
        navigate('/dashboard', { replace: true });
      }
    } catch (error: unknown) {
      setFormError(isErrorWithMessage(error) ? error.message : 'Unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorAlert message={formError} />

      <form onSubmit={handleSignIn} className="space-y-4" role="form">
        <EmailField
          email={email}
          onChange={setEmail}
          error={fieldErrors.email}
          id="login-email"
          data-testid="login-email"
        />

        <PasswordField
          password={password}
          onChange={setPassword}
          error={fieldErrors.password}
          showForgotPassword={true}
          onForgotPasswordClick={() => setResetPasswordOpen(true)}
          id="login-password"
          data-testid="login-password"
        />

        <RememberMeCheckbox checked={rememberMe} onCheckedChange={setRememberMe} />

        <LoginButton loading={loading} />
      </form>

      <PasswordResetDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} />
    </>
  );
};

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

export default LoginForm;
