
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RememberMeCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const RememberMeCheckbox = ({ checked, onCheckedChange }: RememberMeCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="remember-me" 
        checked={checked} 
        onCheckedChange={checked => {
          if (typeof checked === 'boolean') {
            onCheckedChange(checked);
          }
        }} 
      />
      <Label htmlFor="remember-me" className="text-sm font-normal">
        Remember me
      </Label>
    </div>
  );
};

export default RememberMeCheckbox;
