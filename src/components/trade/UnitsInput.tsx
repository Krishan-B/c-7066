
import { Input } from "@/components/ui/input";

interface UnitsInputProps {
  units: string;
  setUnits: (value: string) => void;
  isExecuting: boolean;
  requiredFunds?: number;
  canAfford?: boolean;
  availableFunds?: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const UnitsInput = ({
  units,
  setUnits,
  isExecuting,
  requiredFunds = 0,
  canAfford = true,
  availableFunds = 0,
  value,
  onChange,
  disabled
}: UnitsInputProps) => {
  // Use either the new prop pattern or the old one
  const inputValue = value || units;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setUnits(newValue);
    }
  };
  
  return (
    <div>
      <label htmlFor="units" className="text-sm font-medium block mb-1">
        Units
      </label>
      <Input
        id="units"
        type="number"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter units"
        className="w-full"
        disabled={disabled !== undefined ? disabled : isExecuting}
        step="0.01"
      />
      <div className="flex justify-between mt-1">
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => handleChange({ target: { value: "0.1" } } as React.ChangeEvent<HTMLInputElement>)}
        >
          0.1
        </button>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => handleChange({ target: { value: "1" } } as React.ChangeEvent<HTMLInputElement>)}
        >
          1
        </button>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => handleChange({ target: { value: "10" } } as React.ChangeEvent<HTMLInputElement>)}
        >
          10
        </button>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => handleChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>)}
        >
          100
        </button>
      </div>
      {requiredFunds > 0 && (
        <>
          <div className="text-xs text-muted-foreground mt-2">
            Funds required to open the position: <span className={`font-medium ${!canAfford ? 'text-red-500' : ''}`}>${requiredFunds.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Available: <span className="font-medium">${availableFunds.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
};
