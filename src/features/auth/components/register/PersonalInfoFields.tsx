
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  fieldErrors: Record<string, string>;
}

const PersonalInfoFields = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  fieldErrors
}: PersonalInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input 
          id="first-name" 
          type="text" 
          placeholder="John" 
          value={firstName} 
          onChange={e => onFirstNameChange(e.target.value)}
          className={fieldErrors.firstName ? "border-destructive" : ""}
        />
        {fieldErrors.firstName && (
          <p className="text-destructive text-sm">{fieldErrors.firstName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input 
          id="last-name" 
          type="text" 
          placeholder="Doe" 
          value={lastName} 
          onChange={e => onLastNameChange(e.target.value)}
          className={fieldErrors.lastName ? "border-destructive" : ""}
        />
        {fieldErrors.lastName && (
          <p className="text-destructive text-sm">{fieldErrors.lastName}</p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoFields;
