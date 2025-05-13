
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword: string;
  passwordStrength: number;
  getPasswordStrengthLabel: () => string;
  getPasswordStrengthColor: () => string;
}

const PasswordStrengthIndicator = ({
  password,
  confirmPassword,
  passwordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor
}: PasswordStrengthIndicatorProps) => {
  if (!password) return null;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>Password strength:</span>
        <span className={
          passwordStrength <= 25 ? "text-destructive" :
          passwordStrength <= 75 ? "text-warning" :
          "text-success"
        }>
          {getPasswordStrengthLabel()}
        </span>
      </div>
      <Progress value={passwordStrength} className={getPasswordStrengthColor()} />
      
      {password && confirmPassword && password === confirmPassword && (
        <div className="flex items-center text-success text-xs mt-1">
          <Check className="h-3 w-3 mr-1" /> Passwords match
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
