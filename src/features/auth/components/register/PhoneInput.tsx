
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  error?: string;
}

const PhoneInput = ({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  error
}: PhoneInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone-number">Phone Number</Label>
      <div className="flex">
        <Select
          value={countryCode}
          onValueChange={onCountryCodeChange}
        >
          <SelectTrigger 
            className="w-[100px] rounded-r-none"
          >
            <SelectValue>{countryCode}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {countries.map(c => (
              <SelectItem key={c.code} value={c.dialCode}>
                {c.dialCode} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input 
          id="phone-number" 
          type="tel" 
          placeholder="1234567890" 
          value={phoneNumber} 
          onChange={e => onPhoneNumberChange(e.target.value)}
          className={`flex-1 rounded-l-none ${error ? "border-destructive" : ""}`}
        />
      </div>
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
