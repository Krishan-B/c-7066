import { useEffect, useState } from 'react';

export type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  feedback: string[];
};

export const usePasswordStrength = (
  password: string
): PasswordStrength & {
  meetsMinimumRequirements: boolean;
  getPasswordStrengthLabel: () => string;
  getPasswordStrengthColor: () => string;
} => {
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'None',
    color: 'bg-muted',
    feedback: [],
  });
  useEffect(() => {
    // Handle null, undefined, empty, or whitespace-only password
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      setPasswordStrength({
        score: 0,
        label: 'None',
        color: 'bg-muted',
        feedback: [],
      });
      return;
    }

    let strength = 0;
    const feedback: string[] = [];
    const trimmed = password.trim();

    // Check password length (ignore whitespace-only)
    if (trimmed.length < 8) {
      feedback.push('Use at least 8 characters');
    } else {
      strength += 20;
    }

    // Contains number
    if (!/\d/.test(trimmed)) {
      feedback.push('Add numbers');
    } else {
      strength += 20;
    }

    // Contains lowercase letter
    if (!/[a-z]/.test(trimmed)) {
      feedback.push('Add lowercase letters');
    } else {
      strength += 20;
    }

    // Contains uppercase letter
    if (!/[A-Z]/.test(trimmed)) {
      feedback.push('Add uppercase letters');
    } else {
      strength += 20;
    }

    // Contains special character
    if (!/[^a-zA-Z0-9]/.test(trimmed)) {
      feedback.push('Add special characters');
    } else {
      strength += 20;
    }

    // Define strength label and color
    let label = 'Weak';
    let color = 'bg-destructive';

    if (strength > 80) {
      label = 'Strong';
      color = 'bg-success';
    } else if (strength > 40) {
      label = 'Medium';
      color = 'bg-warning';
    }

    setPasswordStrength({
      score: strength,
      label,
      color,
      feedback,
    });
  }, [password]);

  const getPasswordStrengthLabel = () => passwordStrength.label;
  const getPasswordStrengthColor = () => passwordStrength.color;
  // Determine if password meets minimum requirements (ignore whitespace-only)
  const meetsMinimumRequirements =
    typeof password === 'string' &&
    password.trim().length >= 8 &&
    /\d/.test(password.trim()) &&
    /[a-z]/.test(password.trim()) &&
    (/[A-Z]/.test(password.trim()) || /[^a-zA-Z0-9]/.test(password.trim()));

  return {
    ...passwordStrength,
    meetsMinimumRequirements,
    getPasswordStrengthLabel,
    getPasswordStrengthColor,
  };
};
