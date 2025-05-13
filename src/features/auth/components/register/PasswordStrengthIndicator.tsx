
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { type PasswordStrength } from "../../hooks/usePasswordStrength";

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword: string;
  passwordStrength: number;
  getPasswordStrengthLabel: () => string;
  getPasswordStrengthColor: () => string;
  feedback?: string[];
}

const PasswordStrengthIndicator = ({
  password,
  confirmPassword,
  passwordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  feedback = []
}: PasswordStrengthIndicatorProps) => {
  if (!password) return null;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>Password strength:</span>
        <span className={
          passwordStrength <= 40 ? "text-destructive" :
          passwordStrength <= 80 ? "text-warning" :
          "text-success"
        }>
          {getPasswordStrengthLabel()}
        </span>
      </div>
      <Progress value={passwordStrength} className={getPasswordStrengthColor()} />
      
      {feedback && feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground mt-1 space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center">
              <X className="h-3 w-3 mr-1 text-destructive" /> {item}
            </li>
          ))}
        </ul>
      )}
      
      {password && confirmPassword && (
        <div className="flex items-center text-xs mt-1">
          {password === confirmPassword ? (
            <span className="flex items-center text-success">
              <Check className="h-3 w-3 mr-1" /> Passwords match
            </span>
          ) : (
            <span className="flex items-center text-destructive">
              <X className="h-3 w-3 mr-1" /> Passwords don't match
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
