import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailFieldProps extends React.ComponentPropsWithoutRef<'input'> {
  email: string;
  onChange: (value: string) => void;
  error?: string;
}

const EmailField = ({
  email,
  onChange,
  error,
  id = 'signin-email',
  placeholder = 'your.email@example.com',
  ...rest
}: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Email</Label>
      <Input
        id={id}
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-destructive' : ''}
        {...rest}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default EmailField;
