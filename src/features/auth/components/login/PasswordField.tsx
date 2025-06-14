import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PasswordFieldProps extends React.ComponentPropsWithoutRef<'input'> {
  password: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  showForgotPassword?: boolean;
  onForgotPasswordClick?: () => void;
}

const PasswordField = ({
  password,
  onChange,
  error,
  label = 'Password',
  id = 'signin-password',
  placeholder = '••••••••',
  showForgotPassword = false,
  onForgotPasswordClick,
  ...rest
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        {showForgotPassword && (
          <Button
            variant="link"
            type="button"
            className="p-0 h-auto text-sm"
            onClick={onForgotPasswordClick}
          >
            Forgot password?
          </Button>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={password}
          onChange={(e) => onChange(e.target.value)}
          className={error ? 'border-destructive pr-10' : 'pr-10'}
          {...rest}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-1"
          onClick={() => setShowPassword(!showPassword)}
          aria-label="toggle password visibility"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default PasswordField;
