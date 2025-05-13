
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  email: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  placeholder?: string;
}

const EmailField = ({
  email,
  onChange,
  error,
  id = "signin-email",
  placeholder = "your.email@example.com"
}: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Email</Label>
      <Input 
        id={id} 
        type="email" 
        placeholder={placeholder} 
        value={email} 
        onChange={e => onChange(e.target.value)} 
        className={error ? "border-destructive" : ""}
      />
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
};

export default EmailField;
