
import { useEffect, useState } from "react";

export type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  feedback: string[];
};

export const usePasswordStrength = (password: string): PasswordStrength & {
  meetsMinimumRequirements: boolean;
  getPasswordStrengthLabel: () => string;
  getPasswordStrengthColor: () => string;
} => {
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "None",
    color: "bg-muted",
    feedback: []
  });
  
  useEffect(() => {
    // If no password, return default state
    if (!password) {
      setPasswordStrength({
        score: 0,
        label: "None",
        color: "bg-muted",
        feedback: []
      });
      return;
    }
    
    let strength = 0;
    const feedback: string[] = [];
    
    // Check password length
    if (password.length < 8) {
      feedback.push("Use at least 8 characters");
    } else {
      strength += 20;
    }
    
    // Contains number
    if (!/\d/.test(password)) {
      feedback.push("Add numbers");
    } else {
      strength += 20;
    }
    
    // Contains lowercase letter
    if (!/[a-z]/.test(password)) {
      feedback.push("Add lowercase letters");
    } else {
      strength += 20;
    }
    
    // Contains uppercase letter
    if (!/[A-Z]/.test(password)) {
      feedback.push("Add uppercase letters");
    } else {
      strength += 20;
    }
    
    // Contains special character
    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push("Add special characters");
    } else {
      strength += 20;
    }
    
    // Define strength label and color
    let label = "Weak";
    let color = "bg-destructive";
    
    if (strength > 80) {
      label = "Strong";
      color = "bg-success";
    } else if (strength > 40) {
      label = "Medium";
      color = "bg-warning";
    }
    
    // Set the password strength state
    setPasswordStrength({
      score: strength,
      label,
      color,
      feedback
    });
  }, [password]);

  // For backward compatibility
  const getPasswordStrengthLabel = () => passwordStrength.label;
  const getPasswordStrengthColor = () => passwordStrength.color;
  
  // Determine if password meets minimum requirements (useful for validation)
  const meetsMinimumRequirements = password.length >= 8 && 
    /\d/.test(password) && 
    /[a-z]/.test(password) && 
    (/[A-Z]/.test(password) || /[^a-zA-Z0-9]/.test(password));

  return { 
    ...passwordStrength, 
    meetsMinimumRequirements,
    getPasswordStrengthLabel,
    getPasswordStrengthColor,
  };
};
