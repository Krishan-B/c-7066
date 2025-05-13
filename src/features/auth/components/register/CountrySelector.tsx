
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { countries } from "@/lib/countries";

interface CountrySelectorProps {
  country: string;
  onChange: (value: string) => void;
  error?: string;
}

const CountrySelector = ({ country, onChange, error }: CountrySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="country">Country</Label>
      <Select
        value={country}
        onValueChange={onChange}
      >
        <SelectTrigger 
          id="country"
          className={error ? "border-destructive" : ""}
        >
          <SelectValue placeholder="Select your country" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {countries.map(c => (
            <SelectItem key={c.code} value={c.code}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
};

export default CountrySelector;
