import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateSignUp } from '../utils/validation';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import { signUpWithEmail } from '@/utils/auth/authUtils';

// Import our components
import PersonalInfoFields from './register/PersonalInfoFields';
import CountrySelector from './register/CountrySelector';
import PhoneInput from './register/PhoneInput';
import EmailField from './login/EmailField';
import PasswordField from './login/PasswordField';
import PasswordStrengthIndicator from './register/PasswordStrengthIndicator';
import SignUpButton from './register/SignUpButton';
import ErrorAlert from './login/ErrorAlert';

const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { score, getPasswordStrengthLabel, getPasswordStrengthColor, feedback } =
    usePasswordStrength(password);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const errors = validateSignUp(
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      password,
      confirmPassword
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const formattedPhoneNumber = phoneNumber ? `${countryCode}${phoneNumber}` : '';

      const { error } = await signUpWithEmail(email, password, {
        first_name: firstName,
        last_name: lastName,
        country: country,
        phone_number: formattedPhoneNumber,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      toast({
        title: 'Account created successfully',
        description: 'Please check your email for verification and then log in',
      });

      // Use navigate instead of window.location to avoid full page reload
      navigate('/auth');
    } catch (error) {
      setFormError('Unexpected error occurred');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorAlert message={formError} />

      <form onSubmit={handleSignUp} className="space-y-4">
        <PersonalInfoFields
          firstName={firstName}
          lastName={lastName}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          fieldErrors={fieldErrors}
        />

        <CountrySelector country={country} onChange={setCountry} error={fieldErrors.country} />

        <PhoneInput
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          onCountryCodeChange={setCountryCode}
          onPhoneNumberChange={setPhoneNumber}
          error={fieldErrors.phoneNumber}
        />

        <EmailField
          email={email}
          onChange={setEmail}
          error={fieldErrors.email}
          id="register-email"
          data-testid="register-email"
        />

        <div className="space-y-2">
          <PasswordField
            password={password}
            onChange={setPassword}
            error={fieldErrors.password}
            id="register-password"
            data-testid="register-password"
          />

          {password && (
            <PasswordStrengthIndicator
              password={password}
              confirmPassword={confirmPassword}
              passwordStrength={score}
              getPasswordStrengthLabel={getPasswordStrengthLabel}
              getPasswordStrengthColor={getPasswordStrengthColor}
              feedback={feedback}
            />
          )}
        </div>

        <PasswordField
          password={confirmPassword}
          onChange={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          label="Confirm Password"
          id="register-confirm-password"
          data-testid="register-confirm-password"
        />

        <SignUpButton loading={loading} />
      </form>
    </>
  );
};

export default RegisterForm;
